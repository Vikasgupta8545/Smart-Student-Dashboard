import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Student,
  Subject,
  AttendanceRecord,
  TimetableSlot,
  MarkRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  CampusNotification,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_MARKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EXAMS,
  INITIAL_NOTIFICATIONS,
  generateInitialAttendance,
} from '../firebase/seed';

// Collection Names
export const COLLECTIONS = {
  STUDENTS: 'students',
  SUBJECTS: 'subjects',
  ATTENDANCE: 'attendance',
  TIMETABLE: 'timetable',
  MARKS: 'marks',
  ASSIGNMENTS: 'assignments',
  EXAMS: 'exams',
  NOTIFICATIONS: 'notifications',
  SUBMISSIONS: 'submissions',
};

// Test Firestore connection on boot as recommended by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    const msg = error?.message || String(error);
    const code = error?.code || '';
    if (code === 'unavailable' || msg.includes('the client is offline') || msg.includes('unavailable') || code === 'permission-denied') {
      console.info('Firestore initialized; operating in local cache / offline-resilient mode.');
    } else {
      console.info('Firestore connection validation:', msg);
    }
  }
}
testConnection();

// Concurrency guard for database seeding
let seedingPromise: Promise<void> | null = null;

/**
 * Initializes the Firestore database with realistic college data if it is currently empty
 */
export async function ensureDatabaseSeeded(forceReseed = false): Promise<void> {
  if (seedingPromise) {
    return seedingPromise;
  }

  seedingPromise = (async () => {
    try {
      const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
      const hasOutdatedData = studentsSnap.docs.some(
        (d) => d.id === 'student-21cse104' || d.data().name === 'Rahul Sharma' || d.id === 'student-21cse105'
      );
      const isMissingAktuStudents = !studentsSnap.docs.some((d) => d.id === 'student-vikas');

      if (!forceReseed && !studentsSnap.empty && !hasOutdatedData && !isMissingAktuStudents) {
        return; // Already populated with AKTU data
      }

      console.log('Seeding AKTU 3rd Year B.Tech Engineering dataset to Firestore...');

      const batch = writeBatch(db);

      // 1. Seed All 16 Students
      for (const student of INITIAL_STUDENTS) {
        batch.set(doc(db, COLLECTIONS.STUDENTS, student.id), student);
      }

      // 2. Seed All AKTU Subjects
      for (const subject of INITIAL_SUBJECTS) {
        batch.set(doc(db, COLLECTIONS.SUBJECTS, subject.id), subject);
      }

      // 3. Seed Timetable
      for (const slot of INITIAL_TIMETABLE) {
        batch.set(doc(db, COLLECTIONS.TIMETABLE, slot.id), slot);
      }

      // 4. Seed Marks
      for (const mark of INITIAL_MARKS) {
        batch.set(doc(db, COLLECTIONS.MARKS, mark.id), mark);
      }

      // 5. Seed Assignments
      for (const asg of INITIAL_ASSIGNMENTS) {
        batch.set(doc(db, COLLECTIONS.ASSIGNMENTS, asg.id), asg);
      }

      // 6. Seed Exams
      for (const exam of INITIAL_EXAMS) {
        batch.set(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
      }

      // 7. Seed Notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
        batch.set(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif);
      }

      // 8. Seed Attendance Records
      const attendanceRecords = generateInitialAttendance();
      for (const att of attendanceRecords) {
        batch.set(doc(db, COLLECTIONS.ATTENDANCE, att.id), att);
      }

      await batch.commit();
      console.log('Database successfully seeded with AKTU B.Tech 3rd Year dataset!');
    } catch (error) {
      console.warn('Note on seeding database:', error);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
}

// ======================== STUDENTS ========================

export async function getStudents(): Promise<Student[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (snap.empty) {
      await ensureDatabaseSeeded();
      const freshSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
      if (!freshSnap.empty) {
        return freshSnap.docs.map(d => ({ ...d.data(), id: d.id } as Student));
      }
      return INITIAL_STUDENTS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Student));
  } catch (err) {
    console.warn('getStudents fallback to local defaults:', err);
    return INITIAL_STUDENTS;
  }
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  try {
    const d = await getDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    if (d.exists()) {
      return { ...d.data(), id: d.id } as Student;
    }
    return INITIAL_STUDENTS.find(s => s.id === studentId) || null;
  } catch (err) {
    console.warn('getStudentById fallback:', err);
    return INITIAL_STUDENTS.find(s => s.id === studentId) || null;
  }
}

export async function saveStudent(student: Partial<Student> & { id: string }): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
}

export async function addStudent(studentData: Omit<Student, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), studentData);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function deleteStudent(studentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
}

export async function registerStudentFace(
  studentId: string,
  embedding: number[]
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
    faceRegistered: true,
    faceEmbedding: embedding,
    faceConsentGiven: true,
    faceRegisteredAt: new Date().toISOString(),
  });
}

