import React from 'react';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  Student,
  Subject,
  AttendanceRecord,
  TimetableSlot,
  MarkRecord,
  Assignment,
  Exam,
  CampusNotification,
} from '../../types';
import { SmartInsightsCard } from '../ai/SmartInsightsCard';
import { computeStudentSmartInsights } from '../../services/aiService';
import { ActiveTab } from '../common/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface StudentDashboardViewProps {
  student: Student;
  subjects?: Subject[];
  attendance?: AttendanceRecord[];
  timetable?: TimetableSlot[];
  marks?: MarkRecord[];
  assignments?: Assignment[];
  exams?: Exam[];
  notifications?: CampusNotification[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAssistant?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenFaceKiosk?: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  subjects = [],
  attendance = [],
  timetable = [],
  marks = [],
  assignments = [],
  exams = [],
  notifications = [],
  onNavigate,
  onOpenAssistant,
  onOpenAiAssistant,
  onOpenFaceKiosk,
}) => {
  const handleAiClick = onOpenAiAssistant || onOpenAssistant || (() => onNavigate('student-ai'));

  const safeAttendance = attendance || [];
  const safeTimetable = timetable || [];
  const safeAssignments = assignments || [];
  const safeMarks = marks || [];
  const safeExams = exams || [];
  const safeNotifications = notifications || [];

  // Attendance calculations
  const totalClasses = safeAttendance.length || 45;
  const attendedCount = safeAttendance.filter(a => a?.status === 'Present' || a?.status === 'Late').length || 38;
  const overallAttendancePercent = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 85;

  // Safe classes calculation for 75% requirement:
  const safeMissableClasses = Math.max(0, Math.floor((attendedCount - 0.75 * totalClasses) / 0.75));
  const classesNeededFor75 = overallAttendancePercent < 75
    ? Math.ceil((0.75 * totalClasses - attendedCount) / (1 - 0.75))
    : 0;

  // Today's timetable (e.g. Monday slots)
  const todaySlots = safeTimetable
    .filter(t => t?.day === 'Monday')
    .sort((a, b) => (a?.startTime || '').localeCompare(b?.startTime || ''));
  const nextClass = todaySlots[0];

  // Pending assignments
  const pendingAssignments = safeAssignments.filter(a => a?.status === 'Pending' || a?.status === 'In Progress');

  // Academic insights
  const insights = computeStudentSmartInsights(student, safeAttendance, safeMarks, safeExams);

  // Performance chart data (Internal 1 vs Internal 2 vs Target)
  const marksChartData = safeMarks.map(m => ({
    name: m?.subjectCode || '',
    fullName: m?.subjectName || '',
    Internal1: m?.internal1 || 0,
    Internal2: m?.internal2 || 0,
    Total: (m?.internal1 || 0) + (m?.internal2 || 0),
  }));

  // SGPA Progression data
  const sgpaHistory = [
    { sem: 'Sem 1', sgpa: 8.2 },
    { sem: 'Sem 2', sgpa: 8.5 },
    { sem: 'Sem 3', sgpa: 8.4 },
    { sem: 'Sem 4', sgpa: 8.7 },
    { sem: 'Sem 5', sgpa: 8.9 },
    { sem: 'Sem 6 (Current)', sgpa: student.sgpa },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {student.name}
                </h1>
                <span className="rounded-full bg-indigo-400/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 border border-indigo-300/20">
                  Semester {student.semester}
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-200">
                {student.rollNumber} • {student.department}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-indigo-100/90">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                  B.Tech Engineering
                </span>
                <span>•</span>
                <span>Mentor: {student.mentor}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${student.faceRegistered ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  Face Biometrics {student.faceRegistered ? 'Active' : 'Unregistered'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill Panel */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 min-w-[100px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
                CGPA
              </p>
              <p className="mt-0.5 text-lg font-bold text-white">{student.cgpa}</p>
              <p className="text-[10px] text-emerald-300 font-medium">SGPA {student.sgpa}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 min-w-[110px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
                Attendance
              </p>
              <p className="mt-0.5 text-lg font-bold text-white">{overallAttendancePercent}%</p>
              <p className="text-[10px] text-indigo-200 font-medium">
                {overallAttendancePercent >= 75 ? 'Above 75% criteria' : '⚠️ Shortage alert'}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 min-w-[100px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
                Class Rank
              </p>
              <p className="mt-0.5 text-lg font-bold text-white">#04</p>
              <p className="text-[10px] text-amber-300 font-medium">Top 5% Cohort</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Insights Section */}
      <SmartInsightsCard insights={insights} onOpenAssistant={handleAiClick} />

      {/* Secondary Row: Next Class + Attendance Alert Card + Upcoming Exam */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Today's Next Lecture */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="h-4 w-4 text-indigo-500" />
              Next Scheduled Lecture
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Today
            </span>
          </div>

          {nextClass ? (
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {nextClass.subjectName}
              </h3>
              <p className="text-xs text-slate-500">
                {nextClass.subjectCode} • {nextClass.facultyName}
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400">Time</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {nextClass.startTime} - {nextClass.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Lecture Hall</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {nextClass.roomNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No more lectures scheduled for today.</p>
          )}

          <button
            onClick={() => onNavigate('student-timetable')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>View Full Weekly Timetable</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 2: Attendance Status & Safety Margins */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <CalendarCheck className="h-4 w-4 text-emerald-500" />
              Attendance Compliance
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                overallAttendancePercent >= 75
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {overallAttendancePercent}% Overall
            </span>
          </div>

          <div className="mt-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallAttendancePercent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, overallAttendancePercent)}%` }}
              />
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed dark:bg-slate-800">
              {overallAttendancePercent >= 75 ? (
                <div className="text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">Safe Attendance Margin:</span> You can miss up to{' '}
                  <span className="font-bold underline">{safeMissableClasses} lectures</span> while
                  staying comfortably above the 75% cutoff.
                </div>
              ) : (
                <div className="text-rose-800 dark:text-rose-300">
                  <span className="font-bold">Shortage Warning:</span> You must attend the next{' '}
                  <span className="font-bold underline">{classesNeededFor75} consecutive classes</span>{' '}
                  to restore 75% eligibility.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('student-attendance')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>Subject-wise Attendance Logs</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 3: Upcoming University Exam */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Calendar className="h-4 w-4 text-purple-500" />
              Next Examination
            </span>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Mid-Term II
            </span>
          </div>

          {safeExams[0] ? (
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {safeExams[0].subjectName}
              </h3>
              <p className="text-xs text-slate-500">
                {safeExams[0].subjectCode} • {safeExams[0].date} ({safeExams[0].startTime})
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400">Room Number</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {safeExams[0].roomNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Duration</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {safeExams[0].durationMinutes} Minutes
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No upcoming exams announced.</p>
          )}

          <button
            onClick={() => onNavigate('student-exams')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>View All Exam Schedules</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Analytical Section: Marks Bar Chart & SGPA Trend (2 Columns) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Performance Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Internal Assessment Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Internal Test 1 (30M) vs Internal Test 2 (30M)
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Avg: 25.8 / 30
            </span>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 30]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Internal1" fill="#6366f1" radius={[4, 4, 0, 0]} name="Internal 1" />
                <Bar dataKey="Internal2" fill="#a855f7" radius={[4, 4, 0, 0]} name="Internal 2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SGPA Growth Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SGPA Academic Progression
              </h3>
              <p className="text-xs text-slate-500">Cumulative performance trend over 6 semesters</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +0.72 Growth
            </span>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sgpaHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[7.0, 10.0]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sgpa"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  name="SGPA"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Timetable & Pending Assignments Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Today's Timetable Schedule (7 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Class Schedule (Monday)
            </h3>
            <span className="text-xs text-slate-400">{todaySlots.length} Classes Total</span>
          </div>

          <div className="mt-4 space-y-3">
            {todaySlots.map((slot, idx) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {slot.subjectName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {slot.subjectCode} • {slot.facultyName} • Room {slot.roomNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Assignments (5 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pending Submissions
            </h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {pendingAssignments.length} Pending
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {pendingAssignments.slice(0, 4).map((asg) => (
              <div
                key={asg.id}
                className="rounded-xl border border-slate-100 p-3 transition-colors hover:border-indigo-100 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {asg.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{asg.subjectName}</p>
                  </div>
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300 whitespace-nowrap">
                    Due {asg.dueDate}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total: {asg.maxMarks} Marks</span>
                  <button
                    onClick={() => onNavigate('student-assignments')}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Submit Assignment →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
