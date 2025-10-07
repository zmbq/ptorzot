import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isVibrationSupported,
  vibrate,
  stopVibration,
  VibrationPatterns,
  vibratePattern,
} from './vibration';

describe('vibration', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Add vibrate to navigator if it doesn't exist
    vibrateMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isVibrationSupported', () => {
    it('returns true when vibrate is available', () => {
      expect(isVibrationSupported()).toBe(true);
    });
  });

  describe('vibrate', () => {
    it('vibrates with single duration', () => {
      vibrate(100);
      expect(vibrateMock).toHaveBeenCalledWith(100);
    });

    it('vibrates with pattern array', () => {
      vibrate([100, 50, 100]);
      expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100]);
    });

    it('returns true on success', () => {
      vibrateMock.mockReturnValue(true);
      expect(vibrate(100)).toBe(true);
    });

    it('returns false on failure', () => {
      vibrateMock.mockReturnValue(false);
      expect(vibrate(100)).toBe(false);
    });

    it('handles errors gracefully', () => {
      vibrateMock.mockImplementation(() => {
        throw new Error('Vibration error');
      });
      expect(vibrate(100)).toBe(false);
    });
  });

  describe('stopVibration', () => {
    it('calls vibrate with 0', () => {
      stopVibration();
      expect(vibrateMock).toHaveBeenCalledWith(0);
    });
  });

  describe('VibrationPatterns', () => {
    it('has all expected patterns', () => {
      expect(VibrationPatterns.tap).toBe(10);
      expect(VibrationPatterns.success).toEqual([50, 50, 50]);
      expect(VibrationPatterns.error).toEqual([100, 50, 100]);
      expect(VibrationPatterns.longPress).toBe(30);
      expect(VibrationPatterns.button).toBe(15);
      expect(VibrationPatterns.invalid).toEqual([30, 30, 30]);
      expect(VibrationPatterns.celebration).toEqual([100, 50, 100, 50, 100, 50, 200]);
      expect(VibrationPatterns.undo).toBe(20);
      expect(VibrationPatterns.reset).toEqual([50, 30, 50]);
    });
  });

  describe('vibratePattern', () => {
    it('vibrates with named pattern when enabled', () => {
      vibratePattern('tap', true);
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('does not vibrate when disabled', () => {
      vibratePattern('tap', false);
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it('vibrates by default (enabled=true)', () => {
      vibratePattern('success');
      expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
    });

    it('works with all pattern names', () => {
      vibratePattern('tap');
      expect(vibrateMock).toHaveBeenLastCalledWith(10);

      vibratePattern('success');
      expect(vibrateMock).toHaveBeenLastCalledWith([50, 50, 50]);

      vibratePattern('error');
      expect(vibrateMock).toHaveBeenLastCalledWith([100, 50, 100]);

      vibratePattern('longPress');
      expect(vibrateMock).toHaveBeenLastCalledWith(30);

      vibratePattern('button');
      expect(vibrateMock).toHaveBeenLastCalledWith(15);

      vibratePattern('invalid');
      expect(vibrateMock).toHaveBeenLastCalledWith([30, 30, 30]);

      vibratePattern('celebration');
      expect(vibrateMock).toHaveBeenLastCalledWith([100, 50, 100, 50, 100, 50, 200]);

      vibratePattern('undo');
      expect(vibrateMock).toHaveBeenLastCalledWith(20);

      vibratePattern('reset');
      expect(vibrateMock).toHaveBeenLastCalledWith([50, 30, 50]);
    });
  });
});