// ======================== ATTENDANCE ========================

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return generateInitialAttendance().filter(a => a.studentId === studentId);
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord));
  } catch (err) {
    console.warn('getAttendanceForStudent fallback:', err);
    return generateInitialAttendance().filter(a => a.studentId === studentId);
  }
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (snap.empty) {
      return generateInitialAttendance();
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord));
  } catch (err) {
    console.warn('getAllAttendance fallback:', err);
    return generateInitialAttendance();
  }
}

/**
 * Checks if attendance has already been marked for the given student, subject, date, and session
 */
export async function checkDuplicateAttendance(
  studentId: string,
  subjectId: string,
  date: string,
  sessionSlot: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where('studentId', '==', studentId),
      where('subjectId', '==', subjectId),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    const records = snap.docs.map(d => d.data() as AttendanceRecord);
    return records.some(r => r.sessionSlot === sessionSlot);
  } catch (err) {
    console.warn('Duplicate check warning:', err);
    return false;
  }
}

/**
 * Records attendance in Firestore
 */
export async function markAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    // 1. Check duplicate
    const isDuplicate = await checkDuplicateAttendance(
      record.studentId,
      record.subjectId,
      record.date,
      record.sessionSlot
    );

    if (isDuplicate) {
      return {
        success: false,
        message: `Attendance already marked for this subject & class session today (${record.sessionSlot}).`,
      };
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.ATTENDANCE), record);
    await updateDoc(docRef, { id: docRef.id });

    return {
      success: true,
      id: docRef.id,
      message: `Attendance marked successfully via ${record.method === 'face' ? 'Face Recognition' : 'Manual entry'}.`,
    };
  } catch (err: any) {
    console.error('markAttendance error:', err);
    return {
      success: false,
      message: err.message || 'Failed to mark attendance in database.',
    };
  }
}

// ======================== SUBJECTS ========================

export async function getSubjects(): Promise<Subject[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SUBJECTS));
    if (snap.empty) {
      return INITIAL_SUBJECTS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Subject));
  } catch (err) {
    console.warn('getSubjects fallback:', err);
    return INITIAL_SUBJECTS;
  }
}

export async function saveSubject(subject: Subject): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.SUBJECTS, subject.id), subject);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, subjectId));
}

// ======================== TIMETABLE ========================

export async function getTimetable(): Promise<TimetableSlot[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TIMETABLE));
    if (snap.empty) {
      return INITIAL_TIMETABLE;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as TimetableSlot));
  } catch (err) {
    console.warn('getTimetable fallback:', err);
    return INITIAL_TIMETABLE;
  }
}

export async function saveTimetableSlot(slot: TimetableSlot): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.TIMETABLE, slot.id), slot);
}

export async function deleteTimetableSlot(slotId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.TIMETABLE, slotId));
}

// ======================== MARKS ========================

export async function getMarksForStudent(studentId: string): Promise<MarkRecord[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.MARKS),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return INITIAL_MARKS.filter(m => m.studentId === studentId);
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as MarkRecord));
  } catch (err) {
    console.warn('getMarksForStudent fallback:', err);
    return INITIAL_MARKS.filter(m => m.studentId === studentId);
  }
}

export async function getAllMarks(): Promise<MarkRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.MARKS));
    if (snap.empty) {
      return INITIAL_MARKS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as MarkRecord));
  } catch (err) {
    console.warn('getAllMarks fallback:', err);
    return INITIAL_MARKS;
  }
}

export async function saveMarkRecord(mark: MarkRecord): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.MARKS, mark.id), mark);
}

// ======================== ASSIGNMENTS ========================

export async function getAssignments(): Promise<Assignment[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.ASSIGNMENTS));
    if (snap.empty) {
      return INITIAL_ASSIGNMENTS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Assignment));
  } catch (err) {
    console.warn('getAssignments fallback:', err);
    return INITIAL_ASSIGNMENTS;
  }
}

export async function saveAssignment(asg: Assignment): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ASSIGNMENTS, asg.id), asg);
}

export async function deleteAssignment(asgId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ASSIGNMENTS, asgId));
}

export async function submitAssignment(submission: Omit<AssignmentSubmission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), submission);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function getSubmissionsForStudent(studentId: string): Promise<AssignmentSubmission[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as AssignmentSubmission));
  } catch (err) {
    return [];
  }
}

// ======================== EXAMS ========================

export async function getExams(): Promise<Exam[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EXAMS));
    if (snap.empty) {
      return INITIAL_EXAMS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Exam));
  } catch (err) {
    console.warn('getExams fallback:', err);
    return INITIAL_EXAMS;
  }
}

export async function saveExam(exam: Exam): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
}

export async function deleteExam(examId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EXAMS, examId));
}

// ======================== NOTIFICATIONS ========================

export async function getNotifications(): Promise<CampusNotification[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
    if (snap.empty) {
      return INITIAL_NOTIFICATIONS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as CampusNotification));
  } catch (err) {
    console.warn('getNotifications fallback:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export async function addNotification(notif: Omit<CampusNotification, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notif);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), { read: true });
}

export const markNotificationRead = markNotificationAsRead;

export async function saveNotification(notif: CampusNotification): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif);
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
}

// Aliases for compatibility
export const getAttendanceRecords = getAllAttendance;
export const getStudentMarks = getMarksForStudent;
