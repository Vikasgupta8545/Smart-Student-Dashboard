import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, switchDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name, selectedRole);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isSignUp ? 'Create College Account' : 'Campus Portal Login'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Register as Student or Faculty' : 'Sign in to access student or admin modules'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs">
          {isSignUp && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Institutional Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@aktu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Account Role</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`rounded-xl border py-2 text-center font-bold transition-all ${
                    selectedRole === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`rounded-xl border py-2 text-center font-bold transition-all ${
                    selectedRole === 'admin'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  Admin / Faculty
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Workspace Account</span>
        </button>

        {/* Quick Demo Access Switchers */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
          <p className="text-[11px] font-semibold text-slate-500 mb-2">Instant Demo Access Profiles</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                switchDemoUser('student');
                onClose();
              }}
              className="flex-1 rounded-lg bg-indigo-50 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
            >
              Demo Student
            </button>
            <button
              onClick={() => {
                switchDemoUser('admin');
                onClose();
              }}
              className="flex-1 rounded-lg bg-purple-50 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {isSignUp ? 'Sign In here' : 'Sign Up here'}
          </button>
        </p>
      </div>
    </div>
  );
};
