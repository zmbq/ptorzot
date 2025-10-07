import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLanguage,
  setLanguage,
  t,
  getTranslations,
  isRTL,
  getDirection,
} from './i18n';

describe('i18n', () => {
  beforeEach(() => {
    // Reset to Hebrew (default)
    setLanguage('he');
  });

  describe('getLanguage and setLanguage', () => {
    it('defaults to Hebrew', () => {
      expect(getLanguage()).toBe('he');
    });

    it('can set language to English', () => {
      setLanguage('en');
      expect(getLanguage()).toBe('en');
    });

    it('can switch between languages', () => {
      setLanguage('en');
      expect(getLanguage()).toBe('en');
      setLanguage('he');
      expect(getLanguage()).toBe('he');
    });
  });

  describe('t (translate)', () => {
    it('translates to Hebrew by default', () => {
      expect(t('app_name')).toBe('פתור זאת');
      expect(t('newgame')).toBe('משחק חדש');
      expect(t('right')).toBe('נכון מאד!');
    });

    it('translates to English when set', () => {
      setLanguage('en');
      expect(t('app_name')).toBe('Solve It');
      expect(t('newgame')).toBe('New Game');
      expect(t('right')).toBe('Correct!');
    });

    it('can override language parameter', () => {
      setLanguage('he');
      expect(t('app_name', 'en')).toBe('Solve It');
      expect(t('app_name', 'he')).toBe('פתור זאת');
    });

    it('translates operation symbols consistently', () => {
      expect(t('plus')).toBe('+');
      expect(t('minus')).toBe('-');
      expect(t('times')).toBe('×');
      expect(t('divide')).toBe('÷');

      setLanguage('en');
      expect(t('plus')).toBe('+');
      expect(t('minus')).toBe('-');
      expect(t('times')).toBe('×');
      expect(t('divide')).toBe('÷');
    });

    it('translates level names', () => {
      expect(t('level1_short')).toBe('קל');
      expect(t('level2_short')).toBe('בינוני');
      expect(t('level3_short')).toBe('קשה');

      setLanguage('en');
      expect(t('level1_short')).toBe('Easy');
      expect(t('level2_short')).toBe('Medium');
      expect(t('level3_short')).toBe('Hard');
    });

    it('translates level descriptions', () => {
      expect(t('level1_long')).toBe('תרגילים קלים');
      expect(t('level2_long')).toBe('רמה בינונית');
      expect(t('level3_long')).toBe('תרגילים קשים');

      setLanguage('en');
      expect(t('level1_long')).toBe('Easy Exercises');
      expect(t('level2_long')).toBe('Medium Level');
      expect(t('level3_long')).toBe('Hard Exercises');
    });

    it('translates all UI strings', () => {
      const keys = [
        'app_name',
        'title_activity_game',
        'mission',
        'numbers',
        'right',
        'wrong',
        'newgame',
        'tryagain',
        'check_result',
        'exit_game',
        'yes',
        'no',
        'menu_exit',
        'menu_new_game',
        'levels_title',
        'choose',
        'cancel',
      ] as const;

      keys.forEach((key) => {
        const hebrew = t(key, 'he');
        const english = t(key, 'en');

        expect(hebrew).toBeTruthy();
        expect(english).toBeTruthy();
        expect(typeof hebrew).toBe('string');
        expect(typeof english).toBe('string');
      });
    });
  });

  describe('getTranslations', () => {
    it('returns all Hebrew translations by default', () => {
      const translations = getTranslations();
      expect(translations.app_name).toBe('פתור זאת');
      expect(translations.newgame).toBe('משחק חדש');
    });

    it('returns English translations when specified', () => {
      const translations = getTranslations('en');
      expect(translations.app_name).toBe('Solve It');
      expect(translations.newgame).toBe('New Game');
    });

    it('respects current language', () => {
      setLanguage('en');
      const translations = getTranslations();
      expect(translations.app_name).toBe('Solve It');
    });
  });

  describe('isRTL', () => {
    it('returns true for Hebrew', () => {
      setLanguage('he');
      expect(isRTL()).toBe(true);
      expect(isRTL('he')).toBe(true);
    });

    it('returns false for English', () => {
      setLanguage('en');
      expect(isRTL()).toBe(false);
      expect(isRTL('en')).toBe(false);
    });

    it('can override language parameter', () => {
      setLanguage('he');
      expect(isRTL('en')).toBe(false);
      setLanguage('en');
      expect(isRTL('he')).toBe(true);
    });
  });

  describe('getDirection', () => {
    it('returns rtl for Hebrew', () => {
      setLanguage('he');
      expect(getDirection()).toBe('rtl');
      expect(getDirection('he')).toBe('rtl');
    });

    it('returns ltr for English', () => {
      setLanguage('en');
      expect(getDirection()).toBe('ltr');
      expect(getDirection('en')).toBe('ltr');
    });

    it('can override language parameter', () => {
      setLanguage('he');
      expect(getDirection('en')).toBe('ltr');
      setLanguage('en');
      expect(getDirection('he')).toBe('rtl');
    });
  });
});
