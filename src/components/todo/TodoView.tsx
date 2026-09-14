import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
  CheckCircle2,
  X,
  ListTodo,
  Tag,
  Sparkles,
} from 'lucide-react';
import { TodoItem } from '../../types';
import { getTodos, saveTodo, toggleTodo, deleteTodo } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

export const TodoView: React.FC = () => {
  const { currentStudent, role } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TodoItem['category']>('AKTU Exam');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newDescription, setNewDescription] = useState('');

  const loadTodoList = async () => {
    setLoading(true);
    try {
      const list = await getTodos(role === 'student' ? currentStudent?.id : undefined);
      setTodos(list);
    } catch (e) {
      console.warn('Error loading todos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodoList();

    const handleTodosChanged = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setTodos(
          role === 'student'
            ? e.detail.filter((t: TodoItem) => !t.studentId || t.studentId === currentStudent?.id)
            : e.detail
        );
      }
    };

    window.addEventListener('aktu_todos_changed', handleTodosChanged);
    return () => window.removeEventListener('aktu_todos_changed', handleTodosChanged);
  }, [currentStudent?.id, role]);

  const handleToggle = async (id: string) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString().split('T')[0] : undefined,
            }
          : t
      )
    );
    await toggleTodo(id);
  };

  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteTodo(id);
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
      studentId: role === 'student' ? currentStudent?.id : undefined,
    };

    setTodos((prev) => [newItem, ...prev]);
    await saveTodo(newItem);

    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !t.completed) ||
        (filterStatus === 'completed' && t.completed);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [todos, searchQuery, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const highPriorityActive = todos.filter((t) => !t.completed && t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, highPriorityActive, completionRate };
  }, [todos]);

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
      case 'low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>AKTU Academic To-Do & Tasks</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track exam forms, lab record submissions, project milestones, fee clearance deadlines, and syllabus revision
          </p>
        </div>

        <button
          id="btn-open-add-todo"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? 'Close Form' : 'Add New Task'}</span>
        </button>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {stats.completionRate}% Done
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Tasks
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {stats.active}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Requiring completion</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.completed}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Milestones reached</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            High Priority Deadlines
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {stats.highPriorityActive}
          </p>
          <p className="text-[10px] text-rose-500/80 dark:text-rose-400/80 mt-1">Immediate attention required</p>
        </div>
      </div>

      {/* Add Task Dropdown Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTodo}
          className="rounded-2xl border border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20 p-5 shadow-xs transition-all animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Create New Academic Task</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Verify AKTU Even Semester Exam Form..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="AKTU Exam">AKTU Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Lab Record">Lab Record</option>
                <option value="Project">Project</option>
                <option value="Fee Clearance">Fee Clearance</option>
                <option value="Attendance">Attendance</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Description / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Specific subject codes, room numbers, or links..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="AKTU Exam">AKTU Exam</option>
            <option value="Assignment">Assignment</option>
            <option value="Lab Record">Lab Record</option>
            <option value="Project">Project</option>
            <option value="Fee Clearance">Fee Clearance</option>
            <option value="Attendance">Attendance</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Filter tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Todo List Items */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Loading tasks...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No tasks found in this view
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You are all caught up or no tasks match your active filters.
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date();

            return (
              <div
                key={todo.id}
                className={`group flex items-start justify-between gap-3.5 rounded-2xl border p-4 transition-all ${
                  todo.completed
                    ? 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 opacity-75'
                    : 'border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    id={`btn-toggle-todo-${todo.id}`}
                    onClick={() => handleToggle(todo.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    title={todo.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="h-5 w-5 hover:text-indigo-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityBadge(
                          todo.priority
                        )}`}
                      >
                        {todo.priority}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {todo.category}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold text-slate-900 dark:text-white break-words ${
                        todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {todo.title}
                    </h4>

                    {todo.description && (
                      <p
                        className={`text-xs text-slate-600 dark:text-slate-400 mt-1 break-words ${
                          todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {todo.dueDate}</span>
                      </span>
                      {todo.completed && todo.completedAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Completed on {todo.completedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    id={`btn-delete-todo-${todo.id}`}
                    onClick={() => handleDelete(todo.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
