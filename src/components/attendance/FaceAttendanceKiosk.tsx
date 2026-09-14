import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Calendar,
  XCircle,
} from 'lucide-react';
import { Student, Subject, TimetableSlot, AttendanceRecord } from '../../types';
import { FaceBiometricEngine, FaceDetectionResult, MatchResult } from '../../services/faceRecognition';
import { markAttendance, checkDuplicateAttendance } from '../../services/studentService';

interface FaceAttendanceKioskProps {
  students: Student[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  onAttendanceMarked: (record: AttendanceRecord) => void;
}

export const FaceAttendanceKiosk: React.FC<FaceAttendanceKioskProps> = ({
  students,
  subjects,
  timetable,
  onAttendanceMarked,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Selected subject & session for marking
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM - 10:00 AM');

  // Engine state
  const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('Ready to scan');
  const [recentMarks, setRecentMarks] = useState<Array<{ name: string; roll: string; time: string; status: string }>>([]);

  // Manual fallback modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState<string>(students[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<'Present' | 'Late' | 'Absent'>('Present');
  const [manualRemark, setManualRemark] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FaceBiometricEngine>(new FaceBiometricEngine());
  const scanIntervalRef = useRef<any>(null);
  const isMarkingRef = useRef<boolean>(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Start / Stop Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        engineRef.current.resetLiveness();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please verify browser camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Continuous Video Scan Loop
  useEffect(() => {
    if (!cameraActive) return;

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isMarkingRef.current) return;

      const analysis = engineRef.current.analyzeFrame(videoRef.current, canvasRef.current);
      setDetectionResult(analysis);

      if (analysis.detected && analysis.livenessPassed && analysis.descriptor) {
        // Face detected and liveness verified -> match against registered students
        const match = engineRef.current.matchStudent(analysis.descriptor, students, 0.76);
        setMatchResult(match);

        if (match.matched && match.student) {
          // Trigger automated attendance registration
          await handleAutoAttendance(match.student, match.confidencePercent);
        } else {
          setProcessingStatus('Face not recognized in student registry');
        }
      } else if (analysis.detected) {
        setProcessingStatus(analysis.feedbackMessage);
        setMatchResult(null);
      } else {
        setProcessingStatus('Position face inside the scanning guide');
        setMatchResult(null);
      }
    }, 180);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [cameraActive, students, selectedSubjectId, selectedSlot]);

  // Handle automated attendance
  const handleAutoAttendance = async (student: Student, confidence: number) => {
    if (isMarkingRef.current) return;
    isMarkingRef.current = true;

    const todayDate = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setProcessingStatus(`Recognized: ${student.name} (${confidence}%). Marking attendance...`);

    const record: Omit<AttendanceRecord, 'id'> = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      subjectId: selectedSubject.id,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      date: todayDate,
      time: nowTime,
      status: 'Present',
      method: 'face',
      sessionSlot: selectedSlot,
      confidence,
      timestamp: Date.now(),
    };

    const res = await markAttendance(record);

    if (res.success) {
      setProcessingStatus(`✅ Attendance Recorded: ${student.name}`);
      onAttendanceMarked({ ...record, id: res.id || `att-${Date.now()}` });
      setRecentMarks(prev => [
        { name: student.name, roll: student.rollNumber, time: nowTime, status: 'Present (Face)' },
        ...prev.slice(0, 7),
      ]);
    } else {
      setProcessingStatus(`⚠️ ${res.message}`);
    }

    // Cooldown before next scan
    setTimeout(() => {
      engineRef.current.resetLiveness();
      isMarkingRef.current = false;
      setProcessingStatus('Ready for next student');
    }, 2800);
  };

  // Manual fallback attendance handler
  const handleManualSubmit = async () => {
    const student = students.find(s => s.id === manualStudentId);
    if (!student) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const record: Omit<AttendanceRecord, 'id'> = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      subjectId: selectedSubject.id,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      date: todayDate,
      time: nowTime,
      status: manualStatus,
      method: 'manual',
      sessionSlot: selectedSlot,
      remark: manualRemark || 'Manual entry by faculty admin',
      timestamp: Date.now(),
    };

