/**
 * Settings Store - Manages user preferences
 * Persists settings to localStorage
 */

import { writable } from 'svelte/store';
import { GameLevel } from '$game-engine/index';
import { storage } from '$utils/storage';

const STORAGE_KEY = 'ptorzot_settings';

/**
 * Settings interface
 */
export interface Settings {
  /** Current difficulty level preference */
  level: GameLevel;
  /** Sound effects enabled */
  soundEnabled: boolean;
  /** Vibration enabled */
  vibrationEnabled: boolean;
  /** Language preference */
  language: 'he' | 'en';
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: Settings = {
  level: GameLevel.Easy,
  soundEnabled: true,
  vibrationEnabled: true,
  language: 'he',
};

/**
 * Load settings from localStorage
 */
function loadSettings(): Settings {
  try {
    const stored = storage.get<Settings>(STORAGE_KEY);
    if (stored) {
      // Merge with defaults to handle new settings
      return { ...DEFAULT_SETTINGS, ...stored };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  try {
    storage.set(STORAGE_KEY, settings);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Create the settings store
 */
function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(loadSettings());

  return {
    subscribe,

    /**
     * Update difficulty level
     */
    setLevel(level: GameLevel): void {
      update((settings) => {
        const newSettings = { ...settings, level };
        saveSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Toggle sound effects
     */
    toggleSound(): void {
      update((settings) => {
        const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
        saveSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Toggle vibration
     */
    toggleVibration(): void {
      update((settings) => {
        const newSettings = { ...settings, vibrationEnabled: !settings.vibrationEnabled };
        saveSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Set language
     */
    setLanguage(language: 'he' | 'en'): void {
      update((settings) => {
        const newSettings = { ...settings, language };
        saveSettings(newSettings);
        return newSettings;
      });
    },

    /**
     * Reset to default settings
     */
    reset(): void {
      const defaultSettings = { ...DEFAULT_SETTINGS };
      set(defaultSettings);
      saveSettings(defaultSettings);
    },
  };
}

/**
 * Settings store instance
 */
export const settingsStore = createSettingsStore();
