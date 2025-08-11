import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private authService: AuthService) {}

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
