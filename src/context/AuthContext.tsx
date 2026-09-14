import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserRole, Student, UserProfile } from '../types';
import { getStudents, ensureDatabaseSeeded } from '../services/studentService';
import { INITIAL_STUDENTS } from '../firebase/seed';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  currentStudent: Student | null;
  studentsList: Student[];
  loading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setRole: (role: UserRole) => void;
  setCurrentStudent: (student: Student) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  logOut: () => Promise<void>;
  switchDemoUser: (targetRole: UserRole, studentId?: string) => void;
  refreshStudents: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('student');
  const [studentsList, setStudentsList] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudent, setCurrentStudentState] = useState<Student | null>(INITIAL_STUDENTS[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('aktu_dark_mode') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    uid: 'demo-student-vikas',
    email: 'vikasgupta22986@gmail.com',
    displayName: 'Vikas Gupta',
    role: 'student',
    studentId: 'student-vikas',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('aktu_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('aktu_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const refreshStudents = async () => {
    try {
      const list = await getStudents();
      setStudentsList(list);
      if (list.length > 0 && currentStudent) {
        const found = list.find(s => s.id === currentStudent.id);
        if (found) setCurrentStudentState(found);
      }
    } catch (e) {
      console.error('Error refreshing students:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await ensureDatabaseSeeded();
        const list = await getStudents();
        setStudentsList(list);
        if (list.length > 0) {
          setCurrentStudentState(list[0]);
        }
      } catch (err) {
        console.error('Database initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const handleStudentsUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setStudentsList(e.detail);
        if (currentStudent) {
          const found = e.detail.find((s: Student) => s.id === currentStudent.id);
          if (found) setCurrentStudentState(found);
          else if (e.detail.length > 0) setCurrentStudentState(e.detail[0]);
        }
      }
    };
    window.addEventListener('aktu_students_changed', handleStudentsUpdated);

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const isAdmin = firebaseUser.email?.includes('admin') || false;
        const newRole: UserRole = isAdmin ? 'admin' : 'student';
        setRoleState(newRole);

        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Campus User',
          role: newRole,
          photoURL: firebaseUser.photoURL || undefined,
        });
      }
    });

    return () => {
      window.removeEventListener('aktu_students_changed', handleStudentsUpdated);
      unsubscribe();
    };
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      setUserProfile(prev => prev ? { ...prev, role: 'admin', displayName: 'Dr. S. Rao (HOD CSE)' } : null);
    } else {
      if (studentsList.length > 0 && !currentStudent) {
        setCurrentStudentState(studentsList[0]);
      }
      setUserProfile(prev => prev ? { ...prev, role: 'student' } : null);
    }
  };

  const setCurrentStudent = (student: Student) => {
    setCurrentStudentState(student);
    setUserProfile({
      uid: student.id,
      email: student.email,
      displayName: student.name,
      role: 'student',
      studentId: student.id,
      photoURL: student.avatarUrl,
    });
  };

  const switchDemoUser = (targetRole: UserRole, studentId?: string) => {
    if (targetRole === 'admin') {
      setRoleState('admin');
      setUserProfile({
        uid: 'demo-admin-hod',
        email: 'hod.cse@aktu.ac.in',
        displayName: 'Dr. S. Rao (Dean & HOD)',
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      });
    } else {
      setRoleState('student');
      const target = studentsList.find(s => s.id === studentId) || studentsList[0] || INITIAL_STUDENTS[0];
      setCurrentStudent(target);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      setRoleState('student');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, userRole: UserRole) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      setRoleState(userRole);
    } catch (err: any) {
      console.error('Email signup error:', err);
      throw err;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Reset to default demo student
      switchDemoUser('student', 'student-vikas');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        currentStudent,
        studentsList,
        loading,
        darkMode,
        toggleDarkMode,
        setRole,
        setCurrentStudent,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logOut,
        switchDemoUser,
        refreshStudents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
