import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Camera,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  GraduationCap,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Student } from '../../types';
import { addStudent, saveStudent, deleteStudent } from '../../services/studentService';

interface AdminStudentsViewProps {
  students: Student[];
  onOpenFaceRegister: (student: Student) => void;
  onRefresh: () => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({
  students,
  onOpenFaceRegister,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter students
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || s.department.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingStudent({
      name: '',
      rollNumber: `21CSE${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      department: 'Computer Science & Engineering',
      semester: 6,
      academicYear: '2025 - 2026',
      phone: '+91 98765 00000',
      cgpa: 8.5,
      sgpa: 8.6,
      mentor: 'Dr. S. Rao',
      faceRegistered: false,
      avatarUrl: `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 1000)}?w=200&auto=format&fit=crop&q=80`,
    });
    setModalMode('add');
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent({ ...student });
    setModalMode('edit');
  };

  const confirmDelete = async () => {
    if (!deletingStudent) return;
    setSaving(true);
    try {
      await deleteStudent(deletingStudent.id);
      showToast('success', `Student ${deletingStudent.name} (${deletingStudent.rollNumber}) deleted successfully.`);
      setDeletingStudent(null);
      onRefresh();
    } catch (e: any) {
      showToast('error', `Failed to delete student: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent.name?.trim() || !editingStudent.rollNumber?.trim()) {
      showToast('error', 'Name and Roll Number are required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const studentPayload: Omit<Student, 'id'> = {
          name: editingStudent.name.trim(),
          rollNumber: editingStudent.rollNumber.trim(),
          email: editingStudent.email?.trim() || `${editingStudent.name.toLowerCase().replace(/\s+/g, '')}@aktu.ac.in`,
          department: editingStudent.department || 'Computer Science & Engineering',
          semester: Number(editingStudent.semester) || 6,
          section: editingStudent.section || 'A',
          batch: editingStudent.batch || '2022-2026',
          academicYear: editingStudent.academicYear || '2025 - 2026',
          phone: editingStudent.phone || '+91 98765 00000',
          cgpa: Number(editingStudent.cgpa) || 8.0,
          sgpa: Number(editingStudent.sgpa) || 8.0,
          mentor: editingStudent.mentor || 'Dr. S. Rao',
          faceRegistered: false,
          avatarUrl: editingStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        };
        await addStudent(studentPayload);
        showToast('success', `Student ${studentPayload.name} enrolled successfully!`);
      } else if (modalMode === 'edit' && editingStudent.id) {
        await saveStudent(editingStudent as Student);
        showToast('success', `Student ${editingStudent.name} updated successfully!`);
      }
      setModalMode('none');
      onRefresh();
    } catch (err: any) {
      showToast('error', `Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-semibold shadow-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>AKTU Student Roster Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {students.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dr. A.P.J. Abdul Kalam Technical University (AKTU) • Add, edit, delete & manage biometric facial credentials
          </p>
        </div>

        <button
          id="btn-add-new-student"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or institutional email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Information">Information Technology</option>
            <option value="Electronics">Electronics & Communication</option>
          </select>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Roll / Dept</th>
                <th className="py-3 px-4">Semester & CGPA</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Biometric Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No students match your query.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt={st.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Mentor: {st.mentor || 'Dr. S. Rao'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
                        {st.rollNumber}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[150px] truncate">
                        {st.department}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Sem {st.semester}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          CGPA {st.cgpa}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        SGPA: {st.sgpa || st.cgpa}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] truncate max-w-[140px]">{st.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{st.phone || '+91 98765 00000'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          st.faceRegistered
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {st.faceRegistered ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Registered
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            Pending Face
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-register-face-${st.id}`}
                          title="Register Face ID"
                          onClick={() => onOpenFaceRegister(st)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 transition-colors"
                        >
                          <Camera className="h-4 w-4" />
                        </button>

                        <button
                          id={`btn-edit-student-${st.id}`}
                          title="Edit Student Info"
                          onClick={() => handleOpenEdit(st)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`btn-delete-student-${st.id}`}
                          title="Delete Student"
                          onClick={() => setDeletingStudent(st)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-3">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Student Record?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-200">{deletingStudent.name}</span> (Roll: <span className="font-mono font-bold text-indigo-600">{deletingStudent.rollNumber}</span>)? This will remove their profile and attendance associations.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                id="btn-cancel-delete"
                onClick={() => setDeletingStudent(null)}
                disabled={saving}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={saving}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {modalMode === 'add' ? 'Enroll New Student in AKTU' : `Edit Student: ${editingStudent.name}`}
                </h3>
              </div>
              <button
                onClick={() => setModalMode('none')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Gupta"
                    value={editingStudent.name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    AKTU Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 21CSE101"
                    value={editingStudent.rollNumber || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value.toUpperCase() })}
                    className="mt-1 w-full font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@aktu.ac.in"
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={editingStudent.department || 'Computer Science & Engineering'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Semester
                  </label>
                  <select
                    value={editingStudent.semester || 6}
                    onChange={(e) => setEditingStudent({ ...editingStudent, semester: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s} (Year {Math.ceil(s / 2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    CGPA (0 - 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={editingStudent.cgpa ?? 8.0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cgpa: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Faculty Mentor
                  </label>
                  <input
                    type="text"
                    value={editingStudent.mentor || 'Dr. S. Rao'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, mentor: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Enroll Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
