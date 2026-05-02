export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export type TabType = 'explain' | 'flashcards' | 'quiz';
