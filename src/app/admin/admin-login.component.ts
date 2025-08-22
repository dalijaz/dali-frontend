import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

type LoginResponse = {
  token: string;
  role?: string;
  roles?: string[];
  authorities?: string[];
  scope?: string;
  isAdmin?: boolean;
  email?: string;
};

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  private decode(b64url: string) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    try { return JSON.parse(atob(padded)); } catch { return {}; }
  }
  private isAdminFromPayload(p: any): boolean {
    const single = (p?.role as string | undefined)?.toUpperCase();
    if (single === 'ADMIN' || single === 'ROLE_ADMIN') return true;
    const roles: string[] =
      (p?.roles as string[]) ||
      (p?.authorities as string[]) ||
      (typeof p?.scope === 'string' ? p.scope.split(' ') : []);
    return !!(p?.isAdmin || roles?.includes('ROLE_ADMIN') || roles?.includes('ADMIN'));
  }
  private isAdminFromResponse(res: Partial<LoginResponse>): boolean {
    const single = res.role?.toUpperCase();
    if (single === 'ADMIN' || single === 'ROLE_ADMIN') return true;
    const roles = res.roles || res.authorities || (res.scope ? res.scope.split(' ') : []);
    return Array.isArray(roles) && (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN'));
  }

  login(): void {
    this.error = '';
    const creds = { email: this.email, password: this.password };
    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/admin/login`, creds).subscribe({
      next: (res) => this.handleLoginResponse(res, false),
      error: (e: HttpErrorResponse) => {
        if (e.status === 404 || e.status === 405) {
          this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, creds).subscribe({
            next: (res2) => this.handleLoginResponse(res2, true),
            error: (e2: HttpErrorResponse) => this.error = e2?.error?.message || 'Login failed'
          });
        } else {
          this.error = e?.error?.message || 'Admin login failed';
        }
      }
    });
  }

  private handleLoginResponse(res: LoginResponse, isFallback: boolean) {
    const token = res.token;
    if (!token) { this.error = 'Missing token.'; return; }
    const payload = this.decode(token.split('.')[1] || '');
    const isAdmin = this.isAdminFromPayload(payload) || this.isAdminFromResponse(res);
    if (!isAdmin) { this.error = isFallback ? 'This account is not an admin.' : 'Token lacks admin privileges.'; return; }
    localStorage.setItem('authToken', token);
    this.router.navigate(['/admin/certificates']);
  }
}
