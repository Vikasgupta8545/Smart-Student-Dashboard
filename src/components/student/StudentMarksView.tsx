import React from 'react';
import { Award, TrendingUp, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { MarkRecord, Student } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface StudentMarksViewProps {
  student: Student;
  marks: MarkRecord[];
  onOpenAiAssistant: () => void;
}

export const StudentMarksView: React.FC<StudentMarksViewProps> = ({
  student,
  marks,
  onOpenAiAssistant,
}) => {
  // Chart data
  const chartData = marks.map((m) => ({
    name: m.subjectCode,
    subject: m.subjectName,
    Internal1: m.internal1,
    Internal2: m.internal2,
    Assignment: m.assignmentMarks,
    Total: m.totalMarks,
  }));

  const averagePercentage =
    marks.length > 0
      ? Math.round(
          marks.reduce((acc, m) => acc + (m.totalMarks / 100) * 100, 0) / marks.length
        )
      : 84;

  const weakMarks = marks.filter((m) => m.totalMarks < 75);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Academic Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cumulative Grade Point Average (CGPA)
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {student.cgpa}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10.0</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              First Class with Distinction
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Evaluated across 5 completed semesters</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Semester SGPA
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {student.sgpa}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10.0</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-medium">
            Projected Grade: A+ in 4 courses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Internal Score
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {averagePercentage}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {weakMarks.length === 0 ? 'Consistent performance across all units' : `${weakMarks.length} subject(s) below target`}
          </p>
        </div>
      </div>

      {/* Internal Assessment Breakdown Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assessment Comparison Chart
            </h3>
            <p className="text-xs text-slate-500">
              Distribution across Test 1 (30M), Test 2 (30M) & Assignments (10M)
            </p>
          </div>
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Performance
          </button>
        </div>

        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Internal1" fill="#6366f1" radius={[4, 4, 0, 0]} name="Internal Test 1 (/30)" />
              <Bar dataKey="Internal2" fill="#a855f7" radius={[4, 4, 0, 0]} name="Internal Test 2 (/30)" />
              <Bar dataKey="Assignment" fill="#10b981" radius={[4, 4, 0, 0]} name="Assignments (/10)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Detailed Semester Assessment Ledger
        </h3>
        <p className="text-xs text-slate-500">Official verified internal marks list</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Test 1 (/30)</th>
                <th className="py-3 px-4 text-center">Test 2 (/30)</th>
                <th className="py-3 px-4 text-center">Assignments (/10)</th>
                <th className="py-3 px-4 text-center">Total (/100)</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
                <th className="py-3 px-4 text-right">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{m.subjectName}</p>
                    <p className="text-[11px] text-slate-400">{m.subjectCode}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">{m.internal1}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{m.internal2}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{m.assignmentMarks}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {m.totalMarks}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {m.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {m.grade === 'O' ? '10' : m.grade === 'A+' ? '9' : m.grade === 'A' ? '8' : '7'} / 10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
