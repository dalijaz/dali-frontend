import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizSubmissionService } from '../quiz-submission.service';
import { SubmissionSummaryDTO } from '../submissions.models';

@Component({
  selector: 'app-my-submissions',
  templateUrl: './my-submissions.component.html',
  styleUrls: ['./my-submissions.component.css']
})
export class MySubmissionsComponent implements OnInit {
  loading = false;
  error?: string;
  rows: SubmissionSummaryDTO[] = [];

  constructor(private svc: QuizSubmissionService, private router: Router) {}

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading = true;
    this.error = undefined;
    this.svc.listMine().subscribe({
      next: (data: SubmissionSummaryDTO[]) => { this.rows = data; this.loading = false; },
      error: () => { this.error = 'Failed to load your submissions.'; this.loading = false; }
    });
  }

  view(id: number) { this.router.navigate(['/submissions', id]); }

  percentText(r: SubmissionSummaryDTO) {
    return `${(Math.round(r.percent * 10) / 10).toFixed(1)}%`;
  }
}
