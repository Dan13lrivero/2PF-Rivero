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

  months: string[] = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre','Detalles generales'];
  selectedMonthIndex = 0;
  days: DayRow[] = [];
  dirty = false; // tracks whether current month has unsaved changes
  isSaving = false;

  // overview fields
  student: any = null;
  yearTotalSales = 0;
  yearTotalCommission = 0;
  aguinaldoJune = 0;
  aguinaldoDecember = 0;

  // Datos para licencias y salario vacacional
  workedDays = 0; // días trabajados (venta > 0)
  generatedLicenceDays = 0; // días de licencia generados para el año siguiente
  vacationPay = 0; // salario vacacional estimado
  // Valor estimado (monetario) de la licencia generada — igual que vacationPay por requerimiento
  licenceAmount = 0;

  private saveSubject = new Subject<void>();
  private saveSub?: Subscription;

  constructor(private route: ActivatedRoute, private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.studentsService.getStudentById(this.studentId).subscribe((s: any) => {
        this.student = s || null;
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

    // If user selected the overview page, load totals instead of the 31-day grid
    if (index === this.months.length - 1) {
      this.loadOverview();
      return;
    }

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
              // preserve explicit null/undefined as null, otherwise keep numeric value
              slot.commissionOverride = (d.commissionOverride === undefined) ? null : d.commissionOverride;
            }
          });

          // After merging, fix up missing/zero commissionOverrides for days that have a sale > 0
          this.days.forEach((slot) => {
            const sale = Number(slot.sale || 0);
            if (sale > 0) {
              const co = slot.commissionOverride;
              const isUnset = (co == null) || (co === 0);

              const hoursToUse = (Number(slot.hours || 0) === 0) ? 8 : Number(slot.hours || 0);
              const currentAuto = this.calculateCommission({ day: slot.day, hours: hoursToUse, detail: slot.detail, sale: sale, commissionOverride: null });

              if (isUnset) {
                // set auto value when override is empty/zero
                slot.commissionOverride = currentAuto;
                // mark as dirty so the autosave pipeline persists this improvement
                this.dirty = true;
              } else {
                // If there is an explicit override but it matches the legacy 8h auto value and the current hours imply 30%, update it
                const legacy8Auto = this.calculateCommission({ day: slot.day, hours: 8, detail: slot.detail, sale: sale, commissionOverride: null });
                if (Number(co) === legacy8Auto && hoursToUse >= 9 && currentAuto !== legacy8Auto) {
                  slot.commissionOverride = currentAuto;
                  this.dirty = true;
                }
              }
            }
          });
          if (this.dirty) {
            this.saveSubject.next();
          }
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
    // Treat explicit null/undefined or zero as 'unset' so we compute based on hours/sale
    const co = row.commissionOverride;
    if (co !== null && co !== undefined && co !== 0) {
      const val = Math.round(Number(co) || 0);
      console.debug('[calc] using override', { day: row.day, hours: row.hours, sale: row.sale, override: co, result: val });
      return val;
    }

    // Compute according to rules: 8h -> max(27% of sale, 800); >=9h -> 30% of sale
    let result = 0;
    if (row.hours === 8) {
      result = Math.round(Math.max(row.sale * 0.27, 800));
    } else if (row.hours >= 9) {
      result = Math.round(row.sale * 0.3);
    } else {
      result = 0;
    }
    console.debug('[calc] computed', { day: row.day, hours: row.hours, sale: row.sale, result });
    return result;
  }

  updateRow(row: DayRow, field: 'hours' | 'sale' | 'detail', value: any) {
    if (field === 'detail') {
      row.detail = String(value || '');
    } else {
      // Sanitize and round numeric inputs to integer (accept pasted '10,000' etc)
      const raw = String(value || '').replace(/[^0-9\-]/g, '');
      const newVal = Math.round(Number(raw) || 0);

      // Special handling when changing hours: decide if we must recompute commission
      if (field === 'hours') {
        const prevHours = Number(row.hours || 0);
        row.hours = newVal;

        if (row.sale && Number(row.sale) > 0) {
          const saleNum = Number(row.sale || 0);
          const prevAuto = this.calculateCommission({ day: row.day, hours: prevHours === 0 ? 8 : prevHours, detail: row.detail, sale: saleNum, commissionOverride: null });
          const newAuto = this.calculateCommission({ day: row.day, hours: row.hours === 0 ? 8 : row.hours, detail: row.detail, sale: saleNum, commissionOverride: null });

          const co = row.commissionOverride;
          const isUnset = (co == null) || (co === 0);

          // Consider it 'previous-auto' if it matches prevAuto (or legacy 8h min), or is very close (rounding differences)
          const legacy8Auto = this.calculateCommission({ day: row.day, hours: 8, detail: row.detail, sale: saleNum, commissionOverride: null });
          const numericCo = Number(co || 0);
          const isPrevAuto = (!isUnset) && (numericCo === prevAuto || numericCo === legacy8Auto || Math.abs(numericCo - prevAuto) <= 2 || numericCo === 800);

          // Also if user increased hours and the stored commission is clearly lower than the new auto value and matches legacy min, update
          const increasedAndLower = (row.hours > prevHours) && (!isUnset) && (numericCo < newAuto) && (numericCo <= legacy8Auto);

          // Recompute if it was unset, it matched previous auto (including legacy edge cases), or it's legacy lower value and hours increased
          if (isUnset || isPrevAuto || increasedAndLower) {
            console.debug('[updateRow] hours change -> recomputing commission for day', row.day, { prevHours, newHours: row.hours, sale: saleNum, oldCo: co, newAuto });
            row.commissionOverride = newAuto;
          }
        }

      } else {
        row[field] = newVal;

        // If user changed sale via updateRow (rare) and no override, compute commission
        if (field === 'sale' && (row.commissionOverride === null || row.commissionOverride === undefined)) {
          if (Number(row.sale) > 0) {
            const hoursToUse = Number(row.hours || 0) === 0 ? 8 : Number(row.hours || 0);
            row.commissionOverride = this.calculateCommission({ day: row.day, hours: hoursToUse, detail: row.detail, sale: Number(row.sale || 0), commissionOverride: null });
          }
        }
      }
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

    // set sale
    row.sale = n;

    const hoursToUse = (Number(row.hours || 0) === 0) ? 8 : Number(row.hours || 0);
    const co = row.commissionOverride;
    const numericCo = Number(co || 0);
    const isUnset = (co == null) || (co === 0);

    // compute the auto values for current hours and for legacy 8h
    const currentAuto = this.calculateCommission({ day: row.day, hours: hoursToUse, detail: row.detail, sale: n, commissionOverride: null });
    const legacy8Auto = this.calculateCommission({ day: row.day, hours: 8, detail: row.detail, sale: n, commissionOverride: null });

    if (n > 0) {
      // If unset or matches legacy 8h value or clearly lower than new auto (legacy stored), update to the proper auto
      const shouldReplace = isUnset || numericCo === legacy8Auto || (numericCo < currentAuto && numericCo <= legacy8Auto) || Math.abs(numericCo - currentAuto) <= 2;
      if (shouldReplace) {
        console.debug('[onSaleInput] updating commissionOverride', { day: row.day, hours: hoursToUse, sale: n, old: co, new: currentAuto });
        row.commissionOverride = currentAuto;
      }
    } else {
      // if sale cleared and the commissionOverride matches the auto-calculated value for the hours (or 8), clear it
      if (row.commissionOverride !== null && row.commissionOverride !== undefined) {
        const autoVal = this.calculateCommission({ day: row.day, hours: hoursToUse, detail: row.detail, sale: n, commissionOverride: null });
        if (row.commissionOverride === autoVal) {
          row.commissionOverride = null;
        }
      }
    }

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

  formatCurrencyValue(v: number, showZero = false): string {
    // When showZero is true, format zero value as '$0'; otherwise return empty string for 0/null/undefined
    if ((v === null || v === undefined || v === 0) && !showZero) return '';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v) || 0);
    } catch (e) {
      return '$' + String(Math.round(Number(v) || 0));
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

  // Load overview (yearly totals and aguinaldos)
  loadOverview() {
    // reset
    this.yearTotalSales = 0;
    this.yearTotalCommission = 0;
    this.aguinaldoJune = 0;
    this.aguinaldoDecember = 0;

    if (!this.studentId) return;

    this.studentsService.getDriverMonths(this.studentId).subscribe((records: any[]) => {
      // records may contain 0..12 entries for months; we sum per-month
      const monthlySales: number[] = new Array(12).fill(0);
      const monthlyCommissions: number[] = new Array(12).fill(0);

      records.forEach((rec) => {
        const monthIndex = Number(rec.month);
        if (monthIndex >= 0 && monthIndex < 12 && rec.days && Array.isArray(rec.days)) {
          rec.days.forEach((d: any) => {
            const sale = Number(d.sale || 0);
            const commission = this.calculateCommission({ day: d.day, hours: Number(d.hours || 0), detail: d.detail, sale: sale, commissionOverride: d.commissionOverride ?? null });
            monthlySales[monthIndex] += sale;
            monthlyCommissions[monthIndex] += commission;
          });
        }
      });

      // Totals for year
      this.yearTotalSales = monthlySales.reduce((a, b) => a + b, 0);
      this.yearTotalCommission = monthlyCommissions.reduce((a, b) => a + b, 0);

      // Calcular días trabajados (día con venta > 0)
      const workedDaysCount = records.reduce((acc, rec) => {
        if (rec.days && Array.isArray(rec.days)) {
          return acc + rec.days.filter((d: any) => Number(d.sale || 0) > 0).length;
        }
        return acc;
      }, 0);
      this.workedDays = workedDaysCount;

      // Días de licencia generados: 1.66 días cada 26 trabajados
      const generated = workedDaysCount > 0 ? (workedDaysCount / 26) * 1.66 : 0;
      this.generatedLicenceDays = Number(generated.toFixed(2));

      // Salario vacacional estimado: promedio de comisión por día trabajado * días de licencia generados
      if (workedDaysCount > 0) {
        const avgCommissionPerWorkedDay = this.yearTotalCommission / workedDaysCount;
        this.vacationPay = Math.round(avgCommissionPerWorkedDay * this.generatedLicenceDays);
        // Según requeriste, el valor de licencia (monetario) es igual al salario vacacional estimado
        this.licenceAmount = this.vacationPay;
      } else {
        this.vacationPay = 0;
        this.licenceAmount = 0;
      }

      // Aguinaldo de Junio -> sumar comisiones Enero(0) a Mayo(4) + comisión diciembre del año anterior (ya almacenada)
      const sumJanToMay = monthlyCommissions.slice(0, 5).reduce((a, b) => a + b, 0);
      let decPrevCommission = 0;
      if (this.student && this.student.lastDecemberCommission) {
        // lastDecemberCommission ya contiene la comisión correspondiente del diciembre anterior
        decPrevCommission = Number(this.student.lastDecemberCommission || 0);
      }
      this.aguinaldoJune = Math.round((sumJanToMay + decPrevCommission) / 12);

      // Aguinaldo de Diciembre -> sumar comisiones Mayo(4) a Noviembre(10)
      const sumMayToNov = monthlyCommissions.slice(4, 11).reduce((a, b) => a + b, 0);
      this.aguinaldoDecember = Math.round(sumMayToNov / 12);

    }, (err) => {
      console.error('Error loading driver months for overview', err);
    });
  }

  onLastDecInput(value: string) {
    if (!this.student || !this.student.id) return;
    const raw = String(value || '').replace(/[^0-9\-]/g, '');
    const n = Math.round(Number(raw) || 0);
    this.student.lastDecemberCommission = n;
    // persist change
    this.studentsService.updateStudent(this.student.id, this.student);
    // recompute overview if currently visible
    if (this.selectedMonthIndex === this.months.length - 1) {
      this.loadOverview();
    }
  }
}
