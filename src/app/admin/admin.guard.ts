import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivateFn } from '@angular/router';
// ... your other imports

export const adminGuard: CanActivateFn = () => {
  const stored = localStorage.getItem('authRole');
  if (stored === 'ADMIN') return true;

  const token = localStorage.getItem('authToken');
  if (!token) { window.location.href = '/login'; return false; }

  try {
    const b64url = token.split('.')[1] ?? '';
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));
    const role = (payload.role as string | undefined)?.replace(/^ROLE_/, '');
    return role === 'ADMIN' ? true : (window.location.href = '/', false);
  } catch {
    window.location.href = '/';
    return false;
  }
};
