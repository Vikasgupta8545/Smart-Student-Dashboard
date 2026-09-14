import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  FileText,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { askGeminiAssistant, generateQuizFromAI, generateNotesFromAI, ChatMessage } from '../../services/aiService';
import { Subject, MarkRecord, AttendanceRecord, Exam, Assignment, TimetableSlot } from '../../types';
import { StudentAcademicContext } from '../../api/gemini';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects?: Subject[];
  marks?: MarkRecord[];
  attendance?: AttendanceRecord[];
  exams?: Exam[];
  assignments?: Assignment[];
  timetable?: TimetableSlot[];
  student?: any;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  subjects = [],
  marks = [],
  attendance = [],
  exams = [],
  assignments = [],
  timetable = [],
}) => {
  const { currentStudent } = useAuth();

  const [activeMode, setActiveMode] = useState<'chat' | 'quiz' | 'notes'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const safeSubjects = subjects || [];
  const safeMarks = marks || [];
  const safeAttendance = attendance || [];
  const safeExams = exams || [];
  const safeAssignments = assignments || [];
  const safeTimetable = timetable || [];

  // Quiz generator state
  const [quizSubject, setQuizSubject] = useState<string>(safeSubjects[0]?.name || 'Database Management Systems');
  const [quizTopic, setQuizTopic] = useState('Transactions and Concurrency Control');
  const [generatedQuiz, setGeneratedQuiz] = useState<any[]>([]);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Notes generator state
  const [notesSubject, setNotesSubject] = useState<string>(safeSubjects[0]?.name || 'Distributed Systems');
  const [notesTopic, setNotesTopic] = useState('Paxos & Raft Consensus Protocols');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Compute student academic context for grounding
  const studentContext: StudentAcademicContext = {
    studentName: currentStudent?.name || 'Student',
    rollNumber: currentStudent?.rollNumber || 'N/A',
    semester: `Semester ${currentStudent?.semester || 6}`,
    department: currentStudent?.department || 'Computer Science & Engineering',
    overallAttendance: safeAttendance.length > 0
      ? Math.round((safeAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length / safeAttendance.length) * 100)
      : 82,
    attendanceBySubject: safeSubjects.map(sub => {
      const subAtt = safeAttendance.filter(a => a.subjectId === sub.id || a.subjectCode === sub.code);
      const attended = subAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const total = subAtt.length || sub.totalClasses || 30;
      return {
        subjectName: sub.name,
        percentage: total > 0 ? Math.round((attended / total) * 100) : 80,
        attended,
        total,
      };
    }),
    subjects: safeSubjects.map(s => ({ code: s.code, name: s.name, credits: s.credits })),
    marks: safeMarks.map(m => ({
      subjectName: m.subjectName,
      internal1: m.internal1,
      internal2: m.internal2,
      maxMarks: 30,
      grade: m.grade,
    })),
    weakSubjects: safeMarks
      .filter(m => (m.internal1 + m.internal2) / 60 < 0.7)
      .map(m => m.subjectName),
    upcomingExams: safeExams.map(e => ({
      subjectName: e.subjectName,
      date: e.date,
      time: e.startTime,
    })),
    pendingAssignments: safeAssignments.map(a => ({
      title: a.title,
      subjectName: a.subjectName,
      dueDate: a.dueDate,
    })),
    todayTimetable: safeTimetable
      .filter(t => t.day === 'Monday') // sample today
      .map(t => ({ time: `${t.startTime} - ${t.endTime}`, subjectName: t.subjectName, room: t.roomNumber })),
  };

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && currentStudent) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'model',
          text: `👋 Hello **${currentStudent.name}**! I'm your dedicated **CampusAI Academic Mentor**.\n\nI have full real-time access to your **Semester ${currentStudent.semester}** timetable, internal marks, attendance logs, and upcoming exams.\n\nHere are some things you can ask me:\n- *"What should I study today?"*\n- *"Analyze my attendance & calculate safe classes"*\n- *"Identify my weak subjects and create a revision plan"*\n- *"Generate an MCQ quiz for Database Management Systems"*\n- *"Explain Raft consensus vs Paxos in simple terms"*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentStudent]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));
      const reply = await askGeminiAssistant(text, historyPayload, studentContext);

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: `Error connecting to AI service: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuizGeneration = async () => {
    setQuizLoading(true);
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const quiz = await generateQuizFromAI(quizSubject, quizTopic, 4);
      setGeneratedQuiz(quiz);
    } catch (e) {
      console.error(e);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleRunNotesGeneration = async () => {
    setNotesLoading(true);
    setCopiedNotes(false);
    try {
      const notes = await generateNotesFromAI(notesSubject, notesTopic);
      setGeneratedNotes(notes);
    } catch (e) {
      console.error(e);
    } finally {
      setNotesLoading(false);
    }
  };

  const calculateQuizScore = () => {
    let score = 0;
    generatedQuiz.forEach((q, idx) => {
      if (userQuizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  CampusAI Academic Mentor
                </h2>
                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalized study companion for {currentStudent?.name} ({currentStudent?.rollNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="hidden sm:flex rounded-lg bg-slate-200/70 p-0.5 dark:bg-slate-800">
              <button
                onClick={() => setActiveMode('chat')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeMode === 'chat'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Chat Mentor
              </button>
              <button
                onClick={() => setActiveMode('quiz')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeMode === 'quiz'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                MCQ Quiz
              </button>
              <button
                onClick={() => setActiveMode('notes')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeMode === 'notes'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Study Notes
              </button>
            </div>

            <button
              id="btn-close-ai-modal"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher */}
        <div className="flex sm:hidden border-b border-slate-100 px-3 py-1.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 gap-1">
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex-1 rounded-md py-1 text-xs font-semibold text-center ${
              activeMode === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`flex-1 rounded-md py-1 text-xs font-semibold text-center ${
              activeMode === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveMode('notes')}
            className={`flex-1 rounded-md py-1 text-xs font-semibold text-center ${
              activeMode === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Notes
          </button>
        </div>

        {/* TAB 1: Chat Mode */}
        {activeMode === 'chat' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Quick Prompt Pills */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
              {[
                'What should I study today?',
                'Analyze my attendance & weak subjects',
                'Create a 3-day exam preparation plan',
                'Explain Raft consensus vs Paxos',
                'How to score 9+ SGPA this semester?',
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill)}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/40"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Chat message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`mt-1.5 text-[10px] ${
                        msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white animate-pulse">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/80">
                    <span className="inline-flex items-center gap-1">
                      Thinking & analyzing academic records
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask CampusAI about courses, attendance, exams, concepts..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MCQ Quiz Generator */}
        {activeMode === 'quiz' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-5 space-y-5">
            {/* Quiz Configuration Controls */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generate Instant Engineering Practice Quiz
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Topic / Sub-area
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. B+ Tree Indexing or Raft Consensus"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleRunQuizGeneration}
                  disabled={quizLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {quizLoading ? 'Generating Quiz...' : 'Generate 4 Questions'}
                </button>
              </div>
            </div>

            {/* Questions View */}
            {generatedQuiz.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {quizSubject} — {quizTopic}
                  </h4>
                  {quizSubmitted && (
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      Score: {calculateQuizScore()} / {generatedQuiz.length} (
                      {Math.round((calculateQuizScore() / generatedQuiz.length) * 100)}%)
                    </div>
                  )}
                </div>

                {generatedQuiz.map((q, qIdx) => {
                  const selected = userQuizAnswers[qIdx];
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        <span className="text-indigo-600 mr-1.5">Q{qIdx + 1}.</span>
                        {q.question}
                      </p>

                      <div className="mt-3 space-y-2">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const isOptionSelected = selected === optIdx;
                          let optStyle = 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300';
                            } else if (isOptionSelected && !isCorrect) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setUserQuizAnswers({ ...userQuizAnswers, [qIdx]: optIdx })}
                              className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-colors ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              )}
                              {quizSubmitted && isOptionSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          <span className="font-semibold text-indigo-600">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-end pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(userQuizAnswers).length < generatedQuiz.length}
                      className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Submit Answers & See Score
                    </button>
                  ) : (
                    <button
                      onClick={handleRunQuizGeneration}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try Another Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Notes Generator */}
        {activeMode === 'notes' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-5 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                High-Yield Engineering Revision Notes Generator
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <select
                    value={notesSubject}
                    onChange={(e) => setNotesSubject(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Concept / Syllabus Unit
                  </label>
                  <input
                    type="text"
                    value={notesTopic}
                    onChange={(e) => setNotesTopic(e.target.value)}
                    placeholder="e.g. Distributed 2-Phase Commit or Normal Forms"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleRunNotesGeneration}
                  disabled={notesLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {notesLoading ? 'Generating Cheat Sheet...' : 'Generate High-Yield Notes'}
                </button>
              </div>
            </div>

            {generatedNotes && (
              <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {notesSubject} — {notesTopic}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedNotes);
                      setCopiedNotes(true);
                      setTimeout(() => setCopiedNotes(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedNotes ? 'Copied to Clipboard!' : 'Copy Notes'}
                  </button>
                </div>

                <div className="mt-4 whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                  {generatedNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
