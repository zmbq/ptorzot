/**
 * Game Engine - Core game logic
 * 
 * This module contains the pure TypeScript game logic with no UI dependencies.
 * All components are immutable and side-effect free.
 */

// Core types and utilities
export { type Operation, getOpString, getPrintedNumber, applyOperation } from './formatters';

// Game data structures
export { OnePlay } from './OnePlay';
export { GameState, GameLevel } from './GameState';

// Level system and puzzle generation
export {
  type LevelConfig,
  LEVEL_CONFIGS,
  createSolvableGame,
  createNewGame,
  getLevelConfig,
  getAllLevelConfigs,
} from './levels';
