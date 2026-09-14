import React, { useState } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Calculator,
  Camera,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../../types';

interface StudentAttendanceViewProps {
  student: Student;
  subjects: Subject[];
  attendance: AttendanceRecord[];
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  student,
  subjects,
  attendance,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Interactive Simulator state
  const [simFutureClasses, setSimFutureClasses] = useState<number>(10);
  const [simAttendCount, setSimAttendCount] = useState<number>(8);

  const totalClasses = attendance.length || 1;
  const attendedCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const overallPercent = Math.round((attendedCount / totalClasses) * 100);

  // Filtered attendance history records
  const filteredRecords = attendance.filter(rec => {
    if (selectedSubjectFilter !== 'all' && rec.subjectId !== selectedSubjectFilter && rec.subjectCode !== selectedSubjectFilter) {
      return false;
    }
    if (methodFilter !== 'all' && rec.method !== methodFilter) {
      return false;
    }
    return true;
  });

  // Subject-wise stats calculation
  const subjectStats = subjects.map(sub => {
    const subRecords = attendance.filter(a => a.subjectId === sub.id || a.subjectCode === sub.code);
    const subTotal = subRecords.length > 0 ? subRecords.length : sub.totalClasses || 30;
    const subAttended = subRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const percent = subTotal > 0 ? Math.round((subAttended / subTotal) * 100) : 80;

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      faculty: sub.facultyName,
      total: subTotal,
      attended: subAttended,
      absent: subTotal - subAttended,
      percent,
      isShortage: percent < 75,
    };
  });

  // Simulated projected attendance
  const projectedTotal = totalClasses + simFutureClasses;
  const projectedAttended = attendedCount + simAttendCount;
  const projectedPercent = Math.round((projectedAttended / projectedTotal) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overall Attendance Rate
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overallPercent}%
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                overallPercent >= 75
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {overallPercent >= 75 ? 'Meets 75% Requirement' : 'Attendance Shortage'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total {totalClasses} classes conducted across all registered subjects
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Classes Attended vs Missed
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {attendedCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ {totalClasses} Classes</span>
          </div>
          <p className="mt-2 text-xs text-rose-500 font-medium">
            Missed {totalClasses - attendedCount} classes this semester
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Biometric Check-in Method
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Face Recognition Active
              </p>
              <p className="text-[11px] text-slate-500">
                {student.faceRegistered ? 'Biometrics registered & verified' : 'Face not registered'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 75% Rule Attendance Simulator */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 p-5 shadow-xs dark:border-indigo-950 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              75% Eligibility Projection Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate upcoming classes to plan your attendance trajectory
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
          <div className="space-y-3 md:col-span-8">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Upcoming Classes to Conduct:</span>
                <span className="font-bold text-indigo-600">{simFutureClasses} Classes</span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={simFutureClasses}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimFutureClasses(val);
                  if (simAttendCount > val) setSimAttendCount(val);
                }}
                className="mt-1 w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Classes You Plan to Attend:</span>
                <span className="font-bold text-emerald-600">{simAttendCount} Classes</span>
              </div>
              <input
                type="range"
                min={0}
                max={simFutureClasses}
                value={simAttendCount}
                onChange={(e) => setSimAttendCount(Number(e.target.value))}
                className="mt-1 w-full accent-emerald-600"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-800 md:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Projected Final Attendance
            </p>
            <p
              className={`mt-1 text-2xl font-black ${
                projectedPercent >= 75 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {projectedPercent}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {projectedPercent >= 75 ? '✅ Eligible for End-Sem Exam' : '⚠️ Risk of Hall Ticket Detainment'}
            </p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Subject-Wise Attendance Overview
        </h3>
        <p className="text-xs text-slate-500">Official course attendance metrics</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Faculty In-charge</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">Missed</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4 text-right">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjectStats.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{sub.name}</p>
                    <p className="text-[11px] text-slate-400">{sub.code}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{sub.faculty}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{sub.total}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-emerald-600">{sub.attended}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-rose-500">{sub.absent}</td>
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            sub.percent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, sub.percent)}%` }}
                        />
                      </div>
                      <span className="font-bold">{sub.percent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        sub.percent >= 75
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {sub.percent >= 75 ? 'Eligible' : 'Shortage Alert'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Attendance Activity History Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attendance Verification History Log
            </h3>
            <p className="text-xs text-slate-500">Every check-in timestamp and verification method</p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Methods</option>
              <option value="face">Face Recognition</option>
              <option value="manual">Manual Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRecords.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No attendance records found matching filters.
            </p>
          ) : (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-3 text-xs transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                      rec.method === 'face'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {rec.method === 'face' ? <Camera className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {rec.subjectName} ({rec.subjectCode})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rec.date} • {rec.time} • Slot: {rec.sessionSlot}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      rec.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : rec.status === 'Late'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {rec.status} ({rec.method === 'face' ? 'Face ID' : 'Manual'})
                  </span>
                  {rec.confidence && (
                    <p className="mt-0.5 text-[10px] font-mono text-slate-400">
                      Match: {rec.confidence}%
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
