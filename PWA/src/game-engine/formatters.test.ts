import { describe, it, expect } from 'vitest';
import { getOpString, getPrintedNumber, applyOperation } from './formatters';

describe('formatters', () => {
  describe('getOpString', () => {
    it('returns correct symbol for addition', () => {
      expect(getOpString('+')).toBe('+');
    });

    it('returns correct symbol for subtraction', () => {
      expect(getOpString('-')).toBe('-');
    });

    it('returns correct symbol for multiplication', () => {
      expect(getOpString('*')).toBe('×');
    });

    it('returns correct symbol for division', () => {
      expect(getOpString('/')).toBe('÷');
    });
  });

  describe('getPrintedNumber', () => {
    it('formats integers without decimals', () => {
      expect(getPrintedNumber(5)).toBe('5');
      expect(getPrintedNumber(10)).toBe('10');
      expect(getPrintedNumber(0)).toBe('0');
    });

    it('formats near-integers without decimals (epsilon check)', () => {
      expect(getPrintedNumber(5.0000001)).toBe('5');
      expect(getPrintedNumber(4.9999999)).toBe('5');
    });

    it('formats decimals with 2 decimal places', () => {
      expect(getPrintedNumber(3.5)).toBe('3.50');
      expect(getPrintedNumber(7.25)).toBe('7.25');
      expect(getPrintedNumber(2.1)).toBe('2.10');
    });

    it('formats division results correctly', () => {
      expect(getPrintedNumber(10 / 3)).toBe('3.33');
      expect(getPrintedNumber(7 / 2)).toBe('3.50');
    });
  });

  describe('applyOperation', () => {
    it('performs addition', () => {
      expect(applyOperation(5, 3, '+')).toBe(8);
      expect(applyOperation(10, 20, '+')).toBe(30);
    });

    it('performs subtraction', () => {
      expect(applyOperation(5, 3, '-')).toBe(2);
      expect(applyOperation(10, 20, '-')).toBe(-10);
    });

    it('performs multiplication', () => {
      expect(applyOperation(5, 3, '*')).toBe(15);
      expect(applyOperation(10, 20, '*')).toBe(200);
    });

    it('performs division', () => {
      expect(applyOperation(6, 3, '/')).toBe(2);
      expect(applyOperation(10, 2, '/')).toBe(5);
      expect(applyOperation(7, 2, '/')).toBe(3.5);
    });

    it('handles complex operation chains', () => {
      // Example: ((5 + 3) * 2) / 4 = 4
      let result = applyOperation(5, 3, '+'); // 8
      result = applyOperation(result, 2, '*'); // 16
      result = applyOperation(result, 4, '/'); // 4
      expect(result).toBe(4);
    });
  });
});
