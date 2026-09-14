import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  User,
  Trash2,
  FileText,
  Building,
  Check,
  X,
} from 'lucide-react';
import { StudentApplication } from '../../types';
import { getApplications, submitApplication, deleteApplication } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

export const StudentApplicationsView: React.FC = () => {
  const { currentStudent } = useAuth();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form inputs
  const [appType, setAppType] = useState<StudentApplication['type']>('Leave Application');
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(currentStudent?.phone || '+91 98765 43210');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getApplications(currentStudent?.id);
      setApplications(list);
    } catch (e) {
      console.warn('Failed to load student applications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleAppsChanged = () => {
      loadData();
    };

    window.addEventListener('aktu_applications_changed', handleAppsChanged);
    return () => window.removeEventListener('aktu_applications_changed', handleAppsChanged);
  }, [currentStudent?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (!subject.trim() || !reason.trim()) {
      showToast('error', 'Please fill in the subject and reason.');
      return;
    }

    setSubmitting(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      await submitApplication({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        rollNumber: currentStudent.rollNumber,
        department: currentStudent.department,
        semester: currentStudent.semester || 6,
        type: appType,
        subject: subject.trim(),
        startDate,
        endDate,
        totalDays: diffTime,
        reason: reason.trim(),
        emergencyPhone: emergencyPhone.trim(),
      });

      showToast('success', 'Application submitted to HOD / Academic Office successfully!');
      setShowSubmitModal(false);
      setSubject('');
      setReason('');
      loadData();
    } catch (err: any) {
      showToast('error', `Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    try {
      await deleteApplication(appId);
      showToast('success', 'Application withdrawn successfully.');
      loadData();
    } catch (e: any) {
      showToast('error', `Could not withdraw: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-semibold shadow-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>AKTU Student Application & Leave Portal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit official requests for sick leaves, on-duty hackathon exemptions, exam form corrections, and bonafide certificates
          </p>
        </div>

        <button
          id="btn-open-application-modal"
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave / Request</span>
        </button>
      </div>

      {/* Quick Info Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">
              AKTU University Attendance Regulation (Clause 4.1):
            </span>{' '}
            Students require minimum 75% attendance to receive Semester Examination Admit Cards. Approved Medical Leaves and On-Duty (OD) representations are credited towards university attendance upon verification by HOD.
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Your Application Submissions ({applications.length})</span>
        </h3>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center text-slate-400">
            <FileText className="mx-auto h-10 w-10 text-indigo-400 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No applications submitted yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Apply for Leave / Request&quot; above to submit an official request to the college administration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {applications.map((app) => {
              const statusConfig = {
                Pending: {
                  bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
                  icon: Clock,
                },
                Approved: {
                  bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
                  icon: CheckCircle2,
                },
                Rejected: {
                  bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
                  icon: XCircle,
                },
              }[app.status];

              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {app.type}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusConfig.bg}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span>{app.status}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Submitted on {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.subject}
                      </h4>
                    </div>

                    {app.status === 'Pending' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 self-start p-1"
                        title="Withdraw pending application"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                    {app.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    {app.startDate && (
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Duration: {app.startDate} to {app.endDate || app.startDate} ({app.totalDays || 1} Days)
                        </span>
                      </span>
                    )}

                    {app.emergencyPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>Contact: {app.emergencyPhone}</span>
                      </span>
                    )}
                  </div>

                  {app.reviewRemarks && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20 text-xs">
                      <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-0.5">
                        <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Review Remarks ({app.reviewedBy || 'Administration'})</span>
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">{app.reviewRemarks}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Send className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submit Academic / Leave Application
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Application Type *
                </label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Leave Application">Leave Application (Casual / Personal)</option>
                  <option value="Medical Leave">Medical Leave (Sick / Hospitalization)</option>
                  <option value="On-Duty (Hackathon/Sports)">On-Duty Leave (SIH / Hackathon / Sports / Zonal)</option>
                  <option value="Examination Form Correction">Examination Form / Roll Number Correction</option>
                  <option value="Fee Installment Request">Fee Installment / Scholarship Extension</option>
                  <option value="Bonafide Certificate">Bonafide / Character Certificate Request</option>
                  <option value="Hostel Night Pass">Hostel Night Out / Leave Pass</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Application for Medical Leave due to viral fever..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    To Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Emergency Contact / Guardian Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Reason & Remarks *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete explanation. For medical leaves, mention doctor's advice. For hackathons/sports, mention event name and venue..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
