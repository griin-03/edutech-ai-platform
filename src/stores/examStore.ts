import { create } from 'zustand';

interface ExamState {
  currentQuestionIndex: number;
  answers: Record<number, string>; // Lưu câu trả lời: { 1: "A", 2: "B" }
  markedQuestions: number[]; // Các câu đánh dấu xem lại
  timeLeft: number; // Giây còn lại
  
  setAnswer: (questionId: number, answer: string) => void;
  toggleMark: (questionId: number) => void;
  setCurrentQuestion: (index: number) => void;
  setTimeLeft: (seconds: number) => void;
  decrementTimer: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentQuestionIndex: 0,
  answers: {},
  markedQuestions: [],
  timeLeft: 0,

  setAnswer: (qId, ans) => 
    set((state) => ({ answers: { ...state.answers, [qId]: ans } })),
    
  toggleMark: (qId) =>
    set((state) => ({
      markedQuestions: state.markedQuestions.includes(qId)
        ? state.markedQuestions.filter((id) => id !== qId)
        : [...state.markedQuestions, qId],
    })),
    
  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),
  
  setTimeLeft: (seconds) => set({ timeLeft: seconds }),
  
  decrementTimer: () => 
    set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
    
  resetExam: () => set({ currentQuestionIndex: 0, answers: {}, markedQuestions: [], timeLeft: 0 }),
}));