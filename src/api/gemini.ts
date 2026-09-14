import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Gemini features will return helpful fallback responses.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface StudentAcademicContext {
  studentName: string;
  rollNumber: string;
  semester: string;
  department: string;
  overallAttendance: number;
  attendanceBySubject?: Array<{ subjectName: string; percentage: number; attended: number; total: number }>;
  subjects?: Array<{ code: string; name: string; credits: number }>;
  marks?: Array<{ subjectName: string; internal1: number; internal2: number; maxMarks: number; grade?: string }>;
  weakSubjects?: string[];
  upcomingExams?: Array<{ subjectName: string; date: string; time: string }>;
  pendingAssignments?: Array<{ title: string; subjectName: string; dueDate: string }>;
  todayTimetable?: Array<{ time: string; subjectName: string; room: string }>;
}

export async function handleGeminiChat(body: {
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  context?: StudentAcademicContext;
  mode?: 'chat' | 'quiz' | 'notes' | 'study_plan' | 'attendance_analysis';
}): Promise<{ reply: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        reply: generateOfflineFallbackResponse(body.message, body.context, body.mode),
      };
    }

    const ai = getAiClient();
    const context = body.context;
    
    // Construct rich personalized system prompt
    let systemInstruction = `You are "CampusAI", the dedicated Smart Academic Mentor and AI Study Assistant for engineering students at Apex Institute of Engineering & Technology.
Your personality is encouraging, precise, academically rigorous, and supportive.
Always format output cleanly using Markdown (bold headings, bullet points, clean tables or formulas when relevant).

Student Academic Context:
- Name: ${context?.studentName || 'Student'}
- Roll Number: ${context?.rollNumber || 'N/A'}
- Semester: ${context?.semester || 'Semester 6'}
- Department: ${context?.department || 'Computer Science & Engineering'}
- Overall Attendance: ${context?.overallAttendance ?? 82}%
${context?.weakSubjects?.length ? `- Identified Weak / Focus Subjects: ${context.weakSubjects.join(', ')}` : ''}
${context?.attendanceBySubject?.length ? `- Attendance Breakdown: ${context.attendanceBySubject.map(s => `${s.subjectName}: ${s.percentage}% (${s.attended}/${s.total})`).join(', ')}` : ''}
${context?.marks?.length ? `- Internal Marks: ${context.marks.map(m => `${m.subjectName}: ${m.internal1}/${m.maxMarks} (Test 1), ${m.internal2}/${m.maxMarks} (Test 2)`).join(', ')}` : ''}
${context?.upcomingExams?.length ? `- Upcoming Exams: ${context.upcomingExams.map(e => `${e.subjectName} on ${e.date} (${e.time})`).join(', ')}` : ''}
${context?.pendingAssignments?.length ? `- Pending Assignments: ${context.pendingAssignments.map(a => `${a.title} (${a.subjectName}) due ${a.dueDate}`).join(', ')}` : ''}
${context?.todayTimetable?.length ? `- Today's Classes: ${context.todayTimetable.map(t => `${t.time} - ${t.subjectName} (${t.room})`).join(', ')}` : ''}

Guidelines:
1. When answering personalized questions (e.g. "What should I study today?", "How is my attendance?", "Help me prepare for exams"), ALWAYS reference the student's actual timetable, weak subjects, marks, and upcoming exam dates.
2. If attendance is below 75% in any subject, alert the student and calculate how many consecutive classes they must attend to cross the mandatory 75% threshold.
3. For academic concept explanations, provide clear engineering intuition, real-world systems architecture examples, and key interview/exam points.
4. If asked for a quiz, generate 3-5 multiple-choice questions with answer keys and explanations.
5. If asked for notes, structure them with core definitions, formulas, pros/cons, and typical university exam questions.
6. Keep answers concise, highly readable, and actionable.`;

    // Incorporate chat history if provided
    let prompt = body.message;
    if (body.history && body.history.length > 0) {
      const formattedHistory = body.history
        .map(h => `${h.role === 'user' ? 'Student' : 'CampusAI'}: ${h.text}`)
        .join('\n');
      prompt = `Conversation History:\n${formattedHistory}\n\nCurrent Student Query: ${body.message}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return { reply: response.text || 'I could not generate an answer at this moment. Please try again.' };
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return {
      reply: generateOfflineFallbackResponse(body.message, body.context, body.mode),
      error: error.message,
    };
  }
}

export async function handleGenerateQuiz(body: {
  subject: string;
  topic: string;
  count?: number;
}): Promise<{ quiz: any[]; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { quiz: getFallbackQuiz(body.subject, body.topic) };
    }

    const ai = getAiClient();
    const prompt = `Generate ${body.count || 4} university-level engineering multiple choice questions (MCQs) for the subject "${body.subject}" on the topic "${body.topic}".
Return ONLY a valid JSON array matching this structure:
[
  {
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation why option A is correct."
  }
]
Do not wrap in markdown quotes if possible, output pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text?.trim() || '[]';
    const parsed = JSON.parse(jsonText);
    return { quiz: parsed };
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return { quiz: getFallbackQuiz(body.subject, body.topic) };
  }
}

export async function handleGenerateNotes(body: {
  subject: string;
  topic: string;
}): Promise<{ notes: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { notes: getFallbackNotes(body.subject, body.topic) };
    }

    const ai = getAiClient();
    const prompt = `Create high-yield engineering revision notes for "${body.subject}" covering the topic "${body.topic}".
