import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { SetupGuideModal } from './components/common/SetupGuideModal';
import { AuthModal } from './components/common/AuthModal';
import { FloatingAiButton } from './components/ai/FloatingAiButton';
import { AiChatModal } from './components/ai/AiChatModal';
import { FaceRegisterModal } from './components/attendance/FaceRegisterModal';

// Student View Modules
import { StudentDashboardView } from './components/student/StudentDashboardView';
import { StudentAttendanceView } from './components/student/StudentAttendanceView';
import { StudentTimetableView } from './components/student/StudentTimetableView';
import { StudentSubjectsView } from './components/student/StudentSubjectsView';
import { StudentMarksView } from './components/student/StudentMarksView';
import { StudentAssignmentsView } from './components/student/StudentAssignmentsView';
import { StudentExamsView } from './components/student/StudentExamsView';
import { StudentProfileView } from './components/student/StudentProfileView';
import { SubjectSyllabusView } from './components/syllabus/SubjectSyllabusView';

// Admin View Modules
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminStudentsView } from './components/admin/AdminStudentsView';
import { FaceAttendanceKiosk } from './components/attendance/FaceAttendanceKiosk';
import { AdminSubjectsView } from './components/admin/AdminSubjectsView';
import { AdminTimetableView } from './components/admin/AdminTimetableView';
import { AdminMarksView } from './components/admin/AdminMarksView';
import { AdminAssignmentsView } from './components/admin/AdminAssignmentsView';
import { AdminExamsView } from './components/admin/AdminExamsView';
import { AdminAnnouncementsView } from './components/admin/AdminAnnouncementsView';
import { AdminReportsView } from './components/admin/AdminReportsView';

// Data Services
import {
  ensureDatabaseSeeded,
  getSubjects,
  getAttendanceRecords,
  getTimetable,
  getStudentMarks,
  getAssignments,
  getExams,
  getNotifications,
  markNotificationRead,
} from './services/studentService';

