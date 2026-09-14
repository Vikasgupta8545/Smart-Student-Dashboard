import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  ShieldCheck,
  LogOut,
  Sparkles,
  HelpCircle,
  Menu,
  GraduationCap,
  ChevronDown,
  Camera,
  Key,
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  BookOpen,
  BookMarked,
  Award,
  FileText,
  Clock,
  BarChart3,
  Users,
  X,
  ArrowRight,
  Layers,
  CheckSquare,
  Send,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CampusNotification, Subject, Student } from '../../types';
import { ActiveTab } from './Sidebar';
import { AKTU_BTECH_3RD_YEAR_SYLLABUS } from '../../data/aktuSyllabus';

interface NavbarProps {
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  subjects?: Subject[];
  notifications?: CampusNotification[];
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenSetupGuide?: () => void;
  onOpenAiChat?: () => void;
  onOpenAuthModal?: () => void;
  onOpenFaceKiosk?: () => void;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'student-dashboard',
  onSelectTab,
  subjects = [],
  notifications = [],
  unreadCount,
  onOpenNotifications,
  onOpenSetupGuide,
  onOpenAiChat,
  onOpenAuthModal,
  onOpenFaceKiosk,
  onToggleSidebar,
  searchQuery = '',
  onSearchChange,
}) => {
  const {
    role,
    currentStudent,
    studentsList,
    switchDemoUser,
    setCurrentStudent,
    darkMode,
    toggleDarkMode,
    logOut,
    userProfile,
  } = useAuth();

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setStudentDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const safeNotifications = notifications || [];
  const unreadNotifs =
    typeof unreadCount === 'number'
      ? unreadCount
      : safeNotifications.filter((n) => !n?.read).length;

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab?.(tab);
    setSearchFocused(false);
    setMobileSearchOpen(false);
  };

  const isCurrentTab = (itemId: string) => {
    if (activeTab === itemId) return true;
    if (itemId === 'student-dashboard' && (activeTab === 'dashboard' || activeTab === 'student-dashboard')) return true;
    if (itemId === 'student-attendance' && (activeTab === 'attendance' || activeTab === 'student-attendance')) return true;
    if (itemId === 'student-timetable' && (activeTab === 'timetable' || activeTab === 'student-timetable')) return true;
    if (itemId === 'student-subjects' && (activeTab === 'subjects' || activeTab === 'student-subjects')) return true;
    if (itemId === 'student-syllabus' && (activeTab === 'syllabus' || activeTab === 'student-syllabus')) return true;
    if (itemId === 'student-marks' && (activeTab === 'marks' || activeTab === 'student-marks')) return true;
    if (itemId === 'student-assignments' && (activeTab === 'assignments' || activeTab === 'student-assignments')) return true;
    if (itemId === 'student-exams' && (activeTab === 'exams' || activeTab === 'student-exams')) return true;
    if (itemId === 'admin-dashboard' && (activeTab === 'dashboard' || activeTab === 'admin-dashboard')) return true;
    if (itemId === 'admin-syllabus' && (activeTab === 'syllabus' || activeTab === 'admin-syllabus')) return true;
    return false;
  };

  // Horizontal navbar links
  const studentLinks: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-todo', label: 'To-Do', icon: CheckSquare },
    { id: 'student-applications', label: 'Applications', icon: Send },
    { id: 'student-fees', label: 'Fees', icon: CreditCard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-timetable', label: 'Timetable', icon: Calendar },
    { id: 'student-subjects', label: 'Subjects', icon: BookOpen },
    { id: 'student-syllabus', label: 'Syllabus', icon: BookMarked },
    { id: 'student-marks', label: 'Marks', icon: Award },
    { id: 'student-assignments', label: 'Assignments', icon: FileText },
    { id: 'student-exams', label: 'Exams', icon: Clock },
  ];

  const adminLinks: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-fees', label: 'AKTU Fees', icon: CreditCard },
    { id: 'admin-applications', label: 'Applications', icon: Send },
    { id: 'admin-todo', label: 'To-Do', icon: CheckSquare },
    { id: 'admin-attendance', label: 'Face Kiosk', icon: Camera },
    { id: 'admin-subjects', label: 'Subjects', icon: BookOpen },
    { id: 'admin-syllabus', label: 'Syllabus', icon: BookMarked },
    { id: 'admin-timetable', label: 'Timetable', icon: Calendar },
    { id: 'admin-marks', label: 'Marks', icon: Award },
    { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
  ];

  const navLinks = role === 'student' ? studentLinks : adminLinks;

  // Search Results Computation across Students, Subjects, Syllabus Units, and Exams
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchingStudents = studentsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchingSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.facultyName.toLowerCase().includes(q)
    ).slice(0, 5);

    // Search inside actual syllabus unit topics
    const matchingSyllabusTopics: Array<{ subjectCode: string; subjectName: string; topic: string }> = [];
    Object.entries(AKTU_BTECH_3RD_YEAR_SYLLABUS).forEach(([code, syl]) => {
      syl.units.forEach((u) => {
        u.topics.forEach((t) => {
          if (t.toLowerCase().includes(q) && matchingSyllabusTopics.length < 5) {
            matchingSyllabusTopics.push({
              subjectCode: code,
              subjectName: syl.courseTitle,
              topic: t,
            });
          }
        });
      });
    });

    const totalCount =
      matchingStudents.length + matchingSubjects.length + matchingSyllabusTopics.length;

    return {
      students: matchingStudents,
      subjects: matchingSubjects,
      syllabus: matchingSyllabusTopics,
      totalCount,
    };
  }, [searchQuery, studentsList, subjects]);

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      {/* Primary Top Bar */}
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle navigation menu"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo and Institution Title */}
          <button
            id="navbar-brand-logo"
            onClick={() => handleNavClick(role === 'student' ? 'student-dashboard' : 'admin-dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                AKTU Campus Portal
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block leading-none">
                B.Tech CSE 3rd Year
              </span>
            </div>
          </button>

          {/* Global Search Input with Interactive Dropdown */}
          <div className="relative hidden md:block md:w-64 lg:w-80 ml-2" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              placeholder={role === 'student' ? 'Search subjects, syllabus, students...' : 'Search students, courses, topics...'}
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setSearchFocused(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Live Search Results Flyout */}
            {searchFocused && searchResults && (
              <div className="absolute left-0 top-full mt-2 w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Search Results ({searchResults.totalCount})
                  </span>
                  <button
                    onClick={() => setSearchFocused(false)}
                    className="text-[10px] text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-2 max-h-80 overflow-y-auto space-y-3 pr-1">
                  {/* Matching Subjects */}
                  {searchResults.subjects.length > 0 && (
                    <div>
                      <div className="px-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Subjects & Labs
                      </div>
                      <div className="mt-1 space-y-1">
                        {searchResults.subjects.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              handleNavClick(role === 'student' ? 'student-syllabus' : 'admin-syllabus');
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-1.5 font-bold">
                                  {s.code}
                                </span>
                                {s.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Sem {s.semester} • {s.facultyName} • {s.credits} Credits
                              </p>
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Syllabus Topics */}
                  {searchResults.syllabus.length > 0 && (
                    <div>
                      <div className="px-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <BookMarked className="h-3 w-3" />
                        Syllabus Concepts
                      </div>
                      <div className="mt-1 space-y-1">
                        {searchResults.syllabus.map((top, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleNavClick(role === 'student' ? 'student-syllabus' : 'admin-syllabus');
                            }}
                            className="flex w-full items-start justify-between rounded-lg p-2 text-left text-xs hover:bg-amber-50/60 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div>
                              <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                                {top.subjectCode} - {top.subjectName}
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-1">
                                {top.topic}
                              </p>
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-400 mt-1 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Students */}
                  {searchResults.students.length > 0 && (
                    <div>
                      <div className="px-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Students ({searchResults.students.length})
                      </div>
                      <div className="mt-1 space-y-1">
                        {searchResults.students.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => {
                              if (role === 'student') {
                                setCurrentStudent(st);
                              } else {
                                handleNavClick('admin-students');
                              }
                              setSearchFocused(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {st.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {st.rollNumber} • CGPA: {st.cgpa}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {role === 'student' ? 'Switch' : 'View'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.totalCount === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No matching subjects, topics, or students found for &quot;{searchQuery}&quot;.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Role Toggle, Student Switcher, Actions, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle mobile search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Quick Role Toggle (Student vs Admin) */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              id="btn-role-student"
              onClick={() => {
                switchDemoUser('student', currentStudent?.id);
                onSelectTab?.('student-dashboard');
              }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>
            <button
              id="btn-role-admin"
              onClick={() => {
                switchDemoUser('admin');
                onSelectTab?.('admin-dashboard');
              }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Student Switcher Dropdown (in Student role) */}
          {role === 'student' && (
            <div className="relative" ref={studentDropdownRef}>
              <button
                id="btn-student-switcher"
                onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="truncate max-w-[85px] sm:max-w-[110px] font-semibold">
                  {currentStudent?.name || 'Vikas Gupta'}
                </span>
                <span className="rounded bg-indigo-100 px-1 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hidden sm:inline">
                  {currentStudent?.rollNumber?.slice(-5) || '10002'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {studentDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Student ({studentsList.length} Total)
                  </div>
                  {studentsList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentStudent(s);
                        setStudentDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                        currentStudent?.id === s.id
                          ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={s.avatarUrl}
                          alt={s.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {s.rollNumber} • {s.section}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {s.cgpa}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Mentor Trigger */}
          {onOpenAiChat && (
            <button
              id="btn-navbar-ai-assistant"
              onClick={onOpenAiChat}
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              title="Open Gemini AI Academic Mentor"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>AI Mentor</span>
            </button>
          )}

          {/* Face Attendance Kiosk Action */}
          {onOpenFaceKiosk && (
            <button
              id="btn-navbar-face-kiosk"
              onClick={onOpenFaceKiosk}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="Launch Face Recognition Attendance Kiosk"
            >
              <Camera className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Face Kiosk</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            id="btn-notifications-bell"
            onClick={onOpenNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Campus announcements and alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-dark-mode-toggle"
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode theme"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Setup Guide Dialog Trigger */}
          <button
            id="btn-setup-guide"
            onClick={onOpenSetupGuide}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Architecture & Firestore Setup Guide"
            aria-label="Setup guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              id="btn-user-profile-menu"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center rounded-full ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all"
            >
              <img
                src={
                  userProfile?.photoURL ||
                  (role === 'student' ? currentStudent?.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80') ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                }
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {role === 'student' ? (currentStudent?.name || 'Vikas Gupta') : 'Dr. S. Rao'}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {role === 'student' ? (currentStudent?.email || 'vikasgupta22986@gmail.com') : 'hod.cse@aktu.ac.in'}
                  </p>
                  <span className="mt-1 inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {role === 'student' ? `Roll: ${currentStudent?.rollNumber || '2200270100002'}` : 'Admin Authority'}
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  {onOpenAuthModal && (
                    <button
                      id="btn-menu-account-auth"
                      onClick={() => {
                        onOpenAuthModal();
                        setProfileDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                    >
                      <Key className="h-3.5 w-3.5 text-indigo-500" />
                      Google Sign-In / Auth
                    </button>
                  )}
                  <button
                    id="btn-menu-logout"
                    onClick={() => {
                      logOut();
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Reset Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {mobileSearchOpen && (
        <div className="border-t border-slate-200 bg-slate-50 p-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects, syllabus, students..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* Secondary Horizontal Nav Bar - Direct Links across Desktop and Tablets */}
      <div className="hidden sm:flex items-center gap-1 border-t border-slate-100 bg-slate-50/70 px-4 py-1.5 dark:border-slate-800/80 dark:bg-slate-900/50 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
          Navigation:
        </span>
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrentTab(item.id);

          return (
            <button
              key={item.id}
              id={`navbar-tab-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium shrink-0 transition-colors ${
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
