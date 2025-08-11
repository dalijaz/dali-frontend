import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from '../model/certificate.model';

@Injectable({ providedIn: 'root' })
export class AdminCertificateService {
  private base = 'http://localhost:8080/admin/certificates';

  constructor(private http: HttpClient) {}

  list(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.base);
  }

  create(c: Partial<Certificate>): Observable<Certificate> {
    return this.http.post<Certificate>(this.base, c);
  }

  update(id: number, c: Partial<Certificate>): Observable<Certificate> {
    return this.http.put<Certificate>(`${this.base}/${id}`, c);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
