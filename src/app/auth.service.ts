import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

interface LoginResponse {
  token: string;
  role?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    localStorage.removeItem('authEmail');
  }

  setToken(token: string): void { localStorage.setItem('authToken', token); }

  private decodeRoleFromToken(token: string): 'ADMIN' | 'USER' | null {
    try {
      const b64url = token.split('.')[1] ?? '';
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded));

      const single = (payload.role as string | undefined)?.toUpperCase();
      if (single === 'ROLE_ADMIN' || single === 'ADMIN') return 'ADMIN';
      if (single === 'ROLE_USER' || single === 'USER') return 'USER';

      const roles: string[] =
        (payload.roles as string[]) ||
        (payload.authorities as string[]) ||
        (payload.scope ? String(payload.scope).split(' ') : []);
      if (!roles) return null;
      if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) return 'ADMIN';
      if (roles.includes('ROLE_USER') || roles.includes('USER')) return 'USER';
      return null;
    } catch {
      return null;
    }
  }

  getRole(): 'ADMIN' | 'USER' | null {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return this.decodeRoleFromToken(token);
  }

  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }

  signup(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, credentials, { responseType: 'text' });
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        if (!res?.token) return;
        localStorage.removeItem('authToken');
        localStorage.removeItem('authRole');
        localStorage.removeItem('authEmail');

        localStorage.setItem('authToken', res.token);
        if (res.email) localStorage.setItem('authEmail', res.email);

        const roleFromApi = (res.role || '').toUpperCase().replace(/^ROLE_/, '');
        const roleFromJwt = this.decodeRoleFromToken(res.token);
        const role = (roleFromApi || roleFromJwt || null) as 'ADMIN' | 'USER' | null;
        if (role) localStorage.setItem('authRole', role);
      })
    );
  }
}
