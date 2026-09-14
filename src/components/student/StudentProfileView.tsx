import React from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Student } from '../../types';

interface StudentProfileViewProps {
  student: Student;
  onRegisterFaceClick?: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onRegisterFaceClick,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Student Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 gap-4">
            <div className="flex items-end gap-4">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg"
              />
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    {student.name}
                  </h1>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {student.rollNumber} • Semester {student.semester}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  student.faceRegistered
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {student.faceRegistered ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Biometrics Registered
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" /> Face Unregistered
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Key Information Fields */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Department</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{student.department}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Academic Year / Batch</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">
                {student.academicYear} Batch
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Institutional Email</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{student.email}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Contact Number</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{student.phone}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Faculty Academic Mentor</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{student.mentor}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold text-slate-400">Date of Admission</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">
                {student.admissionDate || 'August 2021'}
              </p>
            </div>
          </div>

          {/* Biometric Security Information */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Biometric Security & Consent Status</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Biometric credentials are encrypted as 128-dimensional float arrays on Firestore.
              {student.faceRegistered
                ? ` Consent was logged on ${student.faceRegisteredAt ? new Date(student.faceRegisteredAt).toLocaleDateString() : 'Active Semester'}. Biometric facial vector is verified for automated attendance kiosks.`
                : ' Biometrics are currently not registered. Please contact the department lab administrator to record your face ID.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
