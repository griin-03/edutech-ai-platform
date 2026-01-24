export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  thumbnail?: string;
  studentsCount: number;
}

export type QuestionType = 'multiple-choice' | 'essay';

export interface Question {
  id: number;
  text: string;
  options?: string[]; // Cho trắc nghiệm
  correctAnswer?: string; // Cho teacher xem
  type: QuestionType;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  duration: number; // minutes
  questions: Question[];
  status: 'active' | 'draft' | 'closed';
}

export interface ExamSubmission {
  examId: string;
  studentId: string;
  answers: Record<number, string>; // questionId -> answer
  submittedAt: Date;
  score?: number;
}