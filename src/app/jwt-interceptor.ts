// src/app/jwt-interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

function ensureSlash(u: string) { return u.endsWith('/') ? u : u + '/'; }
function toAbs(input: string, base: string): string {
  try { return new URL(input).toString(); }
  catch { return new URL(input.replace(/^\//, ''), ensureSlash(base)).toString(); }
}

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiBase = environment.apiBaseUrl;
    const absUrl  = toAbs(req.url, apiBase);
    const abs     = new URL(absUrl);
    const api     = new URL(apiBase);
    const isAuth  = abs.pathname.startsWith('/auth/');

    let r = req.clone({ url: absUrl });

    const token = localStorage.getItem('authToken');
    if (token && abs.hostname === api.hostname && !isAuth) {
      r = r.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    if (abs.hostname.endsWith('ngrok-free.app') || abs.hostname.endsWith('ngrok.app')) {
      r = r.clone({ setHeaders: { 'ngrok-skip-browser-warning': 'true' } });
    }
    r = r.clone({ withCredentials: false });
    return next.handle(r);
  }
}
