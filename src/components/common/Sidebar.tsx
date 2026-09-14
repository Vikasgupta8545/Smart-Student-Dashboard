import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  BookOpen,
  BookMarked,
  Award,
  FileText,
  Clock,
  Sparkles,
  User,
  Users,
  Camera,
  Layers,
  BellRing,
  BarChart3,
  GraduationCap,
  Shield,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab =
  // Student tabs
  | 'dashboard'
  | 'attendance'
  | 'timetable'
  | 'subjects'
  | 'syllabus'
  | 'marks'
  | 'assignments'
  | 'exams'
  | 'ai-assistant'
  | 'profile'
  | 'student-dashboard'
  | 'student-attendance'
  | 'student-timetable'
  | 'student-subjects'
  | 'student-syllabus'
  | 'student-marks'
  | 'student-assignments'
  | 'student-exams'
  | 'student-ai'
  | 'student-profile'
  // Admin tabs
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-face-register'
  | 'admin-attendance'
  | 'admin-subjects'
  | 'admin-syllabus'
  | 'admin-timetable'
  | 'admin-marks'
  | 'admin-assignments'
  | 'admin-exams'
  | 'admin-announcements'
  | 'admin-reports';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  isOpen = false,
  onClose = () => {},
}) => {
  const { role, currentStudent } = useAuth();

  const handleSelectTab = (tab: ActiveTab) => {
    (onSelectTab || setActiveTab)?.(tab);
    onClose?.();
  };

  const isTabActive = (itemId: string) => {
    if (activeTab === itemId) return true;
    if (itemId === 'student-dashboard' && (activeTab === 'dashboard' || activeTab === 'student-dashboard')) return true;
    if (itemId === 'student-attendance' && (activeTab === 'attendance' || activeTab === 'student-attendance')) return true;
    if (itemId === 'student-timetable' && (activeTab === 'timetable' || activeTab === 'student-timetable')) return true;
    if (itemId === 'student-subjects' && (activeTab === 'subjects' || activeTab === 'student-subjects')) return true;
    if (itemId === 'student-syllabus' && (activeTab === 'syllabus' || activeTab === 'student-syllabus')) return true;
    if (itemId === 'student-marks' && (activeTab === 'marks' || activeTab === 'student-marks')) return true;
    if (itemId === 'student-assignments' && (activeTab === 'assignments' || activeTab === 'student-assignments')) return true;
    if (itemId === 'student-exams' && (activeTab === 'exams' || activeTab === 'student-exams')) return true;
    if (itemId === 'student-ai' && (activeTab === 'ai-assistant' || activeTab === 'student-ai')) return true;
    if (itemId === 'student-profile' && (activeTab === 'profile' || activeTab === 'student-profile')) return true;
    if (itemId === 'admin-dashboard' && (activeTab === 'dashboard' || activeTab === 'admin-dashboard')) return true;
    if (itemId === 'admin-syllabus' && (activeTab === 'syllabus' || activeTab === 'admin-syllabus')) return true;
    return false;
  };

  const studentNavItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-timetable', label: 'Timetable', icon: Calendar },
    { id: 'student-subjects', label: 'Subjects', icon: BookOpen },
    { id: 'student-syllabus', label: 'Subject Syllabus', icon: BookMarked, badge: 'AKTU' },
    { id: 'student-marks', label: 'Marks', icon: Award },
    { id: 'student-assignments', label: 'Assignments', icon: FileText, badge: '2 Due' },
    { id: 'student-exams', label: 'Exams', icon: Clock, badge: 'Upcoming' },
    { id: 'student-ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'student-profile', label: 'Profile', icon: User },
  ];

  const adminNavItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'admin-dashboard', label: 'College Overview', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Manage Students', icon: Users },
    { id: 'admin-attendance', label: 'Face Attendance Kiosk', icon: Camera, badge: 'Live AI' },
    { id: 'admin-subjects', label: 'Manage Subjects', icon: BookOpen },
    { id: 'admin-syllabus', label: 'AKTU Syllabus', icon: BookMarked, badge: 'Official' },
    { id: 'admin-timetable', label: 'Manage Timetable', icon: Calendar },
    { id: 'admin-marks', label: 'Marks & Internal Tests', icon: Award },
    { id: 'admin-assignments', label: 'Assignments', icon: FileText },
    { id: 'admin-exams', label: 'Exam Schedules', icon: Layers },
    { id: 'admin-announcements', label: 'Announcements', icon: BellRing },
    { id: 'admin-reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const currentNavItems = role === 'student' ? studentNavItems : adminNavItems;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* College Crest & Portal Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Apex Institute
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Engineering & Tech Portal
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            id="btn-close-sidebar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="mx-4 mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-xs ${
                role === 'student' ? 'bg-indigo-600' : 'bg-purple-600'
              }`}
            >
              {role === 'student' ? <GraduationCap className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {role === 'student' ? currentStudent?.name || 'Student Portal' : 'Administrator Hub'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {role === 'student' ? `${currentStudent?.rollNumber} • Sem ${currentStudent?.semester}` : 'Department of CSE'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {role === 'student' ? 'Student Workspace' : 'Academic Administration'}
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isTabActive(item.id);

            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Live AI'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom footer status */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 text-center">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Connected
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
