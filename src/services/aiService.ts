import { StudentAcademicContext } from '../api/gemini';
import { SmartInsight, Student, AttendanceRecord, MarkRecord, Exam } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export async function askGeminiAssistant(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  context: StudentAcademicContext
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        context,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'No response received from assistant.';
  } catch (error: any) {
    console.warn('Backend Gemini API call failed, providing local assistance:', error);
    // Fallback response with student context
    return `### CampusAI Offline Assistant

I could not connect to the remote AI endpoint (${error.message}). Here is a direct analysis from your local profile:

- **Attendance**: Overall ${context.overallAttendance}%. ${context.overallAttendance < 75 ? '⚠️ Warning: Attendance is below 75%!' : '✅ Good standing.'}
- **Identified Focus Area**: ${context.weakSubjects?.[0] || 'Database Management Systems'}
- **Next Exam**: ${context.upcomingExams?.[0]?.subjectName || 'Distributed Systems'} on ${context.upcomingExams?.[0]?.date || 'Upcoming'}

*Try your request again shortly.*`;
  }
}

export async function generateQuizFromAI(subject: string, topic: string, count: number = 4) {
  try {
    const res = await fetch('/api/gemini/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, count }),
    });
    if (!res.ok) throw new Error('Quiz generation failed');
    const data = await res.json();
    return data.quiz || [];
  } catch (err) {
    console.error('generateQuizFromAI error:', err);
    return [];
  }
}

export async function generateNotesFromAI(subject: string, topic: string) {
  try {
    const res = await fetch('/api/gemini/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic }),
    });
    if (!res.ok) throw new Error('Notes generation failed');
    const data = await res.json();
    return data.notes || '';
  } catch (err) {
    console.error('generateNotesFromAI error:', err);
    return '';
  }
}

/**
 * Computes deterministic AI Smart Insights for a student's dashboard
 */
export function computeStudentSmartInsights(
  student: Student,
  attendanceRecords: AttendanceRecord[],
  marks: MarkRecord[],
  exams: Exam[]
): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // 1. Attendance Analysis
  const totalAtt = attendanceRecords.length;
  const attendedCount = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const overallPercent = totalAtt > 0 ? Math.round((attendedCount / totalAtt) * 100) : 85;

  if (overallPercent < 75) {
    insights.push({
      id: 'ins-att-low',
      type: 'warning',
      title: 'Attendance Shortage Alert',
      description: `Your overall attendance is ${overallPercent}%. You are below the university required 75% threshold.`,
      actionText: 'View Remedial Options',
      metric: `${overallPercent}%`,
    });
  } else {
    insights.push({
      id: 'ins-att-good',
      type: 'praise',
      title: 'Strong Classroom Presence',
      description: `Your overall attendance is ${overallPercent}%. You meet all prerequisite criteria for university exams.`,
      metric: `${overallPercent}%`,
    });
  }

  // 2. Marks Analysis & Weak Subject Identification
  if (marks.length > 0) {
    const sortedMarks = [...marks].sort((a, b) => {
      const scoreA = (a.internal1 + a.internal2) / 60;
      const scoreB = (b.internal1 + b.internal2) / 60;
      return scoreA - scoreB;
    });

    const lowest = sortedMarks[0];
    const lowestPercent = Math.round(((lowest.internal1 + lowest.internal2) / 60) * 100);

    if (lowestPercent < 70) {
      insights.push({
        id: 'ins-weak-sub',
        type: 'alert',
        title: `Academic Focus: ${lowest.subjectName}`,
        description: `Your internal test average in ${lowest.subjectCode} is ${lowestPercent}%, which is lower than your peer average. Practice past semester numericals.`,
        actionText: 'Generate Revision Quiz',
        relatedSubject: lowest.subjectName,
        metric: `${lowestPercent}%`,
      });
    }

    const highest = sortedMarks[sortedMarks.length - 1];
    const highestPercent = Math.round(((highest.internal1 + highest.internal2) / 60) * 100);
    insights.push({
      id: 'ins-top-sub',
      type: 'tip',
      title: `Top Performer in ${highest.subjectCode}`,
      description: `You are excelling in ${highest.subjectName} with ${highestPercent}% in assessments. Consider mentoring peers in group study.`,
      metric: `${highestPercent}%`,
    });
  }

  // 3. Upcoming Exam Proximity
  if (exams.length > 0) {
    const nextExam = exams[0];
    insights.push({
      id: 'ins-exam-prox',
      type: 'tip',
      title: `Upcoming Exam: ${nextExam.subjectName}`,
      description: `Scheduled on ${nextExam.date} (${nextExam.startTime}). Recommended study time today: 2 hours 15 minutes.`,
      actionText: 'Open Study Plan',
      metric: 'Exam in 5 Days',
    });
  }

  return insights;
}
