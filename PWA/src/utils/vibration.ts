/**
 * Vibration utility
 * Provides cross-platform vibration support with settings integration
 */

/**
 * Check if vibration API is available
 */
export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Vibrate the device
 * @param pattern Vibration pattern in milliseconds (number or array)
 * @returns True if vibration was triggered, false otherwise
 */
export function vibrate(pattern: number | number[]): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.error('Vibration failed:', error);
    return false;
  }
}

/**
 * Stop all vibration
 */
export function stopVibration(): void {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * Predefined vibration patterns
 */
export const VibrationPatterns: Record<string, number | number[]> = {
  /** Short tap feedback */
  tap: 10,
  
  /** Success feedback */
  success: [50, 50, 50],
  
  /** Error feedback */
  error: [100, 50, 100],
  
  /** Long press feedback */
  longPress: 30,
  
  /** Button press */
  button: 15,
  
  /** Invalid action */
  invalid: [30, 30, 30],
  
  /** Game solved celebration */
  celebration: [100, 50, 100, 50, 100, 50, 200],
  
  /** Undo action */
  undo: 20,
  
  /** Reset action */
  reset: [50, 30, 50],
};

/**
 * Vibrate with a predefined pattern
 * @param patternName Name of the pattern
 * @param enabled Whether vibration is enabled (from settings)
 */
export function vibratePattern(
  patternName: keyof typeof VibrationPatterns,
  enabled: boolean = true
): boolean {
  if (!enabled) {
    return false;
  }

  const pattern = VibrationPatterns[patternName];
  return vibrate(pattern);
}
