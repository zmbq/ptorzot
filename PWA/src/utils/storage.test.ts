import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('get', () => {
    it('returns null for non-existent key', () => {
      expect(storage.get('nonexistent')).toBeNull();
    });

    it('retrieves stored value', () => {
      localStorage.setItem('test', JSON.stringify({ value: 42 }));
      expect(storage.get('test')).toEqual({ value: 42 });
    });

    it('handles different data types', () => {
      storage.set('string', 'hello');
      storage.set('number', 123);
      storage.set('boolean', true);
      storage.set('object', { a: 1, b: 2 });
      storage.set('array', [1, 2, 3]);

      expect(storage.get('string')).toBe('hello');
      expect(storage.get('number')).toBe(123);
      expect(storage.get('boolean')).toBe(true);
      expect(storage.get('object')).toEqual({ a: 1, b: 2 });
      expect(storage.get('array')).toEqual([1, 2, 3]);
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('invalid', 'not valid json{');
      expect(storage.get('invalid')).toBeNull();
    });
  });

  describe('set', () => {
    it('stores value', () => {
      storage.set('test', { value: 42 });
      const stored = localStorage.getItem('test');
      expect(stored).toBe(JSON.stringify({ value: 42 }));
    });

    it('overwrites existing value', () => {
      storage.set('test', 'first');
      storage.set('test', 'second');
      expect(storage.get('test')).toBe('second');
    });

    it('handles complex objects', () => {
      const complex = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        mixed: [{ a: 1 }, { b: 2 }],
      };
      storage.set('complex', complex);
      expect(storage.get('complex')).toEqual(complex);
    });
  });

  describe('remove', () => {
    it('removes existing item', () => {
      storage.set('test', 'value');
      storage.remove('test');
      expect(storage.get('test')).toBeNull();
    });

    it('does nothing for non-existent item', () => {
      storage.remove('nonexistent');
      // Should not throw
      expect(storage.get('nonexistent')).toBeNull();
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      storage.set('item1', 'value1');
      storage.set('item2', 'value2');
      storage.set('item3', 'value3');

      storage.clear();

      expect(storage.get('item1')).toBeNull();
      expect(storage.get('item2')).toBeNull();
      expect(storage.get('item3')).toBeNull();
    });
  });

  describe('isAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(storage.isAvailable()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      storage.set('test', 'value');

      mockSetItem.mockRestore();
    });

    it('handles getItem errors gracefully', () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      // Should return null instead of throwing
      expect(storage.get('test')).toBeNull();

      mockGetItem.mockRestore();
    });
  });
});