import {
  Subject,
  AttendanceRecord,
  TimetableSlot,
  MarkRecord,
  Assignment,
  Exam,
  CampusNotification,
  Student,
} from './types';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, currentStudent, studentsList, refreshStudents } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('student-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [faceRegisterStudent, setFaceRegisterStudent] = useState<Student | null>(null);

  // Application Data States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Initial Data Fetch and Seed Check
  const loadAllData = useCallback(async () => {
    try {
      setDataLoading(true);
      await ensureDatabaseSeeded();

      const [subs, att, tt, mrk, asg, exm, notifs] = await Promise.all([
        getSubjects(),
        getAttendanceRecords(),
        getTimetable(),
        getStudentMarks(currentStudent?.id || 'student-vikas'),
        getAssignments(),
        getExams(),
        getNotifications(),
      ]);

      setSubjects(subs);
      setAttendance(att);
      setTimetable(tt);
      setMarks(mrk);
      setAssignments(asg);
      setExams(exm);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading college data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [currentStudent?.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Adjust activeTab when role changes if tab is not valid for new role
  useEffect(() => {
    if (role === 'admin') {
      if (
        activeTab === 'dashboard' ||
        activeTab === 'student-dashboard' ||
        activeTab === 'timetable' ||
        activeTab === 'student-timetable' ||
        activeTab === 'attendance' ||
        activeTab === 'student-attendance' ||
        activeTab === 'subjects' ||
        activeTab === 'student-subjects' ||
        activeTab === 'marks' ||
        activeTab === 'student-marks' ||
        activeTab === 'assignments' ||
        activeTab === 'student-assignments' ||
        activeTab === 'exams' ||
        activeTab === 'student-exams' ||
        activeTab === 'profile' ||
        activeTab === 'student-profile' ||
        activeTab === 'ai-assistant' ||
        activeTab === 'student-ai'
      ) {
        setActiveTab('admin-dashboard');
      }
    } else if (role === 'student' && activeTab.startsWith('admin-')) {
      setActiveTab('student-dashboard');
    }
  }, [role]);

  // Notification handlers
  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Student specific attendance filter
  const studentAttendance = currentStudent
    ? attendance.filter((a) => a.studentId === currentStudent.id)
    : attendance;

  // Filtered lists if search query is active
  const filteredSubjects = searchQuery.trim()
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : subjects;

  // Render view router based on role and activeTab
  const renderMainView = () => {
    if (dataLoading) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">
            Initializing Smart Student Management System...
          </p>
        </div>
      );
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
        case 'admin-dashboard':
          return (
            <AdminDashboardView
              students={studentsList}
              subjects={filteredSubjects}
              attendance={attendance}
              timetable={timetable}
              marks={marks}
              onNavigate={setActiveTab}
            />
          );
        case 'admin-students':
          return (
            <AdminStudentsView
              students={studentsList}
              onOpenFaceRegister={(st) => setFaceRegisterStudent(st)}
              onRefresh={() => {
                refreshStudents();
                loadAllData();
              }}
            />
          );
        case 'admin-attendance':
        case 'admin-face-register':
          return (
            <FaceAttendanceKiosk
              students={studentsList}
              subjects={subjects}
              onAttendanceMarked={loadAllData}
            />
          );
        case 'admin-subjects':
          return <AdminSubjectsView subjects={filteredSubjects} onRefresh={loadAllData} />;
        case 'admin-syllabus':
        case 'syllabus':
          return (
            <SubjectSyllabusView
              subjects={subjects}
              onOpenAiAssistant={() => setIsAiChatOpen(true)}
            />
          );
        case 'admin-timetable':
          return (
            <AdminTimetableView
              timetable={timetable}
              subjects={subjects}
              onRefresh={loadAllData}
            />
          );
        case 'admin-marks':
          return (
            <AdminMarksView
              marks={marks}
              students={studentsList}
              subjects={subjects}
              onRefresh={loadAllData}
            />
          );
        case 'admin-assignments':
          return (
            <AdminAssignmentsView
              assignments={assignments}
              subjects={subjects}
              onRefresh={loadAllData}
            />
          );
        case 'admin-exams':
          return <AdminExamsView exams={exams} subjects={subjects} onRefresh={loadAllData} />;
        case 'admin-announcements':
          return (
            <AdminAnnouncementsView
              notifications={notifications}
              onRefresh={loadAllData}
            />
          );
        case 'admin-reports':
          return (
            <AdminReportsView
              students={studentsList}
              attendance={attendance}
              marks={marks}
              subjects={subjects}
            />
          );
        default:
          return (
            <AdminDashboardView
              students={studentsList}
              subjects={filteredSubjects}
              attendance={attendance}
              timetable={timetable}
              marks={marks}
              onNavigate={setActiveTab}
            />
          );
      }
    }

    // Role === 'student'
    if (!currentStudent) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-3">
          <p className="text-xs font-semibold text-slate-500">Student record not loaded.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
      case 'student-dashboard':
        return (
          <StudentDashboardView
            student={currentStudent}
            subjects={filteredSubjects}
            attendance={studentAttendance}
            timetable={timetable}
            marks={marks}
            assignments={assignments}
            exams={exams}
            notifications={notifications}
            onNavigate={setActiveTab}
            onOpenAiAssistant={() => setIsAiChatOpen(true)}
            onOpenFaceKiosk={() => setActiveTab('admin-attendance')}
          />
        );
      case 'attendance':
      case 'student-attendance':
        return (
          <StudentAttendanceView
            student={currentStudent}
            subjects={subjects}
            attendance={studentAttendance}
          />
        );
      case 'timetable':
      case 'student-timetable':
        return <StudentTimetableView timetable={timetable} />;
      case 'subjects':
      case 'student-subjects':
        return (
          <StudentSubjectsView
            subjects={filteredSubjects}
            onNavigateToSyllabus={() => setActiveTab('student-syllabus')}
          />
        );
      case 'syllabus':
      case 'student-syllabus':
        return (
          <SubjectSyllabusView
            subjects={subjects}
            onOpenAiAssistant={() => setIsAiChatOpen(true)}
          />
        );
      case 'marks':
      case 'student-marks':
        return (
          <StudentMarksView
            student={currentStudent}
            marks={marks}
            onOpenAiAssistant={() => setIsAiChatOpen(true)}
          />
        );
      case 'assignments':
      case 'student-assignments':
        return (
          <StudentAssignmentsView
            student={currentStudent}
            assignments={assignments}
            onRefresh={loadAllData}
          />
        );
      case 'exams':
      case 'student-exams':
        return <StudentExamsView exams={exams} />;
      case 'profile':
      case 'student-profile':
        return (
          <StudentProfileView
            student={currentStudent}
            onRegisterFaceClick={() => setFaceRegisterStudent(currentStudent)}
          />
        );
      case 'ai-assistant':
      case 'student-ai':
        return (
          <div className="space-y-6 pb-12">
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 text-center shadow-xs dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                Gemini AI Academic Assistant
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-slate-600 dark:text-slate-300">
                Get personalized exam prep schedules, grade projection calculations, and smart academic recommendations tailored to your curriculum.
              </p>
              <button
                onClick={() => setIsAiChatOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-transform active:scale-95"
              >
                Launch Gemini AI Academic Dialog
              </button>
            </div>
          </div>
        );
      default:
        return (
          <StudentDashboardView
            student={currentStudent}
            subjects={filteredSubjects}
            attendance={studentAttendance}
            timetable={timetable}
            marks={marks}
            assignments={assignments}
            exams={exams}
            notifications={notifications}
            onNavigate={setActiveTab}
            onOpenAiAssistant={() => setIsAiChatOpen(true)}
            onOpenFaceKiosk={() => setActiveTab('admin-attendance')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Fixed Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        subjects={subjects}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenFaceKiosk={() => setActiveTab('admin-attendance')}
        unreadCount={unreadNotificationCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Responsive Container */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 pb-20 lg:pb-12">
        <div className="flex gap-6">
          {/* Desktop Left Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Core Content Area */}
          <main className="min-w-0 flex-1">{renderMainView()}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Floating Gemini AI Quick Assistant Trigger */}
      <FloatingAiButton
        onClick={() => setIsAiChatOpen(true)}
        isOpen={isAiChatOpen}
      />

      {/* Gemini AI Interactive Chat Modal */}
      <AiChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        student={currentStudent}
        subjects={subjects}
        attendance={studentAttendance}
        marks={marks}
      />

      {/* Campus Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onClearAll={handleClearAllNotifications}
      />

      {/* Developer & College Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Face Biometrics Enrollment Camera Modal */}
      {faceRegisterStudent && (
        <FaceRegisterModal
          isOpen={!!faceRegisterStudent}
          onClose={() => setFaceRegisterStudent(null)}
          student={faceRegisterStudent}
          onRegistrationSuccess={() => {
            setFaceRegisterStudent(null);
            refreshStudents();
            loadAllData();
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
