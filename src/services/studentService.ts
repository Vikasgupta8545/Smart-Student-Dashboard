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
  TodoItem,
  StudentApplication,
  CollegeFeeStructure,
  StudentFeeRecord,
  FeePayment,
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
import {
  INITIAL_COLLEGE_FEES,
  INITIAL_TODOS,
  INITIAL_APPLICATIONS,
  INITIAL_STUDENT_FEES,
} from '../data/aktuFeesAndTasksData';

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
  TODOS: 'todos',
  APPLICATIONS: 'applications',
  FEES_COLLEGES: 'fees_colleges',
  FEES_RECORDS: 'fees_records',
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
const STUDENTS_CACHE_KEY = 'aktu_students_roster_v2';

function getLocalStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STUDENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read local students cache', e);
  }
  // Initialize with initial students if empty
  try {
    localStorage.setItem(STUDENTS_CACHE_KEY, JSON.stringify(INITIAL_STUDENTS));
  } catch {
    // ignore
  }
  return INITIAL_STUDENTS;
}

function saveLocalStudents(students: Student[]) {
  try {
    localStorage.setItem(STUDENTS_CACHE_KEY, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent('aktu_students_changed', { detail: students }));
  } catch (e) {
    console.warn('Failed to save students to localStorage', e);
  }
}

export async function getStudents(): Promise<Student[]> {
  const localList = getLocalStudents();

  // Try fetching from Firestore with a 1.5s timeout to not block UI
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 1500)
    );
    const fetchPromise = getDocs(collection(db, COLLECTIONS.STUDENTS));
    const snap = await Promise.race([fetchPromise, timeoutPromise]);

    if (!snap.empty) {
      const remoteList = snap.docs.map(d => ({ ...d.data(), id: d.id } as Student));
      // Save to local cache for instant subsequent reads
      saveLocalStudents(remoteList);
      return remoteList;
    }
  } catch {
    // Seamless fallback to local cache
  }

  return localList;
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const localList = getLocalStudents();
  const localFound = localList.find(s => s.id === studentId);
  if (localFound) return localFound;

  try {
    const d = await getDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    if (d.exists()) {
      return { ...d.data(), id: d.id } as Student;
    }
  } catch {
    // fallback
  }

  return INITIAL_STUDENTS.find(s => s.id === studentId) || null;
}

export async function saveStudent(student: Partial<Student> & { id: string }): Promise<void> {
  // 1. Immediately update in local cache
  const localList = getLocalStudents();
  const index = localList.findIndex(s => s.id === student.id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...student } as Student;
  } else {
    localList.unshift(student as Student);
  }
  saveLocalStudents(localList);

  // 2. Persist to Firestore in background without blocking
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
  } catch (err) {
    console.warn('saveStudent remote sync note:', err);
  }
}

