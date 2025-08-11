import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  // base64url-safe decode (fallback if API doesn't send role)
  private decodeRoleFromToken(token: string): string | null {
    try {
      const b64url = token.split('.')[1] ?? '';
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded));
      const raw = (payload.role as string | undefined) ?? '';
      return raw.replace(/^ROLE_/, '') || null;
    } catch { return null; }
  }

  onSubmit(): void {
    if (!this.email || !this.password) { alert('Please enter both email and password.'); return; }

    this.loading = true;
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res?.token) { alert('Unexpected login response.'); return; }

        // Ensure role/email in storage
        const roleFromApi = (res.role || '').replace(/^ROLE_/, '');
        const roleFromJwt = this.decodeRoleFromToken(res.token);
        const role = (roleFromApi || roleFromJwt || '').toUpperCase();
        if (role) localStorage.setItem('authRole', role);
        if (res.email) localStorage.setItem('authEmail', res.email);

        // ✅ Redirect based on role
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/certificates']);
        } else {
          this.router.navigate(['/certificates']);
        }
      },
      error: (e) => {
        this.loading = false;
        console.error('Login error:', e);
        if (e?.status === 403) alert('Invalid credentials or account not verified.');
        else alert('Login failed. Try again.');
      }
    });
  }
}
