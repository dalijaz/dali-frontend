import { Certificate } from './certificate.model';

export interface QuizQuestion {
  id?: number;
  certificate: { id: number } | Certificate;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number; // 0..3
  mark?: number;
}
