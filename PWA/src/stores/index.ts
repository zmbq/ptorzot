/**
 * Stores - Svelte stores for reactive state management
 * 
 * All stores use localStorage for persistence
 */

// Game state management
export {
  gameStore,
  currentNumbers,
  currentResult,
  isSolved,
  canUndo,
  playCount,
  targetNumber,
  currentLevel,
  plays,
} from './game';

// Settings management
export { settingsStore, type Settings } from './settings';