Include:
1. Executive Summary & Core Definitions
2. Key Architectural/Mathematical Principles
3. Crucial Diagrams / Flow explanation (ASCII or structured bullet points)
4. Solved / Standard University Exam Question
5. Common Pitfalls to Avoid`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return { notes: response.text || getFallbackNotes(body.subject, body.topic) };
  } catch (err: any) {
    return { notes: getFallbackNotes(body.subject, body.topic) };
  }
}

// Fallback logic when Gemini key is temporarily not configured or during offline testing
function generateOfflineFallbackResponse(
  message: string,
  context?: StudentAcademicContext,
  mode?: string
): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('study today') || lower.includes('what should i study')) {
    const weak = context?.weakSubjects?.[0] || 'Database Management Systems';
    const exam = context?.upcomingExams?.[0];
    return `### Personalized Daily Study Recommendation

Based on your current academic standing in **${context?.semester || 'Semester 6'}**:

1. **Priority 1: ${weak} (Identified Weak Subject)**
   - Dedicate **1.5 hours** today to reviewing recent internal test mistakes.
   - Recommended focus: Practice 3 key analytical proofs or ER-normalization problems.

2. **Priority 2: Exam Preparation**
   ${exam ? `- You have the **${exam.subjectName}** exam coming up on **${exam.date}**. Spend 45 minutes on past semester question papers.` : '- Review key unit test topics for upcoming mid-terms.'}

3. **Assignment Clearance**
   ${context?.pendingAssignments?.[0] ? `- Submit **${context.pendingAssignments[0].title}** for ${context.pendingAssignments[0].subjectName} before the deadline.` : '- All current assignments are up to date!'}

*Total Recommended Study Time: 2 hours 15 minutes.*`;
  }

  if (lower.includes('attendance') || lower.includes('shortage')) {
    const overall = context?.overallAttendance ?? 82;
    const lowSubjects = context?.attendanceBySubject?.filter(s => s.percentage < 75) || [];
    
    if (lowSubjects.length > 0) {
      return `### Attendance Advisory

Your overall attendance is **${overall}%**, but you are below the 75% threshold in:
${lowSubjects.map(s => `- **${s.subjectName}**: ${s.percentage}% (${s.attended}/${s.total} classes attended). You need to attend **${Math.ceil((0.75 * s.total - s.attended) / 0.25)}** more consecutive lectures without missing to reach 75%.`).join('\n')}

> **Rule Reminder**: 75% attendance is mandatory to appear in end-semester practical and theory examinations.`;
    }
    return `### Attendance Summary
Your overall attendance is **${overall}%**, which is safely above the required **75%** college criterion. Keep maintaining your steady attendance record!`;
  }

  return `### CampusAI Academic Mentor

Hello ${context?.studentName || 'Student'}! I am connected with your engineering portal.

Here is a quick snapshot of your status:
- **Department**: ${context?.department || 'Computer Science & Engineering'}
- **Current Attendance**: ${context?.overallAttendance ?? 82}%
- **Next Exam**: ${context?.upcomingExams?.[0]?.subjectName || 'Distributed Systems'}

You can ask me:
- *"What should I study today?"*
- *"Generate an MCQ quiz for ${context?.subjects?.[0]?.name || 'Operating Systems'}"*
- *"Explain CAP theorem with real-world examples"*
- *"How many classes can I miss before falling below 75%?"*
- *"Create a revision plan for Mid-Term exams"*`;
}

function getFallbackQuiz(subject: string, topic: string) {
  return [
    {
      id: 1,
      question: `In ${subject} (${topic}), which property guarantees that transactions are either fully completed or rolled back?`,
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctIndex: 0,
      explanation: 'Atomicity ensures the "all or nothing" property of database transactions.',
    },
    {
      id: 2,
      question: `Which data structure is most optimal for indexing large disk-based records in ${subject}?`,
      options: ['Binary Search Tree', 'B+ Tree', 'Heap', 'Linked List'],
      correctIndex: 1,
      explanation: 'B+ Trees provide shallow tree height and sequential leaf node traversal suited for disk I/O.',
    },
    {
      id: 3,
      question: `What is the time complexity of searching a record in a balanced B-Tree with branching factor B and N records?`,
      options: ['O(N)', 'O(log_B N)', 'O(B * N)', 'O(1)'],
      correctIndex: 1,
      explanation: 'Search in a B-Tree scales logarithmically with base B.',
    },
  ];
}

function getFallbackNotes(subject: string, topic: string) {
  return `# Comprehensive Engineering Notes: ${subject}
## Topic: ${topic}

### 1. Fundamental Definition
The core foundation of **${topic}** revolves around resource management, fault tolerance, and deterministic behavior in computer engineering systems.

### 2. Core Architectural Pillars
- **Scalability**: Horizontal vs. Vertical partitioning.
- **Consistency Models**: Strong Consistency vs. Eventual Consistency (PACELC & CAP theorem implications).
- **Latency Optimization**: Caching layers, pipelining, and non-blocking asynchronous I/O.

### 3. Key University Exam Questions
1. *Differentiate between 2-Phase Locking and Optimistic Concurrency Control.*
2. *Derive the time and space complexity under worst-case network partitions.*
3. *Explain the architecture and recovery algorithm with a neat block diagram.*

### 4. Best Practices for Lab & Viva
- Always specify the edge conditions (null pointer, partition recovery, tie-breaking).
- Verify synchronization locks to avoid deadlocks.`;
}
