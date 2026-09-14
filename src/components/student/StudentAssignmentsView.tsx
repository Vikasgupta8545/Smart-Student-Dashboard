import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, Upload, AlertCircle, ExternalLink } from 'lucide-react';
import { Assignment, Student } from '../../types';
import { submitAssignment } from '../../services/studentService';

interface StudentAssignmentsViewProps {
  student: Student;
  assignments: Assignment[];
  onRefresh: () => void;
}

export const StudentAssignmentsView: React.FC<StudentAssignmentsViewProps> = ({
  student,
  assignments,
  onRefresh,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionLink.trim()) return;

    setSubmitting(true);
    try {
      await submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: student.id,
        studentName: student.name,
        submittedAt: new Date().toISOString(),
        fileUrl: submissionLink.trim(),
        status: 'Submitted',
      });
      setSuccessMessage('Assignment submitted successfully!');
      setTimeout(() => {
        setSelectedAssignment(null);
        setSubmissionLink('');
        setSuccessMessage('');
        onRefresh();
      }, 1500);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Course Assignments & Projects
        </h2>
        <p className="text-xs text-slate-500">
          Upload project repos, numerical assignments, and view faculty grading
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignments.map((asg) => (
          <div
            key={asg.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {asg.subjectCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">{asg.subjectName}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {asg.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    asg.status === 'Evaluated'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : asg.status === 'Submitted'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {asg.status}
                </span>
                <span className="text-[11px] text-slate-400">Due: {asg.dueDate}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <span className="font-medium text-slate-500">Weightage: {asg.maxMarks} Marks</span>

              {asg.status === 'Evaluated' ? (
                <span className="font-bold text-emerald-600">Graded: 24 / 25 Marks</span>
              ) : asg.status === 'Submitted' ? (
                <span className="text-slate-400">Under faculty evaluation</span>
              ) : (
                <button
                  onClick={() => setSelectedAssignment(asg)}
                  className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Submit Work
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Submit Assignment: {selectedAssignment.title}
            </h3>
            <p className="text-xs text-slate-500">{selectedAssignment.subjectName}</p>

            {successMessage ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-1" />
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Repository or Document Link (GitHub / Drive / PDF)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/rahul/dbms-assignment-1"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 dark:bg-slate-800">
                  Submissions are automatically timestamped and verified against the deadline ({selectedAssignment.dueDate}).
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !submissionLink}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
