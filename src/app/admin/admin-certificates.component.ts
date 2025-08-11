import { Component, OnInit } from '@angular/core';
import { AdminCertificateService } from './admin-certificate.service';
import { Certificate } from '../model/certificate.model';

@Component({
  selector: 'app-admin-certificates',
  templateUrl: './admin-certificates.component.html'
})
export class AdminCertificatesComponent implements OnInit {
  certs: Certificate[] = [];
  name = '';
  description = '';
  editing: number | null = null;
  editName = '';
  editDescription = '';
  error = '';

  constructor(private admin: AdminCertificateService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.error = '';
    this.admin.list().subscribe({
      next: (list: Certificate[]) => this.certs = list,
      error: (e: any) => { this.error = 'Failed to load certificates'; console.error(e); }
    });
  }

  create(): void {
    if (!this.name.trim()) return;
    this.admin.create({ name: this.name.trim(), description: this.description?.trim() || '' })
      .subscribe({
        next: (c: Certificate) => { this.certs.push(c); this.name = ''; this.description = ''; },
        error: (e: any) => { alert('Create failed'); console.error(e); }
      });
  }

  startEdit(c: Certificate): void {
    this.editing = c.id;
    this.editName = c.name;
    this.editDescription = c.description || '';
  }

  cancel(): void {
    this.editing = null;
    this.editName = '';
    this.editDescription = '';
  }

  save(id: number): void {
    this.admin.update(id, { name: this.editName.trim(), description: this.editDescription?.trim() || '' })
      .subscribe({
        next: (updated: Certificate) => {
          const i = this.certs.findIndex(x => x.id === id);
          if (i >= 0) this.certs[i] = updated;
          this.cancel();
        },
        error: (e: any) => { alert('Update failed'); console.error(e); }
      });
  }

  remove(id: number): void {
    if (!confirm('Delete certificate?')) return;
    this.admin.delete(id).subscribe({
      next: () => this.certs = this.certs.filter(c => c.id !== id),
      error: (e: any) => { alert('Delete failed'); console.error(e); }
    });
  }
}
