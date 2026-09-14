import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Terminal,
  Database,
  Key,
  ShieldCheck,
  Cpu,
  Server,
  Code,
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Deployment & Engineering Setup Guide
              </h2>
              <p className="text-xs text-slate-500">
                Complete configuration walkthrough for Firebase, Gemini API, and local execution
              </p>
            </div>
          </div>

          <button
            id="btn-close-setup-modal"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300">
          {/* Section 1: Firebase Project & Auth */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Database className="h-4 w-4 text-indigo-600" />
              1. Firebase Project & Authentication Setup
            </div>
            <ol className="mt-2.5 list-decimal pl-5 space-y-1 text-xs">
              <li>Open the <span className="font-semibold">Firebase Console</span> and create a new project (e.g. <code>smart-campus-erp</code>).</li>
              <li>Under <span className="font-semibold">Build &gt; Authentication</span>, click <em>Get Started</em>.</li>
              <li>Enable <span className="font-semibold">Google Sign-in</span> and <span className="font-semibold">Email/Password</span> sign-in providers.</li>
              <li>Add your authorized domains (e.g. <code>localhost</code> and your deployed Cloud Run URL).</li>
            </ol>
          </div>

          {/* Section 2: Firestore Database & Security Rules */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                2. Firestore Database & Collections
              </div>
              <button
                onClick={() => handleCopy(`// Collections initialized:
// students, subjects, attendance, timetable, marks, assignments, exams, notifications`, 'collections')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                <Copy className="h-3 w-3" />
                {copiedSection === 'collections' ? 'Copied!' : 'Copy Schema'}
              </button>
            </div>
            <p className="mt-1.5 text-xs">
              The application automatically initializes the following primary collections with relational links via <code>studentId</code> and <code>subjectId</code>:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
              {['students', 'subjects', 'attendance', 'timetable', 'marks', 'assignments', 'exams', 'notifications'].map((c) => (
                <span key={c} className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Security rules are strictly deployed via <code>firestore.rules</code> to safeguard student grades, attendance records, and biometric face representations.
            </p>
          </div>

          {/* Section 3: Gemini API & Secure Backend */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Cpu className="h-4 w-4 text-purple-600" />
              3. Gemini API & Secure Backend Architecture
            </div>
            <p className="mt-1.5 text-xs leading-relaxed">
              All Gemini API requests are executed exclusively on the server side using the modern <code>@google/genai</code> SDK with model <code>gemini-3.8-flash</code>.
              Your <code>GEMINI_API_KEY</code> is kept strictly secret and never exposed to the client bundle.
            </p>
            <div className="mt-2 rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200">
              <p className="text-slate-400">// API Endpoints:</p>
              <p className="text-emerald-400">POST /api/gemini/chat</p>
              <p className="text-emerald-400">POST /api/gemini/quiz</p>
              <p className="text-emerald-400">POST /api/gemini/notes</p>
            </div>
          </div>

          {/* Section 4: Environment Variables */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Key className="h-4 w-4 text-amber-500" />
                4. Environment Variables (.env)
              </div>
              <button
                onClick={() => handleCopy(`GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"`, 'env')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                <Copy className="h-3 w-3" />
                {copiedSection === 'env' ? 'Copied!' : 'Copy .env'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-amber-300">
{`GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"`}
            </pre>
          </div>

          {/* Section 5: Running Locally */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Terminal className="h-4 w-4 text-blue-500" />
                5. Running the Project Locally
              </div>
              <button
                onClick={() => handleCopy(`npm install
npm run dev`, 'run')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                <Copy className="h-3 w-3" />
                {copiedSection === 'run' ? 'Copied!' : 'Copy Commands'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-blue-300">
{`# 1. Install dependencies
npm install

# 2. Start full-stack development server on port 3000
npm run dev

# 3. Production build and start
npm run build
npm start`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 text-right dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
