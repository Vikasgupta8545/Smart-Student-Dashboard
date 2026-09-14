import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  User,
  GraduationCap,
} from 'lucide-react';
import { StudentApplication } from '../../types';
import { getApplications, updateApplicationStatus, deleteApplication } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

export const AdminApplicationsView: React.FC = () => {
  const { currentStudent } = useAuth();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingApp, setReviewingApp] = useState<StudentApplication | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getApplications();
      setApplications(list);
    } catch (e) {
      console.warn('Failed to load applications', e);
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
  }, []);

  const handleOpenReview = (app: StudentApplication, decision: 'Approved' | 'Rejected') => {
    setReviewingApp(app);
    setReviewDecision(decision);
    setReviewRemarks(
      decision === 'Approved'
        ? `Application verified and approved as per AKTU academic guidelines.`
        : `Application rejected due to insufficient documentation.`
    );
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;

    setProcessing(true);
    try {
      await updateApplicationStatus(
        reviewingApp.id,
        reviewDecision,
        'Dean / HOD Academic Cell',
        reviewRemarks
      );
      showToast(
        'success',
        `Application for ${reviewingApp.studentName} has been ${reviewDecision.toLowerCase()}.`
      );
      setReviewingApp(null);
      loadData();
    } catch (err: any) {
      showToast('error', `Review action failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      showToast('success', 'Application record deleted.');
      loadData();
    } catch (e: any) {
      showToast('error', `Delete error: ${e.message}`);
    }
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

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
            <FileCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>AKTU Student Applications & Leave Approvals</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dr. A.P.J. Abdul Kalam Technical University (AKTU) • Academic Cell, HOD & Dean Approval Desk
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting HOD / Dean action</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Approved Applications
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {approvedCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Leave & exemptions granted</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rejected
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {rejectedCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Not eligible / deficient</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
          {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {st === 'all' ? `All (${applications.length})` : `${st} (${applications.filter(a => a.status === st).length})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, roll, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Application Cards */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No applications match your filter
            </p>
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {app.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        app.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {app.status === 'Approved' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : app.status === 'Rejected' ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{app.status}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {app.subject}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{app.studentName}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600 font-bold">{app.rollNumber}</span>
                    <span>•</span>
                    <span>{app.department}</span>
                    <span>•</span>
                    <span>Sem {app.semester}</span>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {app.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleOpenReview(app, 'Approved')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(app, 'Rejected')}
                        className="flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(app, app.status === 'Approved' ? 'Rejected' : 'Approved')}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                      Change Status
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">Reason / Details:</span>
                {app.reason}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                {app.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Duration: {app.startDate} to {app.endDate} ({app.totalDays} Days)</span>
                  </span>
                )}
                {app.emergencyPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Phone: {app.emergencyPhone}</span>
                  </span>
                )}
              </div>

              {app.reviewRemarks && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                    Official Decision & Remarks ({app.reviewedBy || 'Academic Cell'}):
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{app.reviewRemarks}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {reviewDecision === 'Approved' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600" />
                )}
                <span>
                  {reviewDecision} Application: {reviewingApp.studentName}
                </span>
              </h3>
              <button onClick={() => setReviewingApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="mt-4 space-y-3.5">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{reviewingApp.subject}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Roll: {reviewingApp.rollNumber} • Type: {reviewingApp.type}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Approved')}
                    className={`rounded-xl border p-2 text-center font-semibold transition-all ${
                      reviewDecision === 'Approved'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Rejected')}
                    className={`rounded-xl border p-2 text-center font-semibold transition-all ${
                      reviewDecision === 'Rejected'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Official Remarks / Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors ${
                    reviewDecision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {processing ? 'Processing...' : `Confirm ${reviewDecision}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
