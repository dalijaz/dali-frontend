import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AdminQuestionService } from './admin-question.service';
import { AdminCertificateService } from './admin-certificate.service';

import { Certificate } from '../model/certificate.model';
import { QuizQuestion } from '../model/quiz-question.model';

@Component({
  selector: 'app-admin-questions',
  templateUrl: './admin-questions.component.html'
})
export class AdminQuestionsComponent implements OnInit {
  certificates: Certificate[] = [];
  selectedCertId: number | null = null;

  questions: QuizQuestion[] = [];
  loading = false;
  error = '';

  // create form draft
  draft: QuizQuestion = {
    certificate: { id: 0 },
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctIndex: 0,
    mark: 1
  };

  // edit state
  editingId: number | null = null;
  editBuffer: QuizQuestion | null = null;

  constructor(
    private route: ActivatedRoute,
    private qApi: AdminQuestionService,
    private certApi: AdminCertificateService
  ) {}

  ngOnInit(): void {
    // 1) Load certificate list for the selector
    this.loadCertificates();

    // 2) If navigated with /admin/certificates/:id/questions, pre-select that cert
    const paramId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(paramId) && paramId > 0) {
      this.selectedCertId = paramId;
      this.onSelectCertificate();
    }
  }

  loadCertificates(): void {
    this.error = '';
    this.certApi.list().subscribe({
      next: (list) => (this.certificates = list),
      error: (e) => {
        this.error = 'Failed to load certificates';
        console.error(e);
      }
    });
  }

  onSelectCertificate(): void {
    if (!this.selectedCertId) {
      this.questions = [];
      return;
    }
    this.loading = true;
    this.error = '';
    this.qApi.listByCertificate(this.selectedCertId).subscribe({
      next: (qs) => {
        this.questions = qs;
        this.loading = false;
      },
      error: (e) => {
        this.error = 'Failed to load questions';
        this.loading = false;
        console.error(e);
      }
    });
    this.draft.certificate = { id: this.selectedCertId };
  }

  create(): void {
    if (!this.selectedCertId) return;
    const payload: QuizQuestion = {
      ...this.draft,
      certificate: { id: this.selectedCertId }
    };
    this.qApi.create(payload).subscribe({
      next: (created) => {
        // immutable update to trigger change detection reliably
        this.questions = [...this.questions, created];
        this.resetDraft();
      },
      error: (e) => {
        alert('Create failed');
        console.error(e);
      }
    });
  }

  resetDraft(): void {
    this.draft = {
      certificate: { id: this.selectedCertId || 0 },
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctIndex: 0,
      mark: 1
    };
  }

  startEdit(q: QuizQuestion): void {
    this.editingId = q.id!;
    // shallow copy is fine here; using JSON copy for safety with nested certificate
    this.editBuffer = JSON.parse(JSON.stringify(q)) as QuizQuestion;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editBuffer = null;
  }

  saveEdit(): void {
    if (!this.editBuffer || this.editingId == null || !this.selectedCertId) return;
    const payload: QuizQuestion = {
      ...this.editBuffer,
      certificate: { id: this.selectedCertId }
    };
    this.qApi.update(this.editingId, payload).subscribe({
      next: (updated) => {
        this.questions = this.questions.map(q =>
          q.id === this.editingId ? updated : q
        );
        this.cancelEdit();
      },
      error: (e) => {
        alert('Update failed');
        console.error(e);
      }
    });
  }

  remove(id: number): void {
    if (!confirm('Delete this question?')) return;
    this.qApi.delete(id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== id);
      },
      error: (e) => {
        alert('Delete failed');
        console.error(e);
      }
    });
  }

  labelForIndex(i: number): string {
    return ['A', 'B', 'C', 'D'][i] || '?';
  }

  trackById = (_: number, q: QuizQuestion) => q.id;
}
