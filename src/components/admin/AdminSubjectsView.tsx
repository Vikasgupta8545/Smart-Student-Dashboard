import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';
import { Subject } from '../../types';
import { saveSubject, deleteSubject } from '../../services/studentService';

interface AdminSubjectsViewProps {
  subjects: Subject[];
  onRefresh: () => void;
}

export const AdminSubjectsView: React.FC<AdminSubjectsViewProps> = ({ subjects, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Partial<Subject>>({});
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingSub({
      id: `sub-${Date.now()}`,
      code: 'CS606',
      name: '',
      department: 'Computer Science & Engineering',
      semester: 6,
      credits: 4,
      facultyName: 'Dr. Faculty Member',
      facultyId: 'fac-101',
      totalClasses: 42,
      syllabus: ['Module 1: Fundamentals', 'Module 2: Advanced Architectures'],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSub(sub);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete subject ${name}?`)) return;
    await deleteSubject(id);
    onRefresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub.id || !editingSub.name || !editingSub.code) return;
    setSaving(true);
    try {
      await saveSubject(editingSub as Subject);
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Curriculum & Subject Management
          </h2>
          <p className="text-xs text-slate-500">
            Define degree courses, credits, syllabus units, and faculty instructors
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {sub.code}
                </span>
                <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {sub.department} • Semester {sub.semester}
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(sub)}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400">Faculty: <span className="font-semibold">{sub.facultyName}</span></span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {sub.credits} Credits
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject Details</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Course Code</label>
                <input
                  type="text"
                  required
                  value={editingSub.code || ''}
                  onChange={(e) => setEditingSub({ ...editingSub, code: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Course Name</label>
                <input
                  type="text"
                  required
                  value={editingSub.name || ''}
                  onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editingSub.credits || 4}
                    onChange={(e) => setEditingSub({ ...editingSub, credits: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={editingSub.semester || 6}
                    onChange={(e) => setEditingSub({ ...editingSub, semester: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">Faculty In-charge</label>
                <input
                  type="text"
                  required
                  value={editingSub.facultyName || ''}
                  onChange={(e) => setEditingSub({ ...editingSub, facultyName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
