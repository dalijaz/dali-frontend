// src/app/certificate/certificate.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CertificateService } from '../certificate.service';  // service is one level up from /certificate/
import { Certificate } from '../model/certificate.model';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {
  certificates: Certificate[] = [];
  loading = true;
  loadError = '';

  constructor(
    private certificateService: CertificateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.certificateService.getCertificates().subscribe({
      next: (data) => {
        this.certificates = data || [];
        this.loading = false;
        console.log('✅ Certificates loaded:', this.certificates);
      },
      error: (err) => {
        this.loadError = 'Failed to load certificates.';
        this.loading = false;
        console.error('❌ Failed to load certificates:', err);
      }
    });
  }

  // Only needed if you prefer (click) instead of [routerLink]
  goToQuiz(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/quiz', id]);
  }
}
