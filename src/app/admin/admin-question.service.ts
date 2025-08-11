import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizQuestion } from '../model/quiz-question.model';

@Injectable({ providedIn: 'root' })
export class AdminQuestionService {
  private base = 'http://localhost:8080/admin/questions';

  constructor(private http: HttpClient) {}

  listByCertificate(certId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.base}/by-certificate/${certId}`);
  }

  create(q: QuizQuestion): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(this.base, q);
  }

  update(id: number, q: QuizQuestion): Observable<QuizQuestion> {
    return this.http.put<QuizQuestion>(`${this.base}/${id}`, q);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
