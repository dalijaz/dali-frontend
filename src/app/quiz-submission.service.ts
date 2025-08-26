import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmissionSummaryDTO, SubmissionDetailDTO } from './submissions.models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuizSubmissionService {
  private base = `${environment.apiBaseUrl.replace('http://','https://')}/quiz`;

  constructor(private http: HttpClient) {}

  listMine(): Observable<SubmissionSummaryDTO[]> {
    const url = `${this.base}/submissions/mine`;
    console.log('[API] listMine ->', url);
    return this.http.get<SubmissionSummaryDTO[]>(url);
  }

  getDetail(id: number): Observable<SubmissionDetailDTO> {
    const url = `${this.base}/submissions/${id}`;
    console.log('[API] getDetail ->', url);
    return this.http.get<SubmissionDetailDTO>(url);
  }

  listByCertificate(certificateId: number, page = 0, size = 20) {
    const url = `${this.base}/submissions/certificate/${certificateId}`;
    console.log('[API] listByCertificate ->', url, { page, size });
    return this.http.get<any>(url, { params: { page, size } as any });
  }
}
