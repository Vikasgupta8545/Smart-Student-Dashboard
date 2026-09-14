import React, { useState } from 'react';
import { BookOpen, User, Award, FileText, CheckCircle2, ChevronDown, BookMarked, ArrowRight } from 'lucide-react';
import { Subject } from '../../types';

interface StudentSubjectsViewProps {
  subjects: Subject[];
  onNavigateToSyllabus?: (subjectCode?: string) => void;
}

export const StudentSubjectsView: React.FC<StudentSubjectsViewProps> = ({ subjects, onNavigateToSyllabus }) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Registered Academic Subjects
        </h2>
        <p className="text-xs text-slate-500">
          Curriculum, course credits, faculty mentors, and syllabus modules
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {subjects.map((sub) => {
          const isExpanded = expandedSubjectId === sub.id;

          return (
            <div
              key={sub.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className="flex cursor-pointer items-center justify-between"
                onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {sub.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      {sub.department} • Semester {sub.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {sub.credits} Credits
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="font-semibold text-slate-500">Faculty In-charge</p>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
                        {sub.facultyName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-500">Lecture Frequency</p>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
                        4 Lectures / Week
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-500">Total Planned Classes</p>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
                        {sub.totalClasses || 42} Lectures
                      </p>
                    </div>
                  </div>

                  {/* Syllabus Modules */}
                  <div className="mt-4">
                    <p className="font-semibold text-slate-500 mb-2">Curriculum Units Covered</p>
                    <div className="space-y-1.5">
                      {sub.syllabus?.map((unit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>{unit}</span>
                        </div>
                      ))}
                    </div>

                    {onNavigateToSyllabus && (
                      <button
                        onClick={() => onNavigateToSyllabus(sub.code)}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        <BookMarked className="h-4 w-4" />
                        <span>View Detailed AKTU 5-Unit Syllabus & Textbooks</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
