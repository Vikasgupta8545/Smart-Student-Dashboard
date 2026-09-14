import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, MapPin, X } from 'lucide-react';
import { Exam, Subject } from '../../types';
import { saveExam, deleteExam } from '../../services/studentService';

interface AdminExamsViewProps {
  exams: Exam[];
  subjects: Subject[];
  onRefresh: () => void;
}

export const AdminExamsView: React.FC<AdminExamsViewProps> = ({ exams, subjects, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<Exam>>({});

  const handleOpenAdd = () => {
    const defaultSub = subjects[0];
    setEditingExam({
      id: `exam-${Date.now()}`,
      subjectId: defaultSub?.id || '',
      subjectCode: defaultSub?.code || 'CS601',
      subjectName: defaultSub?.name || 'Distributed Systems',
      date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      startTime: '10:00 AM',
      durationMinutes: 180,
      roomNumber: 'LH-101',
      maxMarks: 100,
      semester: 6,
      type: 'End-Sem',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete exam schedule?')) return;
    await deleteExam(id);
    onRefresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam.id) return;
    await saveExam(editingExam as Exam);
    setModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Examination Hall & Schedule Controller
          </h2>
          <p className="text-xs text-slate-500">
            Publish Mid-term and End-semester examination slots and hall numbers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
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
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Date: {exam.date}
                </span>
                <span>Time: {exam.startTime} ({exam.durationMinutes} mins)</span>
                <span>Hall: {exam.roomNumber}</span>
                <span>Marks: {exam.maxMarks}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(exam.id)}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Examination</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium">Subject</label>
                <select
                  value={editingExam.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find(s => s.id === e.target.value);
                    if (sub) {
                      setEditingExam({
                        ...editingExam,
                        subjectId: sub.id,
                        subjectCode: sub.code,
                        subjectName: sub.name,
                      });
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={editingExam.date || ''}
                    onChange={e => setEditingExam({ ...editingExam, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium">Start Time</label>
                  <input
                    type="text"
                    value={editingExam.startTime || '10:00 AM'}
                    onChange={e => setEditingExam({ ...editingExam, startTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editingExam.durationMinutes || 180}
                    onChange={e => setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium">Exam Hall</label>
                  <input
                    type="text"
                    value={editingExam.roomNumber || 'LH-101'}
                    onChange={e => setEditingExam({ ...editingExam, roomNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
