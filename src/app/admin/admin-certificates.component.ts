import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminCertificateService } from './admin-certificate.service';
import { Certificate } from '../model/certificate.model';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-certificates.component.html',
  styleUrls: ['./admin-certificates.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AdminCertificatesComponent implements OnInit {
  certs: Certificate[] = [];
  loading = false;
  error = '';

  name = ''; description = '';
  editing: number | null = null;
  editName = ''; editDescription = '';
  editingTime: number | null = null;
  timeMinutes: number | null = null;

  totalCount = 0; timedCount = 0; noTimerCount = 0; attempts7d = 0;

  constructor(private svc: AdminCertificateService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (list) => { this.certs = list || []; this.recomputeKpis(); this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Failed to load certificates'; this.loading = false; }
    });
  }
  private recomputeKpis(): void {
    const list = this.certs || [];
    this.totalCount = list.length;
    this.timedCount = list.filter((c: any) => !!c?.durationSeconds).length;
    this.noTimerCount = list.filter((c: any) => !c?.durationSeconds).length;
  }

  create(): void {
    if (!this.name?.trim()) return;
    this.svc.create({ name: this.name.trim(), description: this.description?.trim() || '' })
      .subscribe({
        next: (created) => { this.certs.unshift(created); this.name=''; this.description=''; this.recomputeKpis(); },
        error: (e) => this.error = e?.error?.message || 'Failed to create certificate'
      });
  }
  startEdit(c: Certificate): void { this.editing = c.id!; this.editName = c.name; this.editDescription = c.description || ''; this.editingTime = null; }
  save(id: number): void {
    this.svc.update(id, { name: this.editName, description: this.editDescription })
      .subscribe({
        next: (u) => { const i = this.certs.findIndex(x => x.id === id); if (i>=0) this.certs[i] = u; this.editing = null; this.recomputeKpis(); },
        error: (e) => this.error = e?.error?.message || 'Failed to save changes'
      });
  }
  cancel(): void { this.editing = null; }
  remove(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => { this.certs = this.certs.filter(x => x.id !== id); this.recomputeKpis(); },
      error: (e) => this.error = e?.error?.message || 'Failed to delete certificate'
    });
  }
  startEditTime(c: any): void { this.editingTime = c.id!; const s = c?.durationSeconds as number|undefined; this.timeMinutes = s ? Math.max(1, Math.round(s/60)) : null; this.editing = null; }
  saveTime(id: number): void {
    if (!this.timeMinutes || this.timeMinutes < 1) return;
    this.svc.update(id, { durationSeconds: this.timeMinutes * 60 } as any).subscribe({
      next: (u: any) => { const i = this.certs.findIndex(x => x.id === id); if (i>=0) this.certs[i] = u; this.editingTime = null; this.timeMinutes = null; this.recomputeKpis(); },
      error: (e) => this.error = e?.error?.message || 'Failed to save time'
    });
  }
  cancelEditTime(): void { this.editingTime = null; this.timeMinutes = null; }
}
