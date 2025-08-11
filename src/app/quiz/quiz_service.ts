// src/app/quiz/quiz_service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
// src/app/quiz/quiz_service.ts
import { environment } from '../../environments/environment';
import {
  QuizQuestionDTO,
  QuizSubmissionRequest,
  QuizResultResponse
} from './quiz_model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private baseUrl = `${environment.apiBaseUrl}/quiz`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('authToken');
    if (!token) return undefined;

    const h: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (environment.apiBaseUrl.includes('ngrok-free.app')) {
      h['ngrok-skip-browser-warning'] = 'true';
    }
    return new HttpHeaders(h);
  }

  /** Normalize a single question object coming from the API */
  private normalize(q: any): QuizQuestionDTO {
    return {
      id: q.id,
      certificateId: q.certificateId ?? q.certificate?.id,
      // prefer questionText; fallback to text / question_text
      questionText: q.questionText ?? q.text ?? q.question_text ?? '',
      optionA: q.optionA ?? q.optiona ?? q.option_a ?? '',
      optionB: q.optionB ?? q.optionb ?? q.option_b ?? '',
      optionC: q.optionC ?? q.optionc ?? q.option_c ?? '',
      optionD: q.optionD ?? q.optiond ?? q.option_d ?? '',
      correctIndex: q.correctIndex ?? q.correct_index ?? 0,
      mark: q.mark ?? 1,
      // keep any extra fields if your DTO includes them
      correctAnswer: q.correctAnswer ?? q.correct_answer
    } as QuizQuestionDTO;
  }

  /** Get questions for a certificate (supports various API response shapes) */
  getQuestions(certificateId: number): Observable<QuizQuestionDTO[]> {
    const headers = this.authHeaders();

    return this.http
      .get<any>(`${this.baseUrl}/${certificateId}`, { headers })
      .pipe(
        map(res => {
          // support: array | {content: []} | {data: []} | {items: []}
          const list: any[] = Array.isArray(res)
            ? res
            : res?.content ?? res?.data ?? res?.items ?? [];
          return (list ?? []).map(q => this.normalize(q));
        })
      );
  }

  submit(
    certificateId: number,
    payload: QuizSubmissionRequest
  ): Observable<QuizResultResponse> {
    const headers = this.authHeaders();
    return this.http.post<QuizResultResponse>(
      `${this.baseUrl}/${certificateId}/submit`,
      payload,
      { headers }
    );
  }
}
