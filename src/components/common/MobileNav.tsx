import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Sparkles,
  Menu,
  Users,
  Camera,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from './Sidebar';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  onOpenSidebar,
}) => {
  const { role } = useAuth();
  const handleSelect = (tab: ActiveTab) => (onSelectTab || setActiveTab)?.(tab);

  if (role === 'student') {
    const isHome = activeTab === 'student-dashboard' || activeTab === 'dashboard';
    const isAtt = activeTab === 'student-attendance' || activeTab === 'attendance';
    const isTT = activeTab === 'student-timetable' || activeTab === 'timetable';
    const isAi = activeTab === 'student-ai' || activeTab === 'ai-assistant';

    return (
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
      >
        <button
          id="btn-mobile-dashboard"
          onClick={() => handleSelect('student-dashboard')}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
            isHome
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          id="btn-mobile-attendance"
          onClick={() => handleSelect('student-attendance')}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
            isAtt
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <CalendarCheck className="h-5 w-5" />
          <span>Attendance</span>
        </button>

        <button
          id="btn-mobile-timetable"
          onClick={() => handleSelect('student-timetable')}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
            isTT
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Timetable</span>
        </button>

        <button
          id="btn-mobile-ai"
          onClick={() => handleSelect('student-ai')}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
            isAi
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span>AI Tutor</span>
        </button>

        <button
          id="btn-mobile-more"
          onClick={onOpenSidebar}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </nav>
    );
  }

  // Admin mobile nav
  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
    >
      <button
        id="btn-mobile-admin-dashboard"
        onClick={() => handleSelect('admin-dashboard')}
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
          activeTab === 'admin-dashboard'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Overview</span>
      </button>

      <button
        id="btn-mobile-admin-students"
        onClick={() => handleSelect('admin-students')}
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
          activeTab === 'admin-students'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
        }`}
      >
        <Users className="h-5 w-5" />
        <span>Students</span>
      </button>

      <button
        id="btn-mobile-admin-kiosk"
        onClick={() => handleSelect('admin-attendance')}
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
          activeTab === 'admin-attendance'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
        }`}
      >
        <Camera className="h-5 w-5" />
        <span>Face Kiosk</span>
      </button>

      <button
        id="btn-mobile-admin-reports"
        onClick={() => handleSelect('admin-reports')}
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
          activeTab === 'admin-reports'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
        }`}
      >
        <BarChart3 className="h-5 w-5" />
        <span>Reports</span>
      </button>

      <button
        id="btn-mobile-admin-more"
        onClick={onOpenSidebar}
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400"
      >
        <Menu className="h-5 w-5" />
        <span>All Tools</span>
      </button>
    </nav>
  );
};
