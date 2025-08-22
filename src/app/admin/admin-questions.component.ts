import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { AdminQuestionService } from './admin-question.service';
import { AdminCertificateService } from './admin-certificate.service';
import { Certificate } from '../model/certificate.model';
import { QuizQuestion } from '../model/quiz-question.model';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-questions.component.html',
  styleUrls: ['./admin-questions.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AdminQuestionsComponent implements OnInit {
  certificates: Certificate[] = [];
  selectedCertId: number | null = null;

  questions: QuizQuestion[] = [];
  loading = false;
  error = '';

  draft: QuizQuestion = {
    text: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correctIndex: 0, mark: 1, certificate: { id: 0 }
  };

  editingId: number | null = null;
  editBuffer: QuizQuestion | null = null;

  constructor(
    private route: ActivatedRoute,
    private qSvc: AdminQuestionService,
    private certSvc: AdminCertificateService
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
    const fromParam = this.route.snapshot.paramMap.get('id');
    if (fromParam) {
      const idNum = Number(fromParam);
      if (!Number.isNaN(idNum)) { this.selectedCertId = idNum; this.onSelectCertificate(); }
    }
  }

  loadCertificates(): void {
    this.certSvc.list().subscribe({
      next: (list) => this.certificates = list || [],
      error: (e) => this.error = this.readErr(e, 'Failed to load certificates')
    });
  }

  onSelectCertificate(): void {
    if (!this.selectedCertId) { this.questions = []; return; }
    this.loading = true;
    this.qSvc.listByCertificate(this.selectedCertId).subscribe({
      next: (qs) => { this.questions = qs || []; this.loading = false; },
      error: (e) => { this.error = this.readErr(e, 'Failed to load questions'); this.loading = false; }
    });
  }

  create(): void {
    if (!this.selectedCertId) return;
    const q: QuizQuestion = {
      text: (this.draft.text || '').trim(),
      optionA: (this.draft.optionA || '').trim(),
      optionB: (this.draft.optionB || '').trim(),
      optionC: (this.draft.optionC || '').trim(),
      optionD: (this.draft.optionD || '').trim(),
      correctIndex: Number(this.draft.correctIndex) || 0,
      mark: Math.max(1, Number(this.draft.mark) || 1),
      certificate: { id: this.selectedCertId }
    };
    this.qSvc.create(q).subscribe({
      next: (created) => {
        this.questions.unshift(created);
        this.draft = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctIndex: 0, mark: 1, certificate: { id: this.selectedCertId! } };
      },
      error: (e) => this.error = this.readErr(e, 'Failed to create question')
    });
  }

  startEdit(q: QuizQuestion): void { this.editingId = q.id ?? null; this.editBuffer = q ? { ...q } : null; }
  cancelEdit(): void { this.editingId = null; this.editBuffer = null; }

  saveEdit(): void {
    if (!this.editingId || !this.editBuffer || !this.selectedCertId) return;
    const updated: QuizQuestion = {
      id: this.editingId,
      text: (this.editBuffer.text || '').trim(),
      optionA: (this.editBuffer.optionA || '').trim(),
      optionB: (this.editBuffer.optionB || '').trim(),
      optionC: (this.editBuffer.optionC || '').trim(),
      optionD: (this.editBuffer.optionD || '').trim(),
      correctIndex: Number(this.editBuffer.correctIndex) || 0,
      mark: Math.max(1, Number(this.editBuffer.mark) || 1),
      certificate: { id: this.selectedCertId }
    };
    this.qSvc.update(this.editingId, updated).subscribe({
      next: (u) => { const i = this.questions.findIndex(x => x.id === this.editingId); if (i>=0) this.questions[i] = u; this.cancelEdit(); },
      error: (e) => this.error = e?.error?.message || 'Failed to save changes'
    });
  }

  remove(id: number | undefined): void {
    if (!id) return;
    this.qSvc.delete(id).subscribe({
      next: () => this.questions = this.questions.filter(x => x.id !== id),
      error: (e) => this.error = e?.error?.message || 'Failed to delete question'
    });
  }

  trackById(index: number, q: QuizQuestion): number { return q.id ?? index; }
  private readErr(e: any, fallback: string): string { return e?.error?.message || e?.message || fallback; }
}
