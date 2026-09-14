import React, { useState } from 'react';
import { FileText, Plus, Trash2, X, Calendar } from 'lucide-react';
import { Assignment, Subject } from '../../types';
import { saveAssignment, deleteAssignment } from '../../services/studentService';

interface AdminAssignmentsViewProps {
  assignments: Assignment[];
  subjects: Subject[];
  onRefresh: () => void;
}

export const AdminAssignmentsView: React.FC<AdminAssignmentsViewProps> = ({
  assignments,
  subjects,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsg, setEditingAsg] = useState<Partial<Assignment>>({});

  const handleOpenAdd = () => {
    const defaultSub = subjects[0];
    setEditingAsg({
      id: `asg-${Date.now()}`,
      subjectId: defaultSub?.id || '',
      subjectCode: defaultSub?.code || 'CS601',
      subjectName: defaultSub?.name || 'Distributed Systems',
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxMarks: 25,
      status: 'Pending',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    await deleteAssignment(id);
    onRefresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsg.id || !editingAsg.title) return;
    await saveAssignment(editingAsg as Assignment);
    setModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Course Assignments & Tasks
          </h2>
          <p className="text-xs text-slate-500">
            Publish homework assignments, project milestones, and set deadlines
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignments.map((asg) => (
          <div
            key={asg.id}
            className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {asg.subjectCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">{asg.subjectName}</p>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{asg.description}</p>
              <p className="mt-3 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                Deadline: {asg.dueDate} • Max Marks: {asg.maxMarks}
              </p>
            </div>

            <button
              onClick={() => handleDelete(asg.id)}
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Assignment</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium">Subject</label>
                <select
                  value={editingAsg.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find(s => s.id === e.target.value);
                    if (sub) {
                      setEditingAsg({
                        ...editingAsg,
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

              <div>
                <label className="font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transaction ACID Properties Implementation"
                  value={editingAsg.title || ''}
                  onChange={e => setEditingAsg({ ...editingAsg, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingAsg.description || ''}
                  onChange={e => setEditingAsg({ ...editingAsg, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingAsg.dueDate || ''}
                    onChange={e => setEditingAsg({ ...editingAsg, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium">Max Marks</label>
                  <input
                    type="number"
                    value={editingAsg.maxMarks || 25}
                    onChange={e => setEditingAsg({ ...editingAsg, maxMarks: Number(e.target.value) })}
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
                  Post Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
