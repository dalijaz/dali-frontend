// src/app/quiz/quiz_model.ts
export interface QuizQuestionDTO {
  id: number;
  questionText: string;
  mark: number;
}

export interface QuizAnswerDTO {
  questionId: number;
  userAnswer: string;
}

export interface QuizSubmissionRequest {
  certificateId: number;
  answers: QuizAnswerDTO[];
}

export interface QuizResultResponse {
  totalQuestions: number;
  totalMarks: number;
  score: number;
  passed: boolean;
}
