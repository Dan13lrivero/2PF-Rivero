import { CommissionPipe } from './commission.pipe';

describe('CommissionPipe', () => {
  const pipe = new CommissionPipe();

  it('calculates commission for 8 hours using max(sale*0.27, 800)', () => {
    expect(pipe.transform({ hours: 8, sale: 1000 })).toBeCloseTo(800); // 1000*0.27 = 270 -> uses 800
    expect(pipe.transform({ hours: 8, sale: 4000 })).toBeCloseTo(4000 * 0.27);
  });

  it('calculates commission for >=9 hours as 30% of sale', () => {
    expect(pipe.transform({ hours: 9, sale: 1000 })).toBeCloseTo(300);
    expect(pipe.transform({ hours: 12, sale: 2000 })).toBeCloseTo(600);
  });

  it('returns 0 for less than 8 hours', () => {
    expect(pipe.transform({ hours: 7, sale: 1000 })).toBeCloseTo(0);
  });
});