// src/app/quiz/quiz_model.ts

/** Question coming from the backend.
 *  Supports both old names (questionText) and current names (text, optionA..D).
 */
export interface QuizQuestionDTO {
  id: number;

  // Current naming
  text?: string;

  // Legacy naming some endpoints used
  questionText?: string;

  // MCQ options (optional — present for choice questions)
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;

  // Optional mark/points
  mark?: number;
}

/** Answer you send back.
 *  Support both the modern chosenIndex (0..3) and the legacy userAnswer string.
 */
export interface QuizAnswerDTO {
  questionId: number;

  // Preferred for MCQ: 0..3 (A..D)
  chosenIndex?: number;

  // Legacy: string form (e.g., "0", "A", "your text", etc.)
  userAnswer?: string;
}

export interface QuizSubmissionRequest {
  certificateId: number;
  answers: QuizAnswerDTO[];
}

/** Result returned by submit.
 *  Fields are optional to tolerate different backends.
 */
export interface QuizResultResponse {
  totalQuestions?: number;
  totalMarks?: number;
  score?: number;

  // Some backends use passed; some use success
  passed?: boolean;
  success?: boolean;

  // If the backend creates a persisted submission, you may get an id here
  submissionId?: number;
  id?: number;
}
