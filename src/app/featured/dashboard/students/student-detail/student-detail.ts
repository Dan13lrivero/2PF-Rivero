import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../../../core/services/students/students.service';
import { CommissionPipe } from '../pipes/commission.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';

interface DayRow {
  day: number;
  hours: number;
  detail?: string;
  sale: number;
  commissionOverride?: number | null;
}

@Component({
  selector: 'student-detail',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './student-detail.html',
  styleUrls: ['./student-detail.css']
})
export class StudentDetail implements OnInit, OnDestroy {
  studentId: string | null = null;
  studentName: string = '';

  months: string[] = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  selectedMonthIndex = 0;
  days: DayRow[] = [];
  dirty = false; // tracks whether current month has unsaved changes
  isSaving = false;

  private saveSubject = new Subject<void>();
  private saveSub?: Subscription;

  constructor(private route: ActivatedRoute, private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.studentsService.getStudentById(this.studentId).subscribe((s: any) => {
        this.studentName = s ? `${s.nombre} ${s.apellido}` : `Chofer ${this.studentId}`;
      });
    }

    // Start with January
    this.setMonth(0);

    // Auto-save pipeline: debounce changes and save automatically
    this.saveSub = this.saveSubject.pipe(
      debounceTime(800),
      tap(() => { this.isSaving = true; }),
      switchMap(() => this.saveMonth().pipe(
        catchError(err => {
          console.error('Auto-save failed', err);
          return of(null);
        })
      )),
      tap(() => {
        this.isSaving = false;
        this.dirty = false;
      })
    ).subscribe();
  }

  setMonth(index: number) {
    this.selectedMonthIndex = index;

    // Always show 31 days as requested
    const daysInMonth = 31;

    // Start with blanks
    this.days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.days.push({ day: i, hours: 0, detail: '', sale: 0, commissionOverride: null });
    }

    // Load saved month data if present
    if (!this.studentId) return;

    this.studentsService.getDriverMonth(this.studentId, index).subscribe((arr) => {
      if (arr && arr.length > 0) {
        const record = arr[0];
        // merge saved days into the 31-day grid
        if (record.days && Array.isArray(record.days)) {
          record.days.forEach((d: any) => {
            const slot = this.days.find((s) => s.day === d.day);
            if (slot) {
              slot.hours = d.hours || 0;
              slot.sale = d.sale || 0;
              slot.detail = d.detail || '';
              slot.commissionOverride = d.commissionOverride ?? null;
            }
          });
        }
        this.dirty = false;
      } else {
        // no saved record -> keep defaults (zeros)
        this.dirty = false;
      }
    }, (err) => {
      console.error('Error loading driver month data', err);
    });
  }

  prevMonth() {
    const prev = (this.selectedMonthIndex + 11) % 12;
    // save current if dirty before switching
    if (this.dirty) {
      this.saveMonth().subscribe(() => {
        this.dirty = false;
        this.setMonth(prev);
      });
    } else {
      this.setMonth(prev);
    }
  }

  nextMonth() {
    const next = (this.selectedMonthIndex + 1) % 12;
    if (this.dirty) {
      this.saveMonth().subscribe(() => {
        this.dirty = false;
        this.setMonth(next);
      });
    } else {
      this.setMonth(next);
    }
  }

  // Returns computed commission (or override if present) - rounded to integers
  calculateCommission(row: DayRow): number {
    if (row.commissionOverride !== null && row.commissionOverride !== undefined) {
      return Math.round(Number(row.commissionOverride) || 0);
    }

    if (row.hours === 8) {
      return Math.round(Math.max(row.sale * 0.27, 800));
    }
    if (row.hours >= 9) {
      return Math.round(row.sale * 0.3);
    }
    return 0;
  }

  updateRow(row: DayRow, field: 'hours' | 'sale' | 'detail', value: any) {
    if (field === 'detail') {
      row.detail = String(value || '');
    } else {
      // Sanitize and round numeric inputs to integer (accept pasted '10,000' etc)
      const raw = String(value || '').replace(/[^0-9\-]/g, '');
      row[field] = Math.round(Number(raw) || 0);
    }
    this.dirty = true;
    this.saveSubject.next();
  }

  // Legacy: kept for compatibility but prefer onCommissionInput
  updateCommission(row: DayRow, value: string) {
    this.onCommissionInput(row, value);
  }

  onSaleInput(row: DayRow, value: string) {
    const raw = String(value || '').replace(/[^0-9\-]/g, '');
    const n = Math.round(Number(raw) || 0);
    row.sale = n;
    this.dirty = true;
    this.saveSubject.next();
  }

  onCommissionInput(row: DayRow, value: string) {
    // empty -> clear override
    if (value === '' || value === null) {
      row.commissionOverride = null;
      this.dirty = true;
      this.saveSubject.next();
      return;
    }

    const raw = String(value || '').replace(/[^0-9\-]/g, '');
    const n = Math.round(Number(raw));
    row.commissionOverride = isNaN(n) ? null : n;
    this.dirty = true;
    this.saveSubject.next();
  }

  formatCurrencyValue(v: number): string {
    if (v === null || v === undefined || v === 0) return '';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
    } catch (e) {
      return '$' + String(Math.round(v));
    }
  }

  resetCommission(row: DayRow) {
    row.commissionOverride = null;
    this.dirty = true;
    this.saveSubject.next();
  }

  saveMonth() {
    if (!this.studentId) return this.studentsService.createDriverMonth({ studentId: this.studentId, month: this.selectedMonthIndex, days: this.days });

    // prepare payload: include day numbers and the fields (round numbers to integers)
    const daysPayload = this.days.map(d => ({ day: d.day, hours: Math.round(d.hours || 0), detail: d.detail || '', sale: Math.round(d.sale || 0), commissionOverride: d.commissionOverride !== null && d.commissionOverride !== undefined ? Math.round(d.commissionOverride) : null }));

    return this.studentsService.saveDriverMonth(this.studentId, this.selectedMonthIndex, daysPayload);
  }

  onSaveClicked() {
    this.saveMonth().subscribe({
      next: () => {
        this.dirty = false;
        console.log('Month saved');
      },
      error: (err) => console.error('Error saving month', err)
    });
  }

  ngOnDestroy(): void {
    // flush pending autosave
    if (this.dirty) {
      this.saveMonth().subscribe({
        next: () => console.log('Autosaved month on destroy'),
        error: (err) => console.error('Auto-save failed', err)
      });
    }

    if (this.saveSub) {
      this.saveSub.unsubscribe();
    }
  }

  // Average COMMISSION only over days that have a sale > 0 (rounded)
  get averageCommission(): number {
    const daysWithSale = this.days.filter(d => (d.sale || 0) > 0);
    if (daysWithSale.length === 0) return 0;
    const sum = daysWithSale.reduce((a, b) => a + this.calculateCommission(b), 0);
    return Math.round(sum / daysWithSale.length);
  }

  // Additional summary metrics
  get totalCommission(): number {
    return this.days.reduce((a, b) => a + this.calculateCommission(b), 0);
  }

  get totalSales(): number {
    return this.days.reduce((a, b) => a + (b.sale || 0), 0);
  }

  get averageSale(): number {
    const daysWithSale = this.days.filter(d => (d.sale || 0) > 0);
    if (daysWithSale.length === 0) return 0;
    const sum = daysWithSale.reduce((a, b) => a + (b.sale || 0), 0);
    return Math.round(sum / daysWithSale.length);
  }

  get totalHours(): number {
    return this.days.reduce((a, b) => a + (b.hours || 0), 0);
  }
}
