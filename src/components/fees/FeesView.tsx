import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Receipt,
  Plus,
  Edit3,
  Search,
  DollarSign,
  ShieldCheck,
  Check,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CollegeFeeStructure, StudentFeeRecord, FeePayment, Student } from '../../types';
import {
  getCollegeFeeStructures,
  saveCollegeFeeStructure,
  getStudentFeeRecord,
  saveStudentFeeRecord,
  recordFeePayment,
  getStudents,
} from '../../services/studentService';
import { INITIAL_COLLEGE_FEES } from '../../data/aktuFeesAndTasksData';
import { useAuth } from '../../context/AuthContext';

export const FeesView: React.FC = () => {
  const { currentStudent, role } = useAuth();
  const [colleges, setColleges] = useState<CollegeFeeStructure[]>(() => {
    try {
      const stored = getCollegeFeeStructures();
      if (stored && stored.length > 0) return stored;
    } catch {
      // fallback
    }
    return INITIAL_COLLEGE_FEES;
  });
  const [activeCollegeId, setActiveCollegeId] = useState('iet-lucknow');
  const [studentFeeRecord, setStudentFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Admin fee editing modal
  const [editingCollege, setEditingCollege] = useState<CollegeFeeStructure | null>(null);
  // Payment modal for student or admin
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(25000);
  const [payMethod, setPayMethod] = useState<FeePayment['paymentMethod']>('UPI');
  const [paying, setPaying] = useState(false);
  // Receipt modal
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);
  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    const feeStructures = getCollegeFeeStructures();
    setColleges(feeStructures);

    const students = await getStudents();
    setAllStudents(students);

    const targetStudent =
      role === 'student'
        ? currentStudent
        : students.find((s) => s.id === selectedStudentId) || currentStudent || students[0];

    if (targetStudent) {
      const record = getStudentFeeRecord(targetStudent, activeCollegeId);
      setStudentFeeRecord(record);
      setSelectedStudentId(targetStudent.id);
    }
  };

  useEffect(() => {
    loadData();

    const handleFeesChanged = () => {
      setColleges(getCollegeFeeStructures());
    };
    const handleStudentFeesChanged = () => {
      if (studentFeeRecord) {
        const target = allStudents.find((s) => s.id === studentFeeRecord.studentId) || currentStudent;
        if (target) setStudentFeeRecord(getStudentFeeRecord(target, activeCollegeId));
      }
    };

    window.addEventListener('aktu_fee_structures_changed', handleFeesChanged);
    window.addEventListener('aktu_student_fees_changed', handleStudentFeesChanged);
    return () => {
      window.removeEventListener('aktu_fee_structures_changed', handleFeesChanged);
      window.removeEventListener('aktu_student_fees_changed', handleStudentFeesChanged);
    };
  }, [currentStudent?.id, activeCollegeId, selectedStudentId]);

  const activeCollege = useMemo(() => {
    return (
      colleges.find((c) => c.id === activeCollegeId) ||
      colleges[0] ||
      INITIAL_COLLEGE_FEES[0]
    );
  }, [colleges, activeCollegeId]);

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    const target = allStudents.find((s) => s.id === sId);
    if (target) {
      setStudentFeeRecord(getStudentFeeRecord(target, activeCollegeId));
    }
  };

  const handleSaveCollegeFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    const total =
      Number(editingCollege.annualTuitionFee) +
      Number(editingCollege.developmentFee) +
      Number(editingCollege.aktuExamEnrollmentFee) +
      Number(editingCollege.labLibraryFee) +
      Number(editingCollege.trainingPlacementFee);

    const updated: CollegeFeeStructure = {
      ...editingCollege,
      totalAnnualFee: total,
      lastUpdatedBy: 'AKTU Examination & Finance Cell',
      lastUpdatedAt: new Date().toISOString().split('T')[0],
    };

    saveCollegeFeeStructure(updated);
    setColleges(getCollegeFeeStructures());
    setEditingCollege(null);
    showToast('success', `Fee structure updated for ${updated.collegeName}!`);

    // Also update current student record if under this college
    if (studentFeeRecord) {
      const balance = total - studentFeeRecord.paidAmount;
      const updatedRecord: StudentFeeRecord = {
        ...studentFeeRecord,
        collegeCode: updated.collegeCode,
        collegeName: updated.collegeName,
        tuitionFee: updated.annualTuitionFee,
        developmentFee: updated.developmentFee,
        examEnrollmentFee: updated.aktuExamEnrollmentFee,
        labLibraryFee: updated.labLibraryFee,
        trainingPlacementFee: updated.trainingPlacementFee,
        totalPayable: total,
        balanceDue: Math.max(0, balance),
        status: balance <= 0 ? 'Paid' : studentFeeRecord.paidAmount > 0 ? 'Partial' : 'Due',
      };
      saveStudentFeeRecord(updatedRecord);
      setStudentFeeRecord(updatedRecord);
    }
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFeeRecord) return;
    if (payAmount <= 0) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }

    setPaying(true);
    setTimeout(() => {
      const receiptNo = `REC-AKTU-${Date.now().toString().slice(-6)}`;
      const updated = recordFeePayment(studentFeeRecord.studentId, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        receiptNumber: receiptNo,
        utrNumber: `AKTU/UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        notes: 'Online Student Fee Clearance Installment',
      });

      if (updated) {
        setStudentFeeRecord(updated);
        showToast('success', `Payment of ₹${payAmount.toLocaleString('en-IN')} confirmed successfully!`);
        setShowPayModal(false);
        setActiveReceipt(updated.paymentHistory[0]);
      }
      setPaying(false);
    }, 600);
  };

  const handleGrantClearance = () => {
    if (!studentFeeRecord) return;
    const updated: StudentFeeRecord = {
      ...studentFeeRecord,
      clearanceGranted: true,
    };
    saveStudentFeeRecord(updated);
    setStudentFeeRecord(updated);
    showToast('success', `AKTU Semester Exam Fee Clearance granted for ${studentFeeRecord.studentName}!`);
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
            <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>AKTU Student Fee & College Fee Portal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dr. A.P.J. Abdul Kalam Technical University (AKTU) official fee structures, online dues payment & clearance certificates
          </p>
        </div>

        {role === 'admin' ? (
          <button
            id="btn-edit-current-fee"
            onClick={() => setEditingCollege(activeCollege)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
          >
            <Edit3 className="h-4 w-4" />
            <span>Decide College Fee (Admin)</span>
          </button>
        ) : (
          studentFeeRecord && studentFeeRecord.balanceDue > 0 && (
            <button
              id="btn-pay-student-dues"
              onClick={() => {
                setPayAmount(studentFeeRecord.balanceDue);
                setShowPayModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay Dues (₹{studentFeeRecord.balanceDue.toLocaleString('en-IN')})</span>
            </button>
          )
        )}
      </div>

      {/* AKTU Top Colleges Selector Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              AKTU Affiliated Top Colleges & Universities
            </h3>
          </div>
          {role === 'admin' && (
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
              Admin Mode: Select any college to re-configure annual fees
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {colleges.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCollegeId(c.id)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                activeCollegeId === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">{c.collegeCode}</span>
              <span>{c.collegeName.split('(')[0]}</span>
              <span className="text-[10px] font-bold opacity-90">₹{(c.totalAnnualFee / 1000).toFixed(0)}k</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Cards: College Fee Overview & Student Ledger Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active College Fee Structure Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                AKTU Code: {activeCollege?.collegeCode || 'AKTU-052'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {activeCollege?.collegeName || 'AKTU Affiliated College'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeCollege?.city || 'Uttar Pradesh'}, Uttar Pradesh
              </p>
            </div>
            {role === 'admin' && activeCollege && (
              <button
                onClick={() => setEditingCollege(activeCollege)}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
                title="Edit Fee Structure"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Annual Tuition Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(activeCollege?.annualTuitionFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>University Development Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(activeCollege?.developmentFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>AKTU Exam & Enrollment Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(activeCollege?.aktuExamEnrollmentFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Lab, Library & Digital Portal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(activeCollege?.labLibraryFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Training & Placement (CDC)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(activeCollege?.trainingPlacementFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
              <span>Total Annual Package</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{(activeCollege?.totalAnnualFee || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            Regulated under AKTU Fee Fixation Committee Ordinance. Revised for {activeCollege?.academicYear || '2025 - 2026'}.
          </p>
        </div>

        {/* Student Fee Ledger Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Fee Ledger & Clearance Status
                </h3>
                {studentFeeRecord?.clearanceGranted ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Exam Cleared
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <Clock className="h-3.5 w-3.5" /> Clearance Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {studentFeeRecord ? `${studentFeeRecord.studentName} (${studentFeeRecord.rollNumber})` : 'Select student'}
              </p>
            </div>

            {/* Admin student picker */}
            {role === 'admin' && allStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {studentFeeRecord && (
            <>
              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Applicable</p>
                  <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                    ₹{studentFeeRecord.totalPayable.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Annual B.Tech Package</p>
                </div>

                <div className="rounded-xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/30">
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Total Paid</p>
                  <p className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    ₹{studentFeeRecord.paidAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                    {studentFeeRecord.paymentHistory.length} Transactions Recorded
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50/70 p-3.5 dark:bg-rose-950/30">
                  <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Balance Due</p>
                  <p className="text-xl font-mono font-bold text-rose-700 dark:text-rose-400 mt-1">
                    ₹{studentFeeRecord.balanceDue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-rose-600/80 dark:text-rose-400/70 mt-0.5">
                    Due Date: {studentFeeRecord.dueDate}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Student / Admin */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPayAmount(Math.min(studentFeeRecord.balanceDue || 25000, 25000));
                      setShowPayModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Make Installment Payment</span>
                  </button>

                  {role === 'admin' && !studentFeeRecord.clearanceGranted && (
                    <button
                      onClick={handleGrantClearance}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Grant Exam Clearance</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Receipts available for all completed payments
                </div>
              </div>

              {/* Payment History List */}
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Payment History & Receipts ({studentFeeRecord.paymentHistory.length})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {studentFeeRecord.paymentHistory.map((pmt) => (
                    <div
                      key={pmt.transactionId}
                      className="flex items-center justify-between p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            ₹{pmt.amount.toLocaleString('en-IN')} via {pmt.paymentMethod}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {pmt.receiptNumber} • {pmt.paymentDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                          {pmt.status}
                        </span>
                        <button
                          onClick={() => setActiveReceipt(pmt)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Download className="h-3 w-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Fee Decider Modal */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Decide Fee: {editingCollege.collegeName}
                  </h3>
                  <p className="text-[10px] text-slate-400">AKTU College Code: {editingCollege.collegeCode}</p>
                </div>
              </div>
              <button onClick={() => setEditingCollege(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollegeFee} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Annual Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={500}
                  required
                  value={editingCollege.annualTuitionFee}
                  onChange={(e) =>
                    setEditingCollege({ ...editingCollege, annualTuitionFee: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  University Development Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  required
                  value={editingCollege.developmentFee}
                  onChange={(e) =>
                    setEditingCollege({ ...editingCollege, developmentFee: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    AKTU Exam & Enrollment Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={250}
                    required
                    value={editingCollege.aktuExamEnrollmentFee}
                    onChange={(e) =>
                      setEditingCollege({ ...editingCollege, aktuExamEnrollmentFee: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Lab, Library & Portal Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={250}
                    required
                    value={editingCollege.labLibraryFee}
                    onChange={(e) =>
                      setEditingCollege({ ...editingCollege, labLibraryFee: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Training & Placement Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={250}
                  required
                  value={editingCollege.trainingPlacementFee}
                  onChange={(e) =>
                    setEditingCollege({ ...editingCollege, trainingPlacementFee: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 text-xs flex justify-between items-center font-bold text-indigo-900 dark:text-indigo-200">
                <span>Computed Total Annual Fee:</span>
                <span className="font-mono text-sm">
                  ₹
                  {(
                    Number(editingCollege.annualTuitionFee) +
                    Number(editingCollege.developmentFee) +
                    Number(editingCollege.aktuExamEnrollmentFee) +
                    Number(editingCollege.labLibraryFee) +
                    Number(editingCollege.trainingPlacementFee)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCollege(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  Save & Apply Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Fee Payment Modal */}
      {showPayModal && studentFeeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AKTU Dues Payment Gateway
                </h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="mt-4 space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Student Name & Roll
                </label>
                <p className="font-bold text-slate-900 dark:text-white">
                  {studentFeeRecord.studentName} ({studentFeeRecord.rollNumber})
                </p>
                <p className="text-[10px] text-slate-400">{studentFeeRecord.collegeName}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Installment Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min={500}
                  max={studentFeeRecord.balanceDue}
                  step={500}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 font-mono font-bold text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Remaining balance due: ₹{studentFeeRecord.balanceDue.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['UPI', 'NetBanking', 'Debit Card'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`rounded-xl border p-2.5 text-center font-semibold transition-all ${
                        payMethod === m
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:text-slate-300'
                      }`}
                    >
                      {m === 'NetBanking' ? 'Net Banking' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                <span className="font-bold">Instant AKTU Clearance:</span> Transaction generates an official University e-Receipt and automatically updates your exam clearance standing.
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {paying ? 'Processing Payment...' : `Confirm & Pay ₹${payAmount.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Fee Receipt Modal */}
      {activeReceipt && studentFeeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Dr. A.P.J. Abdul Kalam Technical University (AKTU)
                </p>
                <p className="text-[10px] text-slate-400">Official E-Fee Receipt • Finance Cell</p>
              </div>
              <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between items-center rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 font-mono">
                <div>
                  <p className="text-[10px] text-slate-400">Receipt Number</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{activeReceipt.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Date & Time</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{activeReceipt.paymentDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Student Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{studentFeeRecord.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Roll Number</span>
                  <span className="font-bold font-mono text-indigo-600">{studentFeeRecord.rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">College</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{studentFeeRecord.collegeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Transaction Ref / UTR</span>
                  <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate block">
                    {activeReceipt.utrNumber}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Amount Paid</span>
                <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  ₹{activeReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  This receipt is digitally signed and verified by Dr. A.P.J. Abdul Kalam Technical University (AKTU) Finance Registry.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
