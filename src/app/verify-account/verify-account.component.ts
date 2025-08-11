import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.css']
})
export class VerifyAccountComponent implements OnInit {
  verificationStatus: string = '';
  success: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.http.get(`http://localhost:8080/auth/verify?token=${token}`, { responseType: 'text' }).subscribe({
        next: (response: string) => {
          this.verificationStatus = response;
          this.success = true;
        },
        error: () => {
          this.verificationStatus = 'Verification failed. The token is invalid or expired.';
          this.success = false;
        }
      });
    } else {
      this.verificationStatus = 'No verification token found. Please check your email for the correct link.';
      this.success = false;  // explicitly set here too
    }
  }
}
