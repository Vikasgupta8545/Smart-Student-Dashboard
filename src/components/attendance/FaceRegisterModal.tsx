import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Student } from '../../types';
import { FaceBiometricEngine } from '../../services/faceRecognition';
import { registerStudentFace } from '../../services/studentService';

interface FaceRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onRegistered: () => void;
}

export const FaceRegisterModal: React.FC<FaceRegisterModalProps> = ({
  isOpen,
  onClose,
  student,
  onRegistered,
}) => {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Awaiting biometric consent confirmation');
  const [capturedVector, setCapturedVector] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FaceBiometricEngine>(new FaceBiometricEngine());
  const scanIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setConsentAccepted(false);
      setCapturedVector(null);
      setSuccess(false);
      setStatusMessage('Please read and accept the biometric consent notice below.');
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setStatusMessage('Look directly into the camera. Hold steady for scan...');
      }
    } catch (err) {
      setStatusMessage('Camera error: Unable to access video device.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
  };

  // Scanning loop
  useEffect(() => {
    if (!cameraActive) return;

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || capturedVector) return;

      const res = engineRef.current.analyzeFrame(videoRef.current, canvasRef.current);
      if (res.detected && res.livenessPassed && res.descriptor) {
        setCapturedVector(res.descriptor);
        setStatusMessage('Biometric feature vector successfully computed!');
        stopCamera();
      } else if (res.detected) {
        setStatusMessage(`Face detected (${res.confidence}%). Verifying liveness: ${res.livenessScore}%`);
      } else {
        setStatusMessage('Position face inside the oval scanning guide');
      }
    }, 200);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [cameraActive, capturedVector]);

  if (!isOpen || !student) return null;

  const handleSaveBiometrics = async () => {
    if (!capturedVector || !student) return;
    setSaving(true);
    try {
      await registerStudentFace(student.id, capturedVector);
      setSuccess(true);
      setTimeout(() => {
        onRegistered();
        onClose();
      }, 1500);
    } catch (e: any) {
      setStatusMessage(`Save error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Register Student Biometric Face ID
              </h3>
              <p className="text-xs text-slate-500">
                {student.name} ({student.rollNumber})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Biometric Consent Notice */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          <div className="flex items-center gap-2 font-bold">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>Biometric Privacy & Institutional Consent</span>
          </div>
          <p className="mt-1 leading-relaxed text-[11px]">
            Apex Institute uses client-side mathematical feature vectors (128-d descriptors).
            No raw biometric facial images or video footage are stored or published publicly. Data is strictly
            used for classroom attendance verification in accordance with campus data protection rules.
          </p>
          <label className="mt-2.5 flex items-center gap-2 cursor-pointer font-medium text-xs">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={e => {
                setConsentAccepted(e.target.checked);
                if (e.target.checked && !cameraActive && !capturedVector) {
                  startCamera();
                }
              }}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Student gives explicit consent for biometric registration</span>
          </label>
        </div>

        {/* Video Camera Scanning Area */}
        <div className="mt-4">
          <canvas ref={canvasRef} className="hidden" />

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transform -scale-x-100 ${!cameraActive && 'hidden'}`}
            />

            {!cameraActive && !capturedVector && (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
                <Camera className="h-10 w-10 text-slate-500" />
                <p className="mt-2 text-xs">Check the consent box above to open the registration camera</p>
              </div>
            )}

            {capturedVector && (
              <div className="flex h-full flex-col items-center justify-center bg-emerald-950/80 p-6 text-center text-emerald-200 animate-in fade-in">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <h4 className="mt-2 text-sm font-bold text-white">Biometric Profile Captured!</h4>
                <p className="text-xs text-emerald-300">128-dimensional embedding ready for encryption</p>
              </div>
            )}

            {cameraActive && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-40 rounded-[48%] border-2 border-dashed border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
              </div>
            )}
          </div>

          <p className="mt-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            {statusMessage}
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            Status: {student.faceRegistered ? 'Update existing face' : 'New registration'}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveBiometrics}
              disabled={!capturedVector || saving || success}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {saving ? 'Encrypting & Saving...' : success ? 'Registered!' : 'Register Face'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