export async function addStudent(studentData: Omit<Student, 'id'>): Promise<string> {
  const newId = `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newStudent: Student = {
    ...studentData,
    id: newId,
  };

  // 1. Immediately add to local cache
  const localList = getLocalStudents();
  localList.unshift(newStudent);
  saveLocalStudents(localList);

  // 2. Persist to Firestore in background
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, newId), newStudent);
  } catch (err) {
    console.warn('addStudent remote sync note:', err);
  }

  return newId;
}

export async function deleteStudent(studentId: string): Promise<void> {
  // 1. Immediately delete from local cache
  const localList = getLocalStudents();
  const filtered = localList.filter(s => s.id !== studentId);
  saveLocalStudents(filtered);

  // 2. Delete in Firestore in background
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
  } catch (err) {
    console.warn('deleteStudent remote sync note:', err);
  }
}

export async function registerStudentFace(
  studentId: string,
  embedding: number[]
): Promise<void> {
  await saveStudent({
    id: studentId,
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

// ======================== TODOS / TASK MANAGER ========================
const TODOS_CACHE_KEY = 'aktu_todos_v2';

function getLocalTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(TODOS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read todos cache', e);
  }
  try {
    localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(INITIAL_TODOS));
  } catch {
    // ignore
  }
  return INITIAL_TODOS;
}

function saveLocalTodos(todos: TodoItem[]) {
  try {
    localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent('aktu_todos_changed', { detail: todos }));
  } catch (e) {
    console.warn('Failed to write todos cache', e);
  }
}

export async function getTodos(studentId?: string): Promise<TodoItem[]> {
  const localList = getLocalTodos();
  let list = localList;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 1500)
    );
    const snap = await Promise.race([
      getDocs(collection(db, COLLECTIONS.TODOS)),
      timeoutPromise,
    ]);
    if (!snap.empty) {
      const remoteList = snap.docs.map(d => ({ ...d.data(), id: d.id } as TodoItem));
      saveLocalTodos(remoteList);
      list = remoteList;
    }
  } catch {
    // use local
  }

  if (studentId) {
    return list.filter(t => !t.studentId || t.studentId === studentId);
  }
  return list;
}

export async function saveTodo(todo: TodoItem): Promise<void> {
  const list = getLocalTodos();
  const idx = list.findIndex(t => t.id === todo.id);
  if (idx !== -1) {
    list[idx] = todo;
  } else {
    list.unshift(todo);
  }
  saveLocalTodos(list);

  try {
    await setDoc(doc(db, COLLECTIONS.TODOS, todo.id), todo, { merge: true });
  } catch (err) {
    console.warn('saveTodo firestore sync note:', err);
  }
}

export async function toggleTodo(todoId: string): Promise<TodoItem | null> {
  const list = getLocalTodos();
  const todo = list.find(t => t.id === todoId);
  if (!todo) return null;

  const updated: TodoItem = {
    ...todo,
    completed: !todo.completed,
    completedAt: !todo.completed ? new Date().toISOString().split('T')[0] : undefined,
  };

  await saveTodo(updated);
  return updated;
}

export async function deleteTodo(todoId: string): Promise<void> {
  const list = getLocalTodos();
  const filtered = list.filter(t => t.id !== todoId);
  saveLocalTodos(filtered);

  try {
    await deleteDoc(doc(db, COLLECTIONS.TODOS, todoId));
  } catch (err) {
    console.warn('deleteTodo firestore sync note:', err);
  }
}

// ======================== STUDENT APPLICATIONS & LEAVE ========================
const APPLICATIONS_CACHE_KEY = 'aktu_applications_v2';

function getLocalApplications(): StudentApplication[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read applications cache', e);
  }
  try {
    localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
  } catch {
    // ignore
  }
  return INITIAL_APPLICATIONS;
}

function saveLocalApplications(apps: StudentApplication[]) {
  try {
    localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent('aktu_applications_changed', { detail: apps }));
  } catch (e) {
    console.warn('Failed to write applications cache', e);
  }
}

export async function getApplications(studentId?: string): Promise<StudentApplication[]> {
  const localList = getLocalApplications();
  let list = localList;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 1500)
    );
    const snap = await Promise.race([
      getDocs(collection(db, COLLECTIONS.APPLICATIONS)),
      timeoutPromise,
    ]);
    if (!snap.empty) {
      const remote = snap.docs.map(d => ({ ...d.data(), id: d.id } as StudentApplication));
      saveLocalApplications(remote);
      list = remote;
    }
  } catch {
    // use local
  }

  if (studentId) {
    return list.filter(a => a.studentId === studentId);
  }
  return list;
}

export async function submitApplication(appData: Omit<StudentApplication, 'id' | 'status' | 'submittedAt'>): Promise<StudentApplication> {
  const newApp: StudentApplication = {
    ...appData,
    id: `app-${Date.now()}`,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  };

  const list = getLocalApplications();
  list.unshift(newApp);
  saveLocalApplications(list);

  try {
    await setDoc(doc(db, COLLECTIONS.APPLICATIONS, newApp.id), newApp);
  } catch (err) {
    console.warn('submitApplication sync note:', err);
  }

  return newApp;
}

export async function updateApplicationStatus(
  appId: string,
  status: 'Approved' | 'Rejected',
  reviewerName: string,
  remarks?: string
): Promise<void> {
  const list = getLocalApplications();
  const idx = list.findIndex(a => a.id === appId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      reviewRemarks: remarks || (status === 'Approved' ? 'Application approved.' : 'Application rejected.'),
    };
    saveLocalApplications(list);

    try {
      await setDoc(doc(db, COLLECTIONS.APPLICATIONS, appId), list[idx], { merge: true });
    } catch (err) {
      console.warn('updateApplicationStatus sync note:', err);
    }
  }
}

export async function deleteApplication(appId: string): Promise<void> {
  const list = getLocalApplications();
  const filtered = list.filter(a => a.id !== appId);
  saveLocalApplications(filtered);

  try {
    await deleteDoc(doc(db, COLLECTIONS.APPLICATIONS, appId));
  } catch (err) {
    console.warn('deleteApplication sync note:', err);
  }
}

// ======================== AKTU COLLEGE FEES & STUDENT FEE RECORDS ========================
const COLLEGE_FEES_CACHE_KEY = 'aktu_colleges_fee_structures_v2';
const STUDENT_FEES_CACHE_KEY = 'aktu_student_fee_records_v2';

export function getCollegeFeeStructures(): CollegeFeeStructure[] {
  try {
    const raw = localStorage.getItem(COLLEGE_FEES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load college fees', e);
  }
  try {
    localStorage.setItem(COLLEGE_FEES_CACHE_KEY, JSON.stringify(INITIAL_COLLEGE_FEES));
  } catch {
    // ignore
  }
  return INITIAL_COLLEGE_FEES;
}

export function saveCollegeFeeStructure(structure: CollegeFeeStructure): void {
  const list = getCollegeFeeStructures();
  const idx = list.findIndex(c => c.id === structure.id || c.collegeCode === structure.collegeCode);
  if (idx !== -1) {
    list[idx] = structure;
  } else {
    list.push(structure);
  }
  try {
    localStorage.setItem(COLLEGE_FEES_CACHE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('aktu_fee_structures_changed', { detail: list }));
  } catch (e) {
    console.warn('Error saving college fee structure', e);
  }
}

export function getAllStudentFeeRecords(): Record<string, StudentFeeRecord> {
  try {
    const raw = localStorage.getItem(STUDENT_FEES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Failed to load student fee records', e);
  }
  try {
    localStorage.setItem(STUDENT_FEES_CACHE_KEY, JSON.stringify(INITIAL_STUDENT_FEES));
  } catch {
    // ignore
  }
  return INITIAL_STUDENT_FEES;
}

export function getStudentFeeRecord(student: Student, defaultCollegeId = 'iet-lucknow'): StudentFeeRecord {
  const records = getAllStudentFeeRecords();
  if (records[student.id]) {
    return records[student.id];
  }

  // Generate a realistic fee record according to the selected AKTU college
  const colleges = getCollegeFeeStructures();
  const college = colleges.find(c => c.id === defaultCollegeId) || colleges[0];

  const totalPayable = college.totalAnnualFee;
  const paidAmount = Math.min(50000, totalPayable);
  const balanceDue = totalPayable - paidAmount;

  const newRecord: StudentFeeRecord = {
    id: `fee-${student.id}`,
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    collegeCode: college.collegeCode,
    collegeName: college.collegeName,
    academicYear: student.academicYear || '2025 - 2026',
    semester: student.semester || 6,
    tuitionFee: college.annualTuitionFee,
    developmentFee: college.developmentFee,
    examEnrollmentFee: college.aktuExamEnrollmentFee,
    labLibraryFee: college.labLibraryFee,
    trainingPlacementFee: college.trainingPlacementFee,
    hostelFee: 0,
    scholarshipWaiver: 0,
    totalPayable,
    paidAmount,
    balanceDue,
    dueDate: '2026-09-30',
    status: balanceDue <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due',
    clearanceGranted: balanceDue <= 25000,
    paymentHistory: [
      {
        transactionId: `TXN-AKTU-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: paidAmount,
        paymentMethod: 'UPI',
        paymentDate: '2026-08-10',
        status: 'Success',
        receiptNumber: `REC-${college.collegeCode}-2026-0091`,
        utrNumber: 'UPI/2481902837/SBI',
        notes: 'Semester initial fee clearance installment',
      },
    ],
  };

  records[student.id] = newRecord;
  try {
    localStorage.setItem(STUDENT_FEES_CACHE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
  return newRecord;
}

export function saveStudentFeeRecord(record: StudentFeeRecord): void {
  const records = getAllStudentFeeRecords();
  records[record.studentId] = record;
  try {
    localStorage.setItem(STUDENT_FEES_CACHE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('aktu_student_fees_changed', { detail: records }));
  } catch (e) {
    console.warn('Error saving student fee record', e);
  }
}

export function recordFeePayment(
  studentId: string,
  payment: Omit<FeePayment, 'transactionId' | 'status'>
): StudentFeeRecord | null {
  const records = getAllStudentFeeRecords();
  const record = records[studentId];
  if (!record) return null;

  const fullPayment: FeePayment = {
    ...payment,
    transactionId: `TXN-AKTU-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Success',
  };

  const newPaidAmount = record.paidAmount + payment.amount;
  const newBalance = Math.max(0, record.totalPayable - newPaidAmount);

  const updated: StudentFeeRecord = {
    ...record,
    paidAmount: newPaidAmount,
    balanceDue: newBalance,
    status: newBalance === 0 ? 'Paid' : 'Partial',
    clearanceGranted: newBalance <= 20000 ? true : record.clearanceGranted,
    paymentHistory: [fullPayment, ...record.paymentHistory],
  };

  records[studentId] = updated;
  try {
    localStorage.setItem(STUDENT_FEES_CACHE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('aktu_student_fees_changed', { detail: records }));
  } catch (e) {
    console.warn('Error saving student fee payment', e);
  }

  return updated;
}

// Aliases for compatibility
export const getAttendanceRecords = getAllAttendance;
export const getStudentMarks = getMarksForStudent;

