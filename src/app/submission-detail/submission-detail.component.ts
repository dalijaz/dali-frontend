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

  answerClass(correct: boolean) { return correct ? 'text-bg-success' : 'text-bg-danger'; }
}
