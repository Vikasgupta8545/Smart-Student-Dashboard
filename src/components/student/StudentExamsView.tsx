import React from 'react';
import { Calendar, Clock, MapPin, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Exam } from '../../types';

interface StudentExamsViewProps {
  exams: Exam[];
}

export const StudentExamsView: React.FC<StudentExamsViewProps> = ({ exams }) => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Semester Examination Schedule
        </h2>
        <p className="text-xs text-slate-500">
          Mid-term assessments, end-semester exam dates, exam hall allocations & guidelines
        </p>
      </div>

      {/* Hall Ticket Advisory Card */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Hall Ticket Verification Guideline</p>
          <p className="mt-0.5 leading-relaxed text-[11px] text-indigo-800/90 dark:text-indigo-300/90">
            Candidates must carry their physical Student Smart ID Card with biometric authorization. Entry to the examination hall closes 15 minutes after commencement.
          </p>
        </div>
      </div>

      {/* Exam Timeline Cards */}
      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Date</span>
                <span className="text-sm font-extrabold">{exam.date.split('-')[2] || '18'}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {exam.subjectCode}
                  </span>
                  <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {exam.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {exam.subjectName}
                  </h3>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {exam.startTime} ({exam.durationMinutes} Mins)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Hall {exam.roomNumber}
                  </span>
                  <span>Max Marks: {exam.maxMarks}</span>
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {exam.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