    const res = await markAttendance(record);
    if (res.success) {
      onAttendanceMarked({ ...record, id: res.id || `att-${Date.now()}` });
      setRecentMarks(prev => [
        { name: student.name, roll: student.rollNumber, time: nowTime, status: `${manualStatus} (Manual)` },
        ...prev.slice(0, 7),
      ]);
      setManualModalOpen(false);
      setManualRemark('');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Face Recognition Attendance Kiosk
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Liveness Guard Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated biometric check-in terminal with instant duplicate prevention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-manual-attendance-fallback"
              onClick={() => setManualModalOpen(true)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Manual Override Entry
            </button>

            {cameraActive ? (
              <button
                id="btn-stop-camera"
                onClick={stopCamera}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                <CameraOff className="h-4 w-4" />
                Stop Camera
              </button>
            ) : (
              <button
                id="btn-start-camera"
                onClick={startCamera}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Launch Terminal Camera
              </button>
            )}
          </div>
        </div>

        {/* Subject & Slot Selector */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Active Lecture / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name} ({sub.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Timetable Session Slot
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="09:00 AM - 10:00 AM">Slot 1: 09:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">Slot 2: 10:00 AM - 11:00 AM</option>
              <option value="11:15 AM - 12:15 PM">Slot 3: 11:15 AM - 12:15 PM</option>
              <option value="01:15 PM - 02:15 PM">Slot 4: 01:15 PM - 02:15 PM</option>
              <option value="02:15 PM - 03:15 PM">Slot 5: 02:15 PM - 03:15 PM</option>
              <option value="03:30 PM - 04:30 PM">Slot 6: 03:30 PM - 04:30 PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Terminal View: Camera Stage + Live Match Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Video Stage & HUD Guide (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner dark:border-slate-800">
            {/* Hidden canvas for video frame analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transform -scale-x-100 ${!cameraActive && 'hidden'}`}
            />

            {/* Inactive Camera State */}
            {!cameraActive && (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-200">Terminal Camera Standby</h3>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  Click 'Launch Terminal Camera' above to start automated student face scanning
                </p>
                {cameraError && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-950/70 border border-rose-800 px-3 py-2 text-xs text-rose-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Active Camera Overlay (HUD Crosshairs & Oval Target) */}
            {cameraActive && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4">
                {/* Top HUD Bar */}
                <div className="flex w-full items-center justify-between rounded-xl bg-slate-900/80 px-3.5 py-1.5 backdrop-blur-md text-[11px] text-white">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    SCANNING LIVE
                  </span>
                  <span className="font-mono text-slate-300">
                    Liveness: {detectionResult?.livenessScore || 0}%
                  </span>
                </div>

                {/* Center Oval Scanning Guide */}
                <div className="relative flex h-60 w-52 items-center justify-center rounded-[48%] border-2 border-dashed border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-colors">
                  {/* Corner Target Markers */}
                  <div className="absolute -top-2 -left-2 h-4 w-4 border-t-2 border-l-2 border-indigo-400" />
                  <div className="absolute -top-2 -right-2 h-4 w-4 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-indigo-400" />
                  <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-indigo-400" />

                  {/* Liveness Progress Ring */}
                  {detectionResult?.detected && (
                    <div
                      className={`absolute inset-0 rounded-[48%] border-2 transition-all duration-200 ${
                        detectionResult.livenessPassed
                          ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                          : 'border-amber-400/60'
                      }`}
                    />
                  )}
                </div>

                {/* Bottom HUD Feedback Message */}
                <div className="rounded-xl bg-slate-900/90 px-4 py-2 text-center text-xs font-medium text-white shadow-lg backdrop-blur-md">
                  {processingStatus}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recognition Match & Recent Logs (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Active Identified Student Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Biometric Identification
            </h3>

            {matchResult?.matched && matchResult.student ? (
              <div className="mt-3 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 animate-in fade-in zoom-in-95">
                <img
                  src={matchResult.student.avatarUrl}
                  alt={matchResult.student.name}
                  className="h-16 w-16 rounded-xl object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Face Match Verified</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {matchResult.student.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {matchResult.student.rollNumber} • {matchResult.student.department.split(' ')[0]}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                    Confidence: {matchResult.confidencePercent}% • Cosine Sim: {matchResult.similarity.toFixed(3)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 dark:border-slate-800">
                <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Awaiting Student Face
                </p>
                <p className="text-[11px] text-slate-400">
                  Student steps in front of the lens to identify and mark presence
                </p>
              </div>
            )}
          </div>

          {/* Recent Kiosk Check-in Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Check-in Stream
              </h3>
              <span className="text-[10px] text-slate-400">Today</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {recentMarks.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  No attendance marked in this kiosk session yet.
                </p>
              ) : (
                recentMarks.map((mark, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{mark.name}</p>
                      <p className="text-[11px] text-slate-500">{mark.roll}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {mark.status}
                      </span>
                      <p className="mt-0.5 text-[10px] text-slate-400">{mark.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Fallback Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Manual Attendance Override
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Student</label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Status</label>
                <div className="mt-1 flex gap-2">
                  {(['Present', 'Late', 'Absent'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setManualStatus(st)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                        manualStatus === st
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Remark / Justification</label>
                <input
                  type="text"
                  placeholder="e.g. Medical excuse, camera biometric unreadable"
                  value={manualRemark}
                  onChange={(e) => setManualRemark(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setManualModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
