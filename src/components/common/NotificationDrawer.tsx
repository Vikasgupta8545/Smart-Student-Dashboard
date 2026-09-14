import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Info,
  Award,
  Sparkles,
} from 'lucide-react';
import { CampusNotification } from '../../types';
import { markNotificationAsRead } from '../../services/studentService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: CampusNotification[];
  onRefresh?: () => void;
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onRefresh,
  onMarkAsRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    try {
      if (onMarkAsRead) {
        onMarkAsRead(id);
      } else {
        await markNotificationAsRead(id);
        onRefresh?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const safeList = notifications || [];
  const filtered = safeList.filter((n) => {
    if (!n) return false;
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return (n.category || '').toLowerCase() === filter.toLowerCase();
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Exam':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'Attendance':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'Academic':
        return <Award className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Campus Notices</h2>
              <p className="text-[11px] text-slate-500">Official college announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClearAll && safeList.some(n => !n.read) && (
              <button
                id="btn-mark-all-read"
                onClick={onClearAll}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
            <button
              id="btn-close-notif-drawer"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close notification drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2 text-xs dark:border-slate-800">
          {['all', 'unread', 'Exam', 'Attendance', 'Academic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                No notifications in this filter
              </p>
              <p className="text-[11px] text-slate-400">You are all caught up!</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-xl border p-3.5 transition-all ${
                  item.read
                    ? 'border-slate-100 bg-white/60 dark:border-slate-800 dark:bg-slate-800/40'
                    : 'border-indigo-100 bg-indigo-50/40 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.category}
                    </span>
                    {item.priority === 'urgent' && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Urgent
                      </span>
                    )}
                  </div>

                  {!item.read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <h3 className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.message}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today')}</span>
                  {item.read && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="h-3 w-3" /> Read
                    </span>
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
