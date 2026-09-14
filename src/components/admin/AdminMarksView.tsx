import React, { useState } from 'react';
import { Award, Save, Search, CheckCircle2 } from 'lucide-react';
import { MarkRecord, Student, Subject } from '../../types';
import { saveMarkRecord } from '../../services/studentService';

interface AdminMarksViewProps {
  marks: MarkRecord[];
  students: Student[];
  subjects: Subject[];
  onRefresh: () => void;
}

export const AdminMarksView: React.FC<AdminMarksViewProps> = ({
  marks,
  students,
  subjects,
  onRefresh,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [editingMarks, setEditingMarks] = useState<Record<string, { internal1: number; internal2: number; assignmentMarks: number }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Load marks for the selected subject
  const getStudentMark = (studentId: string) => {
    return marks.find(m => m.studentId === studentId && (m.subjectId === selectedSubjectId || m.subjectCode === selectedSubject?.code));
  };

  const handleScoreChange = (studentId: string, field: 'internal1' | 'internal2' | 'assignmentMarks', val: number) => {
    const existing = editingMarks[studentId] || {
      internal1: getStudentMark(studentId)?.internal1 || 24,
      internal2: getStudentMark(studentId)?.internal2 || 25,
      assignmentMarks: getStudentMark(studentId)?.assignmentMarks || 9,
    };

    setEditingMarks({
      ...editingMarks,
      [studentId]: {
        ...existing,
        [field]: val,
      },
    });
  };

  const handleSaveAll = async () => {
    try {
      for (const st of students) {
        const scores = editingMarks[st.id] || {
          internal1: getStudentMark(st.id)?.internal1 || 25,
          internal2: getStudentMark(st.id)?.internal2 || 26,
          assignmentMarks: getStudentMark(st.id)?.assignmentMarks || 9,
        };

        const total = scores.internal1 + scores.internal2 + scores.assignmentMarks;
        const scaledTotal = Math.round((total / 70) * 100);
        const grade = scaledTotal >= 90 ? 'O' : scaledTotal >= 80 ? 'A+' : scaledTotal >= 70 ? 'A' : scaledTotal >= 60 ? 'B+' : 'B';

        const record: MarkRecord = {
          id: getStudentMark(st.id)?.id || `mark-${st.id}-${selectedSubject?.id}`,
          studentId: st.id,
          studentName: st.name,
          rollNumber: st.rollNumber,
          subjectId: selectedSubject.id,
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          internal1: scores.internal1,
          internal2: scores.internal2,
          assignmentMarks: scores.assignmentMarks,
          totalMarks: scaledTotal,
          grade: grade as any,
          semester: 6,
        };

        await saveMarkRecord(record);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Marks & Internal Assessment Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Enter and publish internal examination marks, quizzes, and continuous evaluation scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Scores Published
            </span>
          )}

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save & Publish Grades</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Select Active Course Subject
        </label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.code}: {sub.name} ({sub.department})
            </option>
          ))}
        </select>
      </div>

      {/* Marks Grade Sheet Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Test 1 (Max 30)</th>
                <th className="py-3 px-4 text-center">Test 2 (Max 30)</th>
                <th className="py-3 px-4 text-center">Assignment (Max 10)</th>
                <th className="py-3 px-4 text-center">Projected Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => {
                const mark = getStudentMark(st.id);
                const currentEdit = editingMarks[st.id];

                const t1 = currentEdit ? currentEdit.internal1 : mark?.internal1 || 24;
                const t2 = currentEdit ? currentEdit.internal2 : mark?.internal2 || 25;
                const asg = currentEdit ? currentEdit.assignmentMarks : mark?.assignmentMarks || 9;
                const total = Math.round(((t1 + t2 + asg) / 70) * 100);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{st.rollNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={t1}
                        onChange={(e) => handleScoreChange(st.id, 'internal1', Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-200 bg-white p-1.5 text-center font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={t2}
                        onChange={(e) => handleScoreChange(st.id, 'internal2', Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-200 bg-white p-1.5 text-center font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={asg}
                        onChange={(e) => handleScoreChange(st.id, 'assignmentMarks', Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-200 bg-white p-1.5 text-center font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {total} / 100
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
