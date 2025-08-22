import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Certificate } from './model/certificate.model';

type MaybePaged<T> = T[] | { content?: T[] };

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private apiUrl = `${environment.apiBaseUrl}/certificates`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('authToken');
    if (!token) return undefined;

    const h: Record<string, string> = { Authorization: `Bearer ${token}` };
    // 👇 extra header avoids ngrok browser warning page
    if (environment.apiBaseUrl.includes('ngrok-free.app')) {
      h['ngrok-skip-browser-warning'] = 'true';
    }
    return new HttpHeaders(h);
  }

  getCertificates(): Observable<Certificate[]> {
    const headers = this.authHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http
      .get<MaybePaged<Certificate>>(this.apiUrl, { headers })
      .pipe(map(res => Array.isArray(res) ? res : (res.content ?? [])));
  }

  getCertificateById(id: number): Observable<Certificate> {
    const headers = this.authHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<Certificate>(`${this.apiUrl}/${id}`, { headers });
  }
}
