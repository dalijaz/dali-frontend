import { Component, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements AfterViewInit, OnDestroy {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  private changed: Array<{ el: HTMLElement; prop: string; old: string }> = [];

  ngAfterViewInit(): void {
    const appRoot = this.doc.querySelector('app-root') as HTMLElement | null;
    if (!appRoot) return;

    // 1) Hide only a top nav/header directly under app-root
    const first = appRoot.firstElementChild as HTMLElement | null;
    if (first && (first.tagName === 'NAV' || first.tagName === 'HEADER')) {
      this.set(first, 'display', 'none');
      this.set(first, 'height', '0');
      this.set(first, 'min-height', '0');
      this.set(first, 'margin', '0');
      this.set(first, 'padding', '0');
    }

    // 2) Zero only the first big padding-top container under app-root
    const candidates = Array.from(
      appRoot.querySelectorAll<HTMLElement>(':scope > div, :scope > section, :scope > main')
    );

    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.top > 450) break;
      const cs = getComputedStyle(el);
      const padTop = parseFloat(cs.paddingTop || '0');
      if (padTop >= 40) {
        this.set(el, 'padding-top', '0px');
        if (parseFloat(cs.minHeight) > 0) this.set(el, 'min-height', '0');
        if (parseFloat(cs.height) > 0 && (cs.position === 'static' || cs.position === 'relative')) {
          this.set(el, 'height', 'auto');
        }
        break;
      }
    }
  }

  ngOnDestroy(): void {
    for (const { el, prop, old } of this.changed) {
      el.style.setProperty(prop, old);
    }
    this.changed = [];
  }

  private set(el: HTMLElement, prop: string, val: string) {
    const old = el.style.getPropertyValue(prop);
    if (!this.changed.find(c => c.el === el && c.prop === prop)) {
      this.changed.push({ el, prop, old });
    }
    el.style.setProperty(prop, val, 'important');
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const userData = { email: this.email, password: this.password };

    this.authService.signup(userData).subscribe({
      next: () => {
        alert('Signup successful! Please check your email to verify your account.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 400) {
          alert('User already exists!');
        } else {
          alert('Signup failed. Try again.');
        }
      }
    });
  }
}
