/**
 * Internationalization (i18n) utility
 * Provides translations for Hebrew and English
 * Based on Android strings.xml
 */

/**
 * Supported languages
 */
export type Language = 'he' | 'en';

/**
 * Translation keys
 */
export type TranslationKey =
  | 'app_name'
  | 'title_activity_game'
  | 'plus'
  | 'minus'
  | 'times'
  | 'divide'
  | 'mission'
  | 'numbers'
  | 'right'
  | 'wrong'
  | 'newgame'
  | 'tryagain'
  | 'check_result'
  | 'exit_game'
  | 'yes'
  | 'no'
  | 'menu_exit'
  | 'menu_new_game'
  | 'level1_short'
  | 'level1_long'
  | 'level2_short'
  | 'level2_long'
  | 'level3_short'
  | 'level3_long'
  | 'levels_title'
  | 'choose'
  | 'cancel';

/**
 * Translation dictionary
 */
type Translations = Record<TranslationKey, string>;

/**
 * Hebrew translations (primary language)
 */
const he: Translations = {
  app_name: 'פתור זאת',
  title_activity_game: 'פתור זאת',
  plus: '+',
  minus: '-',
  times: '×',
  divide: '÷',
  mission: 'המשימה: להגיע למספר ',
  numbers: 'מהמספרים ',
  right: 'נכון מאד!',
  wrong: 'לא נכון',
  newgame: 'משחק חדש',
  tryagain: 'נסיון נוסף',
  check_result: 'בדיקת התשובה',
  exit_game: 'האם לצאת מהמשחק?',
  yes: 'כן',
  no: 'לא',
  menu_exit: 'סיום',
  menu_new_game: 'משחק חדש',
  level1_short: 'קל',
  level1_long: 'תרגילים קלים',
  level2_short: 'בינוני',
  level2_long: 'רמה בינונית',
  level3_short: 'קשה',
  level3_long: 'תרגילים קשים',
  levels_title: 'רמת המשחק',
  choose: 'שינוי רמה',
  cancel: 'ביטול',
};

/**
 * English translations
 */
const en: Translations = {
  app_name: 'Solve It',
  title_activity_game: 'Solve It',
  plus: '+',
  minus: '-',
  times: '×',
  divide: '÷',
  mission: 'Mission: Reach the number ',
  numbers: 'from the numbers ',
  right: 'Correct!',
  wrong: 'Incorrect',
  newgame: 'New Game',
  tryagain: 'Try Again',
  check_result: 'Check Answer',
  exit_game: 'Exit game?',
  yes: 'Yes',
  no: 'No',
  menu_exit: 'Exit',
  menu_new_game: 'New Game',
  level1_short: 'Easy',
  level1_long: 'Easy Exercises',
  level2_short: 'Medium',
  level2_long: 'Medium Level',
  level3_short: 'Hard',
  level3_long: 'Hard Exercises',
  levels_title: 'Game Level',
  choose: 'Change Level',
  cancel: 'Cancel',
};

/**
 * All translations
 */
const translations: Record<Language, Translations> = {
  he,
  en,
};

/**
 * Current language
 */
let currentLanguage: Language = 'he';

/**
 * Get the current language
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Set the current language
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

/**
 * Get a translation for a key
 * @param key Translation key
 * @param lang Language (defaults to current language)
 * @returns Translated string
 */
export function t(key: TranslationKey, lang?: Language): string {
  const language = lang ?? currentLanguage;
  return translations[language][key];
}

/**
 * Get all translations for current language
 */
export function getTranslations(lang?: Language): Translations {
  const language = lang ?? currentLanguage;
  return translations[language];
}

/**
 * Check if a language is RTL (right-to-left)
 */
export function isRTL(lang?: Language): boolean {
  const language = lang ?? currentLanguage;
  return language === 'he';
}

/**
 * Get the text direction for a language
 */
export function getDirection(lang?: Language): 'rtl' | 'ltr' {
  return isRTL(lang) ? 'rtl' : 'ltr';
}
