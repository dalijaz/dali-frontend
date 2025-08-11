import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmissionSummaryDTO, SubmissionDetailDTO } from './submissions.models';

@Injectable({ providedIn: 'root' })
export class QuizSubmissionService {
  private base = 'http://localhost:8080/quiz';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listMine(): Observable<SubmissionSummaryDTO[]> {
    return this.http.get<SubmissionSummaryDTO[]>(
      `${this.base}/submissions/mine`,
      { headers: this.authHeaders() }
    );
  }

  getDetail(id: number): Observable<SubmissionDetailDTO> {
    return this.http.get<SubmissionDetailDTO>(
      `${this.base}/submissions/${id}`,
      { headers: this.authHeaders() }
    );
  }

  // admin (optional)
  listByCertificate(certificateId: number, page = 0, size = 20) {
    return this.http.get<any>(
      `${this.base}/submissions/certificate/${certificateId}?page=${page}&size=${size}`,
      { headers: this.authHeaders() }
    );
  }
}
