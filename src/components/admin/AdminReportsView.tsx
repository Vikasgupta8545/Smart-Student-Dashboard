import React from 'react';
import { FileSpreadsheet, Download, CheckCircle2, TrendingUp, Users, CalendarCheck } from 'lucide-react';
import { Student, AttendanceRecord, MarkRecord, Subject } from '../../types';

interface AdminReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  subjects: Subject[];
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  students,
  attendance,
  marks,
  subjects,
}) => {
  // Helper to trigger CSV download
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudentsCSV = () => {
    const headers = ['Roll Number', 'Full Name', 'Department', 'Semester', 'CGPA', 'SGPA', 'Face Registered', 'Email', 'Phone'];
    const rows = students.map(s => [
      s.rollNumber,
      `"${s.name}"`,
      `"${s.department}"`,
      s.semester,
      s.cgpa,
      s.sgpa,
      s.faceRegistered ? 'Yes' : 'No',
      s.email,
      s.phone,
    ]);
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`college_students_roster_${new Date().toISOString().split('T')[0]}.csv`, content);
  };

  const exportAttendanceCSV = () => {
    const headers = ['Date', 'Time', 'Roll Number', 'Student Name', 'Subject Code', 'Subject Name', 'Slot', 'Status', 'Method', 'Confidence'];
    const rows = attendance.map(a => [
      a.date,
      a.time,
      a.rollNumber,
      `"${a.studentName}"`,
      a.subjectCode,
      `"${a.subjectName}"`,
      a.sessionSlot,
      a.status,
      a.method,
      a.confidence ? `${a.confidence}%` : 'N/A',
    ]);
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`attendance_log_${new Date().toISOString().split('T')[0]}.csv`, content);
  };

  const exportMarksCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Subject Code', 'Subject Name', 'Test 1', 'Test 2', 'Assignment', 'Total', 'Grade'];
    const rows = marks.map(m => [
      m.rollNumber,
      `"${m.studentName}"`,
      m.subjectCode,
      `"${m.subjectName}"`,
      m.internal1,
      m.internal2,
      m.assignmentMarks,
      m.totalMarks,
      m.grade,
    ]);
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`semester_marks_ledger_${new Date().toISOString().split('T')[0]}.csv`, content);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Institutional Reports & CSV Exports
        </h2>
        <p className="text-xs text-slate-500">
          Generate accredited NAAC / NBA audit reports, attendance compliance sheets, and academic records
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Student Roster Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
              Student Enrollment Ledger
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Complete student master table with roll numbers, contact info, and CGPA metrics.
            </p>
          </div>

          <button
            onClick={exportStudentsCSV}
            className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {/* Biometric Attendance Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
              Biometric Attendance Log
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Every class check-in record, verification timestamp, method (Face/Manual), and confidence scores.
            </p>
          </div>

          <button
            onClick={exportAttendanceCSV}
            className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Attendance CSV</span>
          </button>
        </div>

        {/* Grade Ledger Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
              Continuous Evaluation Ledger
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Subject-wise Internal 1, Internal 2, Assignment marks, total scores, and published grades.
            </p>
          </div>

          <button
            onClick={exportMarksCSV}
            className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Grades CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
