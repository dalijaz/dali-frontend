import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizSubmissionService } from '../quiz-submission.service';
import { SubmissionDetailDTO } from '../submissions.models';

@Component({
  selector: 'app-submission-detail',
  templateUrl: './submission-detail.component.html',
  styleUrls: ['./submission-detail.component.css']
})
export class SubmissionDetailComponent implements OnInit {
  loading = false;
  error?: string;
  data?: SubmissionDetailDTO;

  constructor(private route: ActivatedRoute, private svc: QuizSubmissionService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!Number.isFinite(id) || id <= 0) {
      this.error = `Invalid submission id: "${idParam}"`;
      return;
    }
    this.fetch(id);
  }

  fetch(id: number) {
    this.loading = true;
    this.error = undefined;

    this.svc.getDetail(id).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => {
        this.loading = false;
        // Surface the real cause so we can pinpoint
        const status = err?.status ?? 'unknown';
        const msg = (err?.error && typeof err.error === 'string') ? err.error
                  : err?.message ?? 'Unknown error';
        this.error = `Failed to load submission detail (status ${status}). ${msg}`;
        // Optional console for deeper inspection
        console.error('Submission detail error', err);
      }
    });
  }

  percentOf(d: SubmissionDetailDTO): number {
    const p = (d as any).percent;
    if (p !== null && p !== undefined) return Number(p);
    const total = Number((d as any).total ?? 0);
    const score = Number((d as any).score ?? 0);
    return total ? (score / total) * 100 : 0;
  }

  answerClass(correct: boolean) {
    return correct ? 'text-bg-success' : 'text-bg-danger';
  }
}
