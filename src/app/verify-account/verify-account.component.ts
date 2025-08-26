import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    const token  = this.route.snapshot.queryParamMap.get('token'); // optional fallback

    // Preferred flow: backend already redirected with ?status=success|failed
    if (status) {
      this.success = status === 'success';
      this.verificationStatus = this.success
        ? 'Your email has been verified. You can log in now.'
        : 'Verification link is invalid or expired.';
      return;
    }

    // Fallback (if you ever link directly with ?token=... to the frontend)
    if (token) {
      this.http.get(`${environment.apiBaseUrl}/auth/verify`, {
        params: { token },
        responseType: 'text'
      }).subscribe({
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

    this.success = false;
    this.verificationStatus = 'No verification info found. Please use the link sent to your email.';
  }
}
