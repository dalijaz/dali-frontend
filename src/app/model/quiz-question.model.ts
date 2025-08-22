import { Certificate } from './certificate.model';

export interface QuizQuestion {
  id?: number;
  certificate: Pick<Certificate, 'id'>; // always send { id: number }
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number; // 0..3
  mark: number;         // make it required (backend expects a number)
}
