import { Component, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  // keep only the *specific* things we change so we can restore them
  private changed: Array<{ el: HTMLElement; prop: string; old: string }> = [];

  ngAfterViewInit(): void {
    const appRoot = this.doc.querySelector('app-root') as HTMLElement | null;
    if (!appRoot) return;

    // 1) If the very first child is a NAV/HEADER (site chrome), hide it (temporarily)
    const first = appRoot.firstElementChild as HTMLElement | null;
    if (first && (first.tagName === 'NAV' || first.tagName === 'HEADER')) {
      this.set(first, 'display', 'none');
      this.set(first, 'height', '0');
      this.set(first, 'min-height', '0');
      this.set(first, 'margin', '0');
      this.set(first, 'padding', '0');
    }

    // 2) Find the next block-level container just under app-root with big top padding (e.g., 48px)
    const candidates = Array.from(
      appRoot.querySelectorAll<HTMLElement>(':scope > div, :scope > section, :scope > main')
    );

    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.top > 450) break; // we only care about the top band
      const cs = getComputedStyle(el);
      const padTop = parseFloat(cs.paddingTop || '0');
      if (padTop >= 40) {
        // Neutralize just the top padding that causes the drop
        this.set(el, 'padding-top', '0px');
        // Defensive: sometimes the spacer also set a fixed height
        if (parseFloat(cs.minHeight) > 0) this.set(el, 'min-height', '0');
        if (parseFloat(cs.height) > 0 && (cs.position === 'static' || cs.position === 'relative')) {
          this.set(el, 'height', 'auto');
        }
        break; // only touch the first spacer-like container
      }
    }
  }

  ngOnDestroy(): void {
    // restore everything we changed
    for (const { el, prop, old } of this.changed) {
      el.style.setProperty(prop, old);
    }
    this.changed = [];
  }

  private set(el: HTMLElement, prop: string, val: string) {
    const old = el.style.getPropertyValue(prop);
    // record only once per (el,prop)
    if (!this.changed.find(c => c.el === el && c.prop === prop)) {
      this.changed.push({ el, prop, old });
    }
    el.style.setProperty(prop, val, 'important');
  }

  // ---------------- Existing login logic ----------------
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

        const roleFromApi = (res.role || '').replace(/^ROLE_/, '');
        const roleFromJwt = this.decodeRoleFromToken(res.token);
        const role = (roleFromApi || roleFromJwt || '').toUpperCase();
        if (role) localStorage.setItem('authRole', role);
        if (res.email) localStorage.setItem('authEmail', res.email);

        this.router.navigate([role === 'ADMIN' ? '/admin/certificates' : '/certificates']);
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
