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
      academicYear: '2021 - 2025',
      phone: '+91 98765 00000',
      cgpa: 8.5,
      sgpa: 8.6,
      mentor: 'Dr. S. Rao',
      faceRegistered: false,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    });
    setModalMode('add');
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setModalMode('edit');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student ${name}?`)) return;
    try {
      await deleteStudent(id);
      onRefresh();
    } catch (e: any) {
      alert(`Delete error: ${e.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await addStudent(editingStudent as Omit<Student, 'id'>);
      } else if (modalMode === 'edit' && editingStudent.id) {
        await saveStudent(editingStudent as Student);
      }
      setModalMode('none');
      onRefresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Student Roster Management
          </h2>
          <p className="text-xs text-slate-500">
            Enroll students, update academic records, and configure facial biometric credentials
          </p>
        </div>

        <button
          id="btn-add-new-student"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
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

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="all">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information">Information Technology</option>
          <option value="Electronics">Electronics & Communication</option>
        </select>
      </div>

      {/* Student List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Department & Sem</th>
                <th className="py-3.5 px-4 text-center">CGPA</th>
                <th className="py-3.5 px-4 text-center">Face Biometrics</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                        <p className="text-[11px] text-slate-400">{st.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">
                    {st.rollNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{st.department}</p>
                    <p className="text-[11px] text-slate-400">Semester {st.semester}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {st.cgpa}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        st.faceRegistered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {st.faceRegistered ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Enrolled
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" /> Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Register Face ID"
                        onClick={() => onOpenFaceRegister(st)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
                      >
                        <Camera className="h-4 w-4" />
                      </button>

                      <button
                        title="Edit Student Info"
                        onClick={() => handleOpenEdit(st)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        title="Delete Student"
                        onClick={() => handleDelete(st.id, st.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {modalMode === 'add' ? 'Enroll New Student' : `Edit Student: ${editingStudent.name}`}
              </h3>
              <button
                onClick={() => setModalMode('none')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.rollNumber || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={editingStudent.department || 'Computer Science & Engineering'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={editingStudent.semester || 6}
                    onChange={(e) => setEditingStudent({ ...editingStudent, semester: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={editingStudent.cgpa || 8.0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cgpa: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Faculty Mentor
                  </label>
                  <input
                    type="text"
                    value={editingStudent.mentor || 'Dr. S. Rao'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, mentor: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
