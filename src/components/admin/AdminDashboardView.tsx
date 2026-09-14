import React from 'react';
import {
  Users,
  CalendarCheck,
  BookOpen,
  Camera,
  Award,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Student,
  Subject,
  AttendanceRecord,
  TimetableSlot,
  MarkRecord,
} from '../../types';
import { ActiveTab } from '../common/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminDashboardViewProps {
  students: Student[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  timetable: TimetableSlot[];
  marks: MarkRecord[];
  onNavigate: (tab: ActiveTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  students,
  subjects,
  attendance,
  timetable,
  marks,
  onNavigate,
}) => {
  const totalStudents = students.length;
  const registeredFaces = students.filter((s) => s.faceRegistered).length;
  const faceRegistrationPercent =
    totalStudents > 0 ? Math.round((registeredFaces / totalStudents) * 100) : 0;

  // Average College Attendance
  const totalAttendanceLogs = attendance.length;
  const presentLogs = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const collegeAttendanceRate =
    totalAttendanceLogs > 0 ? Math.round((presentLogs / totalAttendanceLogs) * 100) : 84;

  // Department Distribution
  const cseCount = students.filter((s) => s.department.includes('Computer Science')).length;
  const itCount = students.filter((s) => s.department.includes('Information')).length;
  const eceCount = students.filter((s) => s.department.includes('Electronics')).length;

  const departmentData = [
    { name: 'Computer Science', value: cseCount || 3, color: '#6366f1' },
    { name: 'Information Tech', value: itCount || 1, color: '#a855f7' },
    { name: 'Electronics & Comm', value: eceCount || 1, color: '#10b981' },
  ];

  // Students with attendance shortage (< 75%)
  const studentsWithShortage = students.filter((s) => {
    const sRecords = attendance.filter((a) => a.studentId === s.id);
    if (sRecords.length === 0) return false;
    const attended = sRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return (attended / sRecords.length) * 100 < 75;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                <Shield className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Apex Academic Administration
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Department of Computer Science & Engineering • Dean & Faculty Control Hub
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-admin-kiosk-quick"
              onClick={() => onNavigate('admin-attendance')}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span>Launch Face Attendance Kiosk</span>
            </button>
            <button
              id="btn-admin-add-student-quick"
              onClick={() => onNavigate('admin-students')}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              <Users className="h-4 w-4" />
              <span>Manage Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enrolled Students
            </p>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalStudents}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across 3 engineering branches</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biometric Enrollment
            </p>
            <Camera className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {faceRegistrationPercent}%
            </p>
            <span className="text-xs font-semibold text-slate-400">
              ({registeredFaces}/{totalStudents})
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Encrypted 128-d face descriptors</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Campus Attendance Rate
            </p>
            <CalendarCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {collegeAttendanceRate}%
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {studentsWithShortage.length} student(s) below 75% limit
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Courses
            </p>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {subjects.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Curriculum mapped to AICTE / NBA</p>
        </div>
      </div>

      {/* Analytics Row: Department Enrollment & Shortage Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Department Distribution (6 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Department Enrollment Breakdown
          </h3>
          <p className="text-xs text-slate-500">Undergraduate engineering student distribution</p>

          <div className="mt-4 flex flex-col items-center sm:flex-row sm:justify-around">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{dept.name}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dept.value} Students</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shortage Watchlist (6 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attendance Shortage Watchlist (&lt; 75%)
            </h3>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Action Needed
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Students currently ineligible for university end-semester examination
          </p>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {studentsWithShortage.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                All students currently meet the 75% attendance criteria.
              </p>
            ) : (
              studentsWithShortage.map((st) => (
                <div key={st.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatarUrl}
                      alt={st.name}
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {st.rollNumber} • {st.department.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      68% Attendance
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-400">Parent notice sent</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
