/**
 * Utilities - Helper functions and browser API wrappers
 */

// Storage
export { storage } from './storage';

// Vibration
export {
  isVibrationSupported,
  vibrate,
  stopVibration,
  VibrationPatterns,
  vibratePattern,
} from './vibration';

// Shake detection
export { ShakeDetector, getShakeDetector, onShake, type ShakeCallback } from './shake';

// Internationalization
export {
  type Language,
  type TranslationKey,
  getLanguage,
  setLanguage,
  t,
  getTranslations,
  isRTL,
  getDirection,
} from './i18n';
