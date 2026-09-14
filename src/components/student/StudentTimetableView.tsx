import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { TimetableSlot } from '../../types';

interface StudentTimetableViewProps {
  timetable: TimetableSlot[];
}

export const StudentTimetableView: React.FC<StudentTimetableViewProps> = ({ timetable }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const slotsForDay = timetable
    .filter(t => t.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Semester Class Timetable
          </h2>
          <p className="text-xs text-slate-500">
            Weekly lecture schedules, labs, and classroom allocations
          </p>
        </div>

        {/* Day Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="space-y-3">
        {slotsForDay.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            <Calendar className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold">No scheduled lectures on {selectedDay}</p>
          </div>
        ) : (
          slotsForDay.map((slot, idx) => (
            <div
              key={slot.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-sm">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {slot.subjectCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {slot.subjectName}
                    </h3>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {slot.facultyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Room {slot.roomNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="rounded-xl bg-slate-50 px-4 py-2 text-right dark:bg-slate-800">
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" /> Duration
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
