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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Invalid submission id.'; return; }
    this.fetch(id);
  }

  fetch(id: number) {
    this.loading = true;
    this.error = undefined;
    this.svc.getDetail(id).subscribe({
      next: (d: SubmissionDetailDTO) => { this.data = d; this.loading = false; },
      error: () => { this.error = 'Failed to load submission detail.'; this.loading = false; }
    });
  }

  /** Helper used by template to compute percent safely (silences the warning) */
  percentOf(d: SubmissionDetailDTO): number {
    // prefer server-provided percent if present
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
