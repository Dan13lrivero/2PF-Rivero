import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commission'
})
export class CommissionPipe implements PipeTransform {
  transform(value: { hours: number; sale: number } | null | undefined): number {
    if (!value) return 0;

    const hours = Number(value.hours) || 0;
    const sale = Number(value.sale) || 0;

    if (hours === 8) {
      return Math.max(sale * 0.27, 800);
    }

    if (hours >= 9) {
      return sale * 0.3;
    }

    return 0;
  }
}
