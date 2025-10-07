import { describe, it, expect } from 'vitest';
import { OnePlay } from './OnePlay';

describe('OnePlay', () => {
  describe('constructor and getters', () => {
    it('creates a valid play with addition', () => {
      const numbers = [5, 3, 7, 2, 9];
      const play = new OnePlay(0, 1, '+', numbers);

      expect(play.first).toBe(0);
      expect(play.second).toBe(1);
      expect(play.op).toBe('+');
      expect(play.numbersPre).toEqual([5, 3, 7, 2, 9]);
      expect(play.numbersPost).toEqual([8, 7, 2, 9]); // 5+3=8, removed 3
    });

    it('creates a valid play with subtraction', () => {
      const numbers = [10, 3, 5];
      const play = new OnePlay(0, 1, '-', numbers);

      expect(play.numbersPost).toEqual([7, 5]); // 10-3=7, removed 3
    });

    it('creates a valid play with multiplication', () => {
      const numbers = [5, 3, 2];
      const play = new OnePlay(0, 1, '*', numbers);

      expect(play.numbersPost).toEqual([15, 2]); // 5*3=15, removed 3
    });

    it('creates a valid play with division', () => {
      const numbers = [6, 3, 2];
      const play = new OnePlay(0, 1, '/', numbers);

      expect(play.numbersPost).toEqual([2, 2]); // 6/3=2, removed 3
    });

    it('handles different index positions', () => {
      const numbers = [5, 3, 7, 2, 9];
      const play = new OnePlay(2, 4, '+', numbers);

      expect(play.numbersPost).toEqual([5, 3, 16, 2]); // 7+9=16, removed 9
    });

    it('handles when first index is after second', () => {
      const numbers = [5, 3, 7];
      const play = new OnePlay(2, 0, '*', numbers);

      // 7*5=35, result goes to index 2, then remove index 0
      // [5, 3, 35] -> remove index 0 -> [3, 35]
      expect(play.numbersPost).toEqual([3, 35]);
    });
  });

  describe('validation', () => {
    it('throws error for invalid operation', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(0, 1, 'x' as any, numbers)).toThrow("Op cannot be 'x'");
    });

    it('throws error for negative first index', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(-1, 1, '+', numbers)).toThrow(
        'First and second must be non-negative and different'
      );
    });

    it('throws error for negative second index', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(0, -1, '+', numbers)).toThrow(
        'First and second must be non-negative and different'
      );
    });

    it('throws error when first equals second', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(1, 1, '+', numbers)).toThrow(
        'First and second must be non-negative and different'
      );
    });

    it('throws error for out of bounds first index', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(5, 1, '+', numbers)).toThrow('Indices out of bounds');
    });

    it('throws error for out of bounds second index', () => {
      const numbers = [5, 3, 7];
      expect(() => new OnePlay(0, 10, '+', numbers)).toThrow('Indices out of bounds');
    });
  });

  describe('immutability', () => {
    it('does not modify the original numbers array', () => {
      const numbers = [5, 3, 7, 2, 9];
      const originalNumbers = [...numbers];
      new OnePlay(0, 1, '+', numbers);

      expect(numbers).toEqual(originalNumbers);
    });

    it('returns readonly arrays', () => {
      const numbers = [5, 3, 7];
      const play = new OnePlay(0, 1, '+', numbers);

      // TypeScript should prevent this at compile time
      // At runtime, the arrays are regular arrays but we treat them as readonly
      expect(Array.isArray(play.numbersPre)).toBe(true);
      expect(Array.isArray(play.numbersPost)).toBe(true);
    });
  });

  describe('chained plays', () => {
    it('correctly chains multiple plays', () => {
      // Start with [5, 3, 7, 2, 9]
      const numbers = [5, 3, 7, 2, 9];

      // First play: 5 + 3 = 8 → [8, 7, 2, 9]
      const play1 = new OnePlay(0, 1, '+', numbers);
      expect(play1.numbersPost).toEqual([8, 7, 2, 9]);

      // Second play: 8 * 7 = 56 → [56, 2, 9]
      const play2 = new OnePlay(0, 1, '*', [...play1.numbersPost]);
      expect(play2.numbersPost).toEqual([56, 2, 9]);

      // Third play: 56 - 2 = 54 → [54, 9]
      const play3 = new OnePlay(0, 1, '-', [...play2.numbersPost]);
      expect(play3.numbersPost).toEqual([54, 9]);

      // Final play: 54 / 9 = 6 → [6]
      const play4 = new OnePlay(0, 1, '/', [...play3.numbersPost]);
      expect(play4.numbersPost).toEqual([6]);
    });
  });

  describe('JSON serialization', () => {
    it('serializes to JSON', () => {
      const numbers = [5, 3, 7, 2, 9];
      const play = new OnePlay(0, 1, '+', numbers);
      const json = play.toJSON();

      expect(json).toEqual({
        first: 0,
        second: 1,
        op: '+',
        numbersPre: [5, 3, 7, 2, 9],
        numbersPost: [8, 7, 2, 9],
      });
    });

    it('deserializes from JSON', () => {
      const data = {
        first: 0,
        second: 1,
        op: '+' as const,
        numbersPre: [5, 3, 7, 2, 9],
        numbersPost: [8, 7, 2, 9],
      };

      const play = OnePlay.fromJSON(data);

      expect(play.first).toBe(0);
      expect(play.second).toBe(1);
      expect(play.op).toBe('+');
      expect(play.numbersPre).toEqual([5, 3, 7, 2, 9]);
      expect(play.numbersPost).toEqual([8, 7, 2, 9]);
    });

    it('round-trips through JSON', () => {
      const numbers = [10, 20, 30];
      const play1 = new OnePlay(1, 2, '*', numbers);
      const json = play1.toJSON();
      const play2 = OnePlay.fromJSON(json as any);

      expect(play2.first).toBe(play1.first);
      expect(play2.second).toBe(play1.second);
      expect(play2.op).toBe(play1.op);
      expect(play2.numbersPre).toEqual([...play1.numbersPre]);
      expect(play2.numbersPost).toEqual([...play1.numbersPost]);
    });

    it('throws error for inconsistent JSON data', () => {
      const data = {
        first: 0,
        second: 1,
        op: '+' as const,
        numbersPre: [5, 3, 7],
        numbersPost: [999, 7], // Wrong result!
      };

      expect(() => OnePlay.fromJSON(data)).toThrow('inconsistent numbersPost');
    });
  });

  describe('decimal results', () => {
    it('handles division with decimal results', () => {
      const numbers = [7, 2, 5];
      const play = new OnePlay(0, 1, '/', numbers);

      expect(play.numbersPost[0]).toBe(3.5); // 7/2 = 3.5
      expect(play.numbersPost).toEqual([3.5, 5]);
    });

    it('handles complex decimal chains', () => {
      const numbers = [10, 3];
      const play1 = new OnePlay(0, 1, '/', numbers);
      expect(play1.numbersPost[0]).toBeCloseTo(3.333333, 5);
    });
  });
});
