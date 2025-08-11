// src/app/app.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}

  isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get userEmail(): string | null {
    // read from storage if you saved it on login (AuthService does this)
    return localStorage.getItem('authEmail');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
