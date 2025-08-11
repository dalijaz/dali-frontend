export interface SubmissionSummaryDTO {
  id: number;
  certificateId: number;
  certificateName: string;
  score: number;
  total: number;
  passed: boolean;
  percent: number;       // 0..100
  submittedAt: string;   // ISO string
}

export interface AnswerDetail {
  questionId: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  chosenIndex: number;
  correctIndex: number;
  correct: boolean;
}

export interface SubmissionDetailDTO {
  id: number;
  certificateId: number;
  certificateName: string;
  score: number;
  total: number;
  passed: boolean;
  percent: number;
  submittedAt: string;   // ISO
  answers: AnswerDetail[];
}
