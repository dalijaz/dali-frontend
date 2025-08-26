// src/app/app-routing.module.ts
import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, CanActivateFn, Router } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CertificateComponent } from './certificate/certificate.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';
import { AuthGuard } from './auth.guard';
import { QuizComponent } from './quiz/quiz.component';

// Admin components
import { AdminCertificatesComponent } from './admin/admin-certificates.component';
import { AdminQuestionsComponent } from './admin/admin-questions.component';
import { AdminLoginComponent } from './admin/admin-login.component';

// User history/detail
import { MySubmissionsComponent } from './my-submissions/my-submissions.component';
import { SubmissionDetailComponent } from './submission-detail/submission-detail.component';

/* Admin guard: checks JWT payload for ADMIN role */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  if (!token) return router.parseUrl('/login');

  try {
    const b64url = token.split('.')[1] ?? '';
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));

    const single = (payload.role as string | undefined)?.toUpperCase();
    const roles: string[] =
      (payload.roles as string[]) ||
      (payload.authorities as string[]) ||
      (payload.scope ? String(payload.scope).split(' ') : []);

    const hasAdmin =
      single === 'ADMIN' ||
      single === 'ROLE_ADMIN' ||
      roles?.includes('ADMIN') ||
      roles?.includes('ROLE_ADMIN');

    return hasAdmin ? true : router.parseUrl('/');
  } catch {
    return router.parseUrl('/login');
  }
};

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-account', component: VerifyAccountComponent },

  // Protected (user)
  { path: 'certificates', component: CertificateComponent, canActivate: [AuthGuard] },
  { path: 'certificates/:id', component: CertificateComponent, canActivate: [AuthGuard] }, // <-- detail route
  { path: 'quiz/:certificateId', component: QuizComponent, canActivate: [AuthGuard] },

  // User submissions
  { path: 'my-submissions', component: MySubmissionsComponent, canActivate: [AuthGuard] },
  { path: 'submissions/:id', component: SubmissionDetailComponent, canActivate: [AuthGuard] },

  // Admin
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/certificates', component: AdminCertificatesComponent, canActivate: [adminGuard] },
  { path: 'admin/questions', component: AdminQuestionsComponent, canActivate: [adminGuard] },
  { path: 'admin/certificates/:id/questions', component: AdminQuestionsComponent, canActivate: [adminGuard] },

  // Fallback
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
