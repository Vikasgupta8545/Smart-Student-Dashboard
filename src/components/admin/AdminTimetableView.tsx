import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit2, X, Clock, MapPin } from 'lucide-react';
import { TimetableSlot, Subject } from '../../types';
import { saveTimetableSlot, deleteTimetableSlot } from '../../services/studentService';

interface AdminTimetableViewProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
  onRefresh: () => void;
}

export const AdminTimetableView: React.FC<AdminTimetableViewProps> = ({
  timetable,
  subjects,
  onRefresh,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot>>({});

  const daySlots = timetable
    .filter((t) => t.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenAdd = () => {
    const defaultSub = subjects[0];
    setEditingSlot({
      id: `slot-${Date.now()}`,
      day: selectedDay as any,
      subjectId: defaultSub?.id || '',
      subjectCode: defaultSub?.code || 'CS601',
      subjectName: defaultSub?.name || 'Distributed Systems',
      facultyName: defaultSub?.facultyName || 'Dr. K. Raman',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      roomNumber: '402',
      semester: 6,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this lecture slot?')) return;
    await deleteTimetableSlot(id);
    onRefresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot.id) return;
    await saveTimetableSlot(editingSlot as TimetableSlot);
    setModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Class Timetable Scheduler
          </h2>
          <p className="text-xs text-slate-500">
            Allocate lecture slots, classrooms, and faculty periods across days
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lecture Slot</span>
        </button>
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedDay === day
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {daySlots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {slot.subjectCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {slot.subjectName}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {slot.facultyName} • Hall {slot.roomNumber}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-md bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {slot.startTime} - {slot.endTime}
              </span>
              <button
                onClick={() => handleDelete(slot.id)}
                className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add / Edit Lecture Slot</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-medium">Subject</label>
                <select
                  value={editingSlot.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find(s => s.id === e.target.value);
                    if (sub) {
                      setEditingSlot({
                        ...editingSlot,
                        subjectId: sub.id,
                        subjectCode: sub.code,
                        subjectName: sub.name,
                        facultyName: sub.facultyName,
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
                  <label className="font-medium">Start Time</label>
                  <input
                    type="text"
                    value={editingSlot.startTime || ''}
                    onChange={e => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium">End Time</label>
                  <input
                    type="text"
                    value={editingSlot.endTime || ''}
                    onChange={e => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium">Room Number</label>
                <input
                  type="text"
                  value={editingSlot.roomNumber || ''}
                  onChange={e => setEditingSlot({ ...editingSlot, roomNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                />
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
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
