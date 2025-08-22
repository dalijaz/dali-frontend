import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.css']
})
export class VerifyAccountComponent implements OnInit {
  verificationStatus = '';
  success = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    const token  = this.route.snapshot.queryParamMap.get('token'); // fallback support

    // Preferred flow (your backend already does this)
    if (status) {
      this.success = status === 'success';
      this.verificationStatus = this.success
        ? 'Your email has been verified. You can log in now.'
        : 'Verification link is invalid or expired.';
      return;
    }

    // Fallback: if you ever send emails directly to /verify-account?token=...
    if (token) {
      this.http.get(`/auth/verify`, { params: { token }, responseType: 'text' })
        .subscribe({
          next: () => {
            this.success = true;
            this.verificationStatus = 'Your email has been verified. You can log in now.';
          },
          error: () => {
            this.success = false;
            this.verificationStatus = 'Verification failed. The token is invalid or expired.';
          }
        });
      return;
    }

    // No status or token
    this.success = false;
    this.verificationStatus = 'No verification info found. Please use the link sent to your email.';
  }
}
