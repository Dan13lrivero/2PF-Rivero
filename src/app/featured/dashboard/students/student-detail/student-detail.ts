import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../../../core/services/students/students.service';
import { CommissionPipe } from '../pipes/commission.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [CommonModule, CommissionPipe, MatToolbarModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './student-detail.html',
  styleUrls: ['./student-detail.css']
})
export class StudentDetail implements OnInit {
  studentId: string | null = null;
  studentName: string = '';

  months: string[] = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  selectedMonthIndex = 0;
  days: DayRow[] = [];

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
  }

  setMonth(index: number) {
    this.selectedMonthIndex = index;

    // NOTE: user wanted the month to always show days 1..31 regardless of the real month length
    const daysInMonth = 31;

    this.days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.days.push({ day: i, hours: 0, detail: '', sale: 0, commissionOverride: null });
    }

    // Example sample data (keeps the demo values on the 31-day grid)
    const sampleMap: { [k: number]: Partial<DayRow> } = {
      2: { hours: 12, detail: 'M7 (07-19)', sale: 5540 },
      3: { hours: 12, detail: 'M7 (07-19)', sale: 6210 },
      4: { hours: 12, detail: 'M7 (07-19)', sale: 3800 },
      6: { hours: 12, detail: 'M7 (07-19)', sale: 2540 },
      7: { hours: 12, detail: 'M7 (07-19)', sale: 5420 },
      8: { hours: 12, detail: 'M7 (07-19)', sale: 4030 },
      9: { hours: 12, detail: 'M7 (07-19)', sale: 5740 },
      10: { hours: 12, detail: 'M7 (07-19)', sale: 5930 },
      11: { hours: 12, detail: 'M7 (07-19)', sale: 7110 },
      24: { hours: 12, detail: 'M7 (07-19)', sale: 4090 },
      25: { hours: 12, detail: 'M7 (07-19)', sale: 6590 },
      27: { hours: 12, detail: 'M7 (07-19)', sale: 4180 },
      28: { hours: 12, detail: 'M7 (07-19)', sale: 4740 },
      29: { hours: 12, detail: 'M7 (07-19)', sale: 3200 },
      30: { hours: 12, detail: 'M7 (07-19)', sale: 3950 },
      31: { hours: 12, detail: 'M7 (07-19)', sale: 4680 }
    };

    this.days.forEach((row) => {
      if (sampleMap[row.day]) {
        Object.assign(row, sampleMap[row.day]);
      }
    });
  }

  prevMonth() {
    const prev = (this.selectedMonthIndex + 11) % 12;
    this.setMonth(prev);
  }

  nextMonth() {
    const next = (this.selectedMonthIndex + 1) % 12;
    this.setMonth(next);
  }

  // Returns computed commission (or override if present)
  calculateCommission(row: DayRow): number {
    if (row.commissionOverride !== null && row.commissionOverride !== undefined) {
      return Number(row.commissionOverride) || 0;
    }

    if (row.hours === 8) {
      return Math.max(row.sale * 0.27, 800);
    }
    if (row.hours >= 9) {
      return row.sale * 0.3;
    }
    return 0;
  }

  updateRow(row: DayRow, field: 'hours' | 'sale' | 'detail', value: any) {
    if (field === 'detail') {
      row.detail = String(value || '');
    } else {
      row[field] = Number(value) || 0;
    }
  }

  updateCommission(row: DayRow, value: string) {
    // empty -> clear override, use auto
    if (value === '' || value === null) {
      row.commissionOverride = null;
      return;
    }

    const n = Number(value);
    row.commissionOverride = isNaN(n) ? null : n;
  }

  resetCommission(row: DayRow) {
    row.commissionOverride = null;
  }

  get averageCommission(): number {
    const commissions = this.days.map((d) => this.calculateCommission(d)).filter((c) => c > 0);
    if (commissions.length === 0) return 0;
    const sum = commissions.reduce((a, b) => a + b, 0);
    return sum / commissions.length;
  }
}
