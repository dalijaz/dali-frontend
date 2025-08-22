import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuizQuestion } from '../model/quiz-question.model';

@Injectable({ providedIn: 'root' })
export class AdminQuestionService {
  private base = `${environment.apiBaseUrl}/admin/questions`;

  constructor(private http: HttpClient) {}

  listByCertificate(certId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.base}?certificateId=${certId}`);
  }

  create(q: QuizQuestion): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(this.base, q);
  }

  update(id: number, q: QuizQuestion | Partial<QuizQuestion>): Observable<QuizQuestion> {
    return this.http.put<QuizQuestion>(`${this.base}/${id}`, q);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
