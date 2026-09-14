import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  BookMarked,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  FileDown,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Copy,
  Check,
  Bookmark,
} from 'lucide-react';
import { Subject } from '../../types';
import { AKTU_BTECH_3RD_YEAR_SYLLABUS } from '../../data/aktuSyllabus';

interface SubjectSyllabusViewProps {
  subjects: Subject[];
  onOpenAiAssistant?: (prompt?: string) => void;
  initialSubjectCode?: string;
}

export const SubjectSyllabusView: React.FC<SubjectSyllabusViewProps> = ({
  subjects,
  onOpenAiAssistant,
  initialSubjectCode,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(initialSubjectCode || 'KCS-501');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 5 | 6 | 'lab'>('all');
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Available subjects with syllabus details
  const currentSyllabus = AKTU_BTECH_3RD_YEAR_SYLLABUS[selectedCode];
  const currentSubject = subjects.find((s) => s.code === selectedCode) || {
    id: 'unknown',
    code: selectedCode,
    name: currentSyllabus?.courseTitle || 'Course Syllabus',
    department: 'Computer Science & Engineering',
    semester: currentSyllabus?.semester || 6,
    credits: currentSyllabus?.credits || 4,
    facultyName: 'AKTU Faculty Board',
    facultyEmail: 'curriculum@aktu.ac.in',
    roomNumber: 'LH-301',
    totalClasses: 42,
    syllabusTopics: [],
  };

  // Filtered list of subjects for sidebar / selector
  const selectableSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const isLab = sub.code.includes('55') || sub.code.includes('65');
      if (semesterFilter === 'lab') return isLab;
      if (semesterFilter === 5) return sub.semester === 5 && !isLab;
      if (semesterFilter === 6) return sub.semester === 6 && !isLab;
      return true;
    });
  }, [subjects, semesterFilter]);

  const toggleUnit = (unitNum: number) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitNum]: !prev[unitNum],
    }));
  };

  const expandAll = () => {
    setExpandedUnits({ 1: true, 2: true, 3: true, 4: true, 5: true });
  };

  const collapseAll = () => {
    setExpandedUnits({ 1: false, 2: false, 3: false, 4: false, 5: false });
  };

  const handleCopySyllabus = () => {
    if (!currentSyllabus) return;
    const text = `AKTU B.Tech CSE (3rd Year) Syllabus: ${currentSyllabus.courseCode} - ${currentSyllabus.courseTitle}
Credits: ${currentSyllabus.credits} | Internal: ${currentSyllabus.evaluationScheme.internalMarks} | External: ${currentSyllabus.evaluationScheme.externalMarks}
Total Units: ${currentSyllabus.units.length}

${currentSyllabus.units
  .map(
    (u) =>
      `UNIT ${u.unitNumber}: ${u.title} (${u.lectureHours} Hours)
Topics:
${u.topics.map((t) => ` - ${t}`).join('\n')}`
  )
  .join('\n\n')}

Prescribed Textbooks:
${currentSyllabus.textbooks.map((b) => ` - ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered topics within the active unit if syllabusSearch is typed
  const filteredUnits = useMemo(() => {
    if (!currentSyllabus) return [];
    if (!syllabusSearch.trim()) return currentSyllabus.units;

    const query = syllabusSearch.toLowerCase();
    return currentSyllabus.units.filter(
      (unit) =>
        unit.title.toLowerCase().includes(query) ||
        unit.topics.some((topic) => topic.toLowerCase().includes(query)) ||
        (unit.keyOutcomes && unit.keyOutcomes.toLowerCase().includes(query))
    );
  }, [currentSyllabus, syllabusSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-md dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                <GraduationCap className="h-3.5 w-3.5" />
                AKTU Lucknow Curriculum
              </span>
              <span className="text-[11px] text-indigo-200">
                B.Tech Computer Science & Engineering (3rd Year)
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Official Subject Syllabus & Curriculum
            </h1>
            <p className="mt-1 text-xs text-indigo-200 max-w-2xl">
              Prescribed 5-unit syllabus breakdown, examination marks evaluation schemes, lecture hours, reference textbooks, and important course outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySyllabus}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-colors"
            >
              {copiedSubject ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copiedSubject ? 'Copied' : 'Copy Syllabus'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Print / Save PDF
            </button>
            {onOpenAiAssistant && (
              <button
                onClick={() =>
                  onOpenAiAssistant(
                    `Please provide a comprehensive exam revision guide, important Previous Year Questions (PYQs), and key 2-mark and 10-mark question predictions for ${currentSubject.code}: ${currentSubject.name} based on the official AKTU 5-unit syllabus.`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-400 transition-transform active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Ask Gemini for Revision Notes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Semester & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSemesterFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              semesterFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => setSemesterFilter(5)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              semesterFilter === 5
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            5th Semester (Odd)
          </button>
          <button
            onClick={() => setSemesterFilter(6)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              semesterFilter === 6
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            6th Semester (Even)
          </button>
          <button
            onClick={() => setSemesterFilter('lab')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              semesterFilter === 'lab'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Practical / Labs
          </button>
        </div>

        {/* In-Syllabus Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics or concepts..."
            value={syllabusSearch}
            onChange={(e) => setSyllabusSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Subject Navigation List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            AKTU Subjects ({selectableSubjects.length})
          </h3>

          <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
            {selectableSubjects.map((sub) => {
              const isSelected = sub.code === selectedCode;
              const hasFullSyllabus = !!AKTU_BTECH_3RD_YEAR_SYLLABUS[sub.code];

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedCode(sub.code);
                    setSyllabusSearch('');
                  }}
                  className={`w-full text-left rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {sub.code}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h4 className="mt-1 text-xs font-semibold line-clamp-1 leading-snug">
                    {sub.name}
                  </h4>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Sem {sub.semester}</span>
                    {hasFullSyllabus ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        5 Units Full
                      </span>
                    ) : (
                      <span>Lab Course</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Subject Syllabus Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Subject Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {currentSubject.code}
                  </span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Semester {currentSubject.semester} • B.Tech CSE
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {currentSubject.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Faculty Instructor: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentSubject.facultyName}</span> ({currentSubject.facultyEmail}) • Venue: {currentSubject.roomNumber}
                </p>
              </div>

              {/* Badges / Metrics */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-700 dark:bg-slate-800/60 min-w-[76px]">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    {currentSubject.credits}
                  </span>
                  <span className="text-[10px] text-slate-500">Credits</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-700 dark:bg-slate-800/60 min-w-[76px]">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    {currentSubject.totalClasses}
                  </span>
                  <span className="text-[10px] text-slate-500">Lectures</span>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-2.5 text-center dark:border-indigo-900/50 dark:bg-indigo-950/30 min-w-[84px]">
                  <span className="block text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    30 / 70
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Int / Ext</span>
                </div>
              </div>
            </div>

            {/* Course Objectives */}
            {currentSyllabus?.courseObjectives && (
              <div className="mt-5 rounded-xl bg-slate-50/80 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Award className="h-4 w-4 text-amber-500" />
                  Course Objectives & Pedagogical Goals
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {currentSyllabus.courseObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-indigo-500 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Unit Syllabus Accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Prescribed Units & Detailed Syllabus
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={expandAll}
                  className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Expand All
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={collapseAll}
                  className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Units Rendering */}
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => {
                const isOpen = !!expandedUnits[unit.unitNumber];
                return (
                  <div
                    key={unit.unitNumber}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      onClick={() => toggleUnit(unit.unitNumber)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                          U{unit.unitNumber}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Unit {unit.unitNumber}: {unit.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {unit.lectureHours} Lecture Hours • {unit.topics.length} Core Topics
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-800/20 space-y-3">
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Detailed Topics:
                          </h5>
                          <ul className="space-y-2">
                            {unit.topics.map((topic, tIdx) => (
                              <li
                                key={tIdx}
                                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                              >
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {unit.keyOutcomes && (
                          <div className="rounded-lg bg-indigo-50/60 p-2.5 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/50">
                            <span className="font-bold">Expected Outcome:</span> {unit.keyOutcomes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : currentSubject.syllabusTopics.length > 0 ? (
              // Fallback for lab subjects or list items
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Practical Laboratory Curriculum & Experiments:
                </h4>
                <ul className="space-y-2">
                  {currentSubject.syllabusTopics.map((top, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{top}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                No syllabus units match your search keyword &quot;{syllabusSearch}&quot;.
              </div>
            )}
          </div>

          {/* Textbooks & References Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Prescribed Textbooks (AKTU Recommended)
              </h4>
              <ul className="mt-3 space-y-2.5">
                {(currentSyllabus?.textbooks || currentSubject.textbooks || [
                  'Standard AKTU prescribed department textbook',
                ]).map((book, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">[{bIdx + 1}]</span>
                    <span>{book}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-amber-500" />
                Supplementary Reference Literature
              </h4>
              <ul className="mt-3 space-y-2.5">
                {(currentSyllabus?.referenceBooks || currentSubject.referenceBooks || [
                  'National Digital Library of India (NDLI) reference journals',
                ]).map((ref, rIdx) => (
                  <li
                    key={rIdx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-bold text-amber-500">[{rIdx + 1}]</span>
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AKTU Examination Evaluation Scheme Card */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-5 dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              AKTU University Question Paper Pattern & Evaluation Criteria
            </h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/80">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Section A (20 Marks)</span>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  10 short answer compulsory questions of 2 marks each covering all 5 units equally.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/80">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Section B (30 Marks)</span>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Attempt any 3 questions out of 5 long analytical questions (10 marks each).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/80">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Section C (50 Marks)</span>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  5 long descriptive questions (1 from each unit) with internal choice (10 marks each).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
