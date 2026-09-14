import React, { useState } from 'react';
import { Bell, Plus, Trash2, AlertCircle, Info, Calendar, Sparkles } from 'lucide-react';
import { CampusNotification } from '../../types';
import { saveNotification, deleteNotification } from '../../services/studentService';

interface AdminAnnouncementsViewProps {
  notifications: CampusNotification[];
  onRefresh: () => void;
}

export const AdminAnnouncementsView: React.FC<AdminAnnouncementsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [category, setCategory] = useState<'general' | 'exam' | 'attendance' | 'academic'>('general');
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete broadcast?')) return;
    await deleteNotification(id);
    onRefresh();
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await saveNotification({
        id: `notif-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: new Date().toISOString(),
        priority,
        category,
        read: false,
      });

      setTitle('');
      setMessage('');
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Campus Announcements & Push Broadcasts
          </h2>
          <p className="text-xs text-slate-500">
            Publish urgent college alerts, exam circulars, and attendance warnings
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Campus Broadcast</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start justify-between rounded-2xl border p-5 shadow-xs transition-colors ${
              notif.priority === 'urgent'
                ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  notif.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                }`}
              >
                {notif.priority === 'urgent' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      notif.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {notif.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
                <p className="mt-2 text-[11px] text-slate-400">Published: {notif.date}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(notif.id)}
              className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:text-rose-600 dark:bg-slate-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Create Campus Broadcast
            </h3>

            <form onSubmit={handleBroadcast} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Exam Hall Tickets Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-medium">Announcement Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details and instructions for students..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="general">General</option>
                    <option value="exam">Exam</option>
                    <option value="attendance">Attendance</option>
                    <option value="academic">Academic</option>
                  </select>
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
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
