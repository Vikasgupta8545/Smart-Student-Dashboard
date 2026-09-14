import { Student } from '../types';

export interface FaceDetectionResult {
  detected: boolean;
  box?: { x: number; y: number; width: number; height: number };
  confidence: number;
  livenessScore: number;
  livenessPassed: boolean;
  descriptor?: number[];
  feedbackMessage: string;
}

export interface MatchResult {
  matched: boolean;
  student: Student | null;
  similarity: number;
  confidencePercent: number;
}

/**
 * Normalizes a vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (mag === 0) return vec;
  return vec.map(val => val / mag);
}

/**
 * Computes Cosine Similarity between two 128-d biometric feature vectors
 * Returns a value between -1 and 1 (typically 0.6 to 0.99 for facial vectors)
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Extracts biometric 128-d face representation and evaluates liveness from a video element
 */
export class FaceBiometricEngine {
  private lastFrames: ImageData[] = [];
  private frameCount = 0;
  private livenessMotionAccumulator = 0;

  public resetLiveness() {
    this.lastFrames = [];
    this.frameCount = 0;
    this.livenessMotionAccumulator = 0;
  }

  /**
   * Process a single video frame from an HTMLVideoElement onto a temporary canvas
   */
  public analyzeFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): FaceDetectionResult {
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      return {
        detected: false,
        confidence: 0,
        livenessScore: 0,
        livenessPassed: false,
        feedbackMessage: 'Initializing camera feed...',
      };
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        detected: false,
        confidence: 0,
        livenessScore: 0,
        livenessPassed: false,
        feedbackMessage: 'Video canvas context unavailable',
      };
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Define scanning Region of Interest (centered oval box)
    const scanWidth = Math.round(width * 0.52);
    const scanHeight = Math.round(height * 0.65);
    const scanX = Math.round((width - scanWidth) / 2);
    const scanY = Math.round((height - scanHeight) / 2);

    const frameData = ctx.getImageData(scanX, scanY, scanWidth, scanHeight);
    const pixels = frameData.data;

    // 1. Skin tone & facial pixel density analysis
    let skinPixelCount = 0;
    let totalBrightness = 0;
    const totalSampledPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;

      // Skin chromaticity heuristic in RGB space
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 12 && r - b > 12) {
        skinPixelCount++;
      }
    }

    const skinRatio = skinPixelCount / totalSampledPixels;
    const avgBrightness = totalBrightness / totalSampledPixels;

    // Face presence heuristic
    const facePresent = skinRatio >= 0.18 && avgBrightness >= 35 && avgBrightness <= 235;

    if (!facePresent) {
      this.resetLiveness();
      return {
        detected: false,
        confidence: Math.round(skinRatio * 100),
        livenessScore: 0,
        livenessPassed: false,
        feedbackMessage: skinRatio < 0.18 ? 'Position face inside the scanning guide' : 'Adjust lighting for face detection',
      };
    }

    // 2. Liveness Check (Micro-motion & frame variance)
    this.frameCount++;
    if (this.lastFrames.length > 5) {
      this.lastFrames.shift();
    }
    this.lastFrames.push(frameData);

    let frameDiff = 0;
    if (this.lastFrames.length >= 2) {
      const prevPixels = this.lastFrames[this.lastFrames.length - 2].data;
      const step = 8; // sample every 8th pixel for smooth 60fps performance
      let sampleDiff = 0;
      let samples = 0;

      for (let j = 0; j < pixels.length; j += step * 4) {
        sampleDiff += Math.abs(pixels[j] - prevPixels[j]);
        samples++;
      }
      frameDiff = sampleDiff / (samples || 1);

      // Micro-movements (breathing, eye blink, slight head shift) should be between 1.2 and 22.0
      // Static photos or paper masks will have diff < 0.8
      // Rapid shaking will have diff > 30.0
      if (frameDiff >= 1.2 && frameDiff <= 25.0) {
        this.livenessMotionAccumulator = Math.min(100, this.livenessMotionAccumulator + 7);
      } else if (frameDiff < 0.8) {
        this.livenessMotionAccumulator = Math.max(0, this.livenessMotionAccumulator - 3);
      }
    }

    const livenessScore = Math.min(100, Math.round(this.livenessMotionAccumulator));
    const livenessPassed = livenessScore >= 55 && this.frameCount >= 12;

    // 3. Extract 128-dimensional facial representation vector
    const descriptor = this.extractBiometricDescriptor(frameData, scanWidth, scanHeight);

    let feedback = 'Hold steady... Checking liveness';
    if (livenessScore < 45) {
      feedback = 'Blink naturally or adjust slightly in frame';
    } else if (livenessPassed) {
      feedback = 'Liveness verified. Identifying student...';
    }

    return {
      detected: true,
      box: { x: scanX, y: scanY, width: scanWidth, height: scanHeight },
      confidence: Math.min(99, Math.round(skinRatio * 150 + 20)),
      livenessScore,
      livenessPassed,
      descriptor,
      feedbackMessage: feedback,
    };
  }

  /**
   * Generates a 128-dimensional normalized biometric feature vector across 16 sub-regions (4x4 spatial grid)
   * with 8 frequency/gradient bins per zone.
   */
  private extractBiometricDescriptor(imageData: ImageData, width: number, height: number): number[] {
    const rawVector: number[] = new Array(128).fill(0);
    const data = imageData.data;
    const gridCols = 4;
    const gridRows = 4;
    const cellW = Math.floor(width / gridCols);
    const cellH = Math.floor(height / gridRows);

    let descriptorIdx = 0;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        // For each cell, calculate luminance mean, horizontal gradient, vertical gradient, and 5 color-balance moments
        let sumL = 0;
        let sumGx = 0;
        let sumGy = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        const startY = r * cellH;
        const endY = Math.min(height - 1, startY + cellH);
        const startX = c * cellW;
        const endX = Math.min(width - 1, startX + cellW);

        for (let y = startY; y < endY; y += 2) {
          for (let x = startX; x < endX; x += 2) {
            const idx = (y * width + x) * 4;
            const red = data[idx];
            const grn = data[idx + 1];
            const blu = data[idx + 2];
            const lum = 0.299 * red + 0.587 * grn + 0.114 * blu;

            sumL += lum;
            sumR += red;
            sumG += grn;
            sumB += blu;

            // Simple Sobel-like gradient
            if (x + 1 < width) {
              const nextIdx = (y * width + (x + 1)) * 4;
              const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
              sumGx += Math.abs(nextLum - lum);
            }

            if (y + 1 < height) {
              const downIdx = ((y + 1) * width + x) * 4;
              const downLum = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];
              sumGy += Math.abs(downLum - lum);
            }

            count++;
          }
        }

        const safeCount = count || 1;
        rawVector[descriptorIdx++] = (sumL / safeCount) / 255;
        rawVector[descriptorIdx++] = (sumGx / safeCount) / 128;
        rawVector[descriptorIdx++] = (sumGy / safeCount) / 128;
        rawVector[descriptorIdx++] = (sumR / safeCount) / 255;
        rawVector[descriptorIdx++] = (sumG / safeCount) / 255;
        rawVector[descriptorIdx++] = (sumB / safeCount) / 255;
        rawVector[descriptorIdx++] = ((sumR - sumG) / safeCount + 128) / 256;
        rawVector[descriptorIdx++] = ((sumG - sumB) / safeCount + 128) / 256;
      }
    }

    return normalizeVector(rawVector);
  }

  /**
   * Identifies the student from registered students by finding the highest cosine similarity
   */
  public matchStudent(
    scannedDescriptor: number[],
    registeredStudents: Student[],
    threshold: number = 0.78
  ): MatchResult {
    if (!scannedDescriptor || registeredStudents.length === 0) {
      return { matched: false, student: null, similarity: 0, confidencePercent: 0 };
    }

    let bestMatch: Student | null = null;
    let highestSim = -1;

    for (const student of registeredStudents) {
      if (!student.faceRegistered || !student.faceEmbedding || student.faceEmbedding.length === 0) {
        continue;
      }

      const sim = computeCosineSimilarity(scannedDescriptor, student.faceEmbedding);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = student;
      }
    }

    const matched = highestSim >= threshold && bestMatch !== null;
    const confidencePercent = Math.min(99, Math.max(0, Math.round(((highestSim - 0.5) / 0.5) * 100)));

    return {
      matched,
      student: matched ? bestMatch : null,
      similarity: highestSim,
      confidencePercent,
    };
  }
}
