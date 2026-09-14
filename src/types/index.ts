export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  studentId?: string; // links to student document
}

export interface Student {
  id: string;
  rollNumber: string; // e.g. "21CSE104"
  name: string;
  email: string;
  phone: string;
  department: string; // "Computer Science & Engineering"
  semester: number; // 6
  section: string; // "A"
  cgpa: number; // 8.74
  sgpa: number; // 8.90
  batch: string; // "2022-2026"
  avatarUrl?: string;
  faceRegistered: boolean;
  faceEmbedding?: number[]; // 128-d biometric descriptor vector
  faceConsentGiven?: boolean;
  faceRegisteredAt?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  lectureHours: number;
  topics: string[];
  keyOutcomes?: string;
}

export interface SubjectSyllabus {
  courseCode: string;
  courseTitle: string;
  department: string;
  semester: number;
  credits: number;
  evaluationScheme: {
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
  };
  courseObjectives: string[];
  units: SyllabusUnit[];
  textbooks: string[];
  referenceBooks: string[];
}

export interface Subject {
  id: string;
  code: string; // "KCS-501"
  name: string; // "Database Management Systems"
  department: string;
  semester: number;
  credits: number; // 4
  facultyName: string;
  facultyEmail: string;
  roomNumber: string;
  totalClasses: number;
  syllabusTopics: string[];
  syllabusUnits?: SyllabusUnit[];
  textbooks?: string[];
  referenceBooks?: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  confidence?: number;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:15 AM"
  sessionSlot: string; // "10:00 - 11:00 AM"
  status: 'Present' | 'Absent' | 'Late';
  method: 'face' | 'manual';
  verifiedBy?: string; // admin or system
  remark?: string;
  timestamp: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // "09:00 AM"
  endTime: string; // "10:00 AM"
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
  type: 'Theory' | 'Lab' | 'Tutorial';
  semester: number;
  section: string;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  internal1: number; // out of 30
  internal2: number; // out of 30
  assignmentMarks: number; // out of 20
  attendanceMarks?: number; // out of 10
  totalInternal?: number; // out of 50 (or normalized)
  totalMarks?: number;
  semesterEndExam?: number; // out of 100
  grade?: string; // 'A+', 'A', 'B+', 'B', 'C', 'F'
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  maxMarks: number;
  semester: number;
  section?: string;
  assignedDate?: string;
  fileAttachmentUrl?: string;
  status?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  status: 'Submitted' | 'Graded' | 'Pending Review';
  marksAwarded?: number;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string; // "Mid-Term Examination March 2026"
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00 AM"
  endTime: string; // "01:00 PM"
  roomNumber: string;
  totalMarks: number;
  semester: number;
  syllabus: string[];
}

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'normal';
  target?: 'all' | 'students' | 'admins';
  studentId?: string; // for direct personal warnings
  date?: string;
  timestamp?: string;
  createdAt?: string;
  read?: boolean;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'tip' | 'praise' | 'alert';
  title: string;
  description: string;
  actionText?: string;
  metric?: string;
  relatedSubject?: string;
}
