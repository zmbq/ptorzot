/**
 * Level system for generating solvable puzzles
 * Ported from Android GameLevel.java and subclasses
 */

import { applyOperation, type Operation } from './formatters';
import { GameState, GameLevel } from './GameState';

const MAX_ITERS = 1000;
const EPSILON = 1e-6;

/**
 * Configuration for a difficulty level
 */
export interface LevelConfig {
  level: GameLevel;
  minTarget: number;
  maxTarget: number;
  name: string;
  nameLong: string;
  color: 'green' | 'yellow' | 'red';
}

/**
 * Level configurations
 */
export const LEVEL_CONFIGS: Record<GameLevel, LevelConfig> = {
  [GameLevel.Easy]: {
    level: GameLevel.Easy,
    minTarget: 11,
    maxTarget: 40,
    name: 'קל', // Easy
    nameLong: 'תרגילים קלים', // Easy exercises
    color: 'green',
  },
  [GameLevel.Medium]: {
    level: GameLevel.Medium,
    minTarget: 19,
    maxTarget: 60,
    name: 'בינוני', // Medium
    nameLong: 'רמה בינונית', // Medium level
    color: 'yellow',
  },
  [GameLevel.Hard]: {
    level: GameLevel.Hard,
    minTarget: 60,
    maxTarget: 120,
    name: 'קשה', // Hard
    nameLong: 'תרגילים קשים', // Hard exercises
    color: 'red',
  },
  [GameLevel.VeryHard]: {
    level: GameLevel.VeryHard,
    minTarget: 100,
    maxTarget: 150,
    name: 'קשה מאד', // Very Hard in Hebrew
    nameLong: 'תרגילים קשים מאד', // Very hard exercises
    color: 'red',
  },
};

/**
 * Checks if a number is close enough to an integer
 */
function isInt(num: number): boolean {
  return num - Math.floor(num) < EPSILON;
}

/**
 * Generates 5 random numbers between 1 and 9
 */
function generateRandomNumbers(): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < 5; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  return numbers;
}

/**
 * Finds a solvable target by randomly applying operations
 * The algorithm guarantees the puzzle is solvable because it creates
 * the target by actually performing operations on the numbers
 */
function findSolvableTarget(
  numbers: number[],
  minTarget: number,
  maxTarget: number
): number {
  const ops: Operation[] = ['+', '-', '*', '/'];
  let loopCount = 0;
  let minFound = 99999999;
  let maxFound = -1;
  let iTarget = 0;

  do {
    let target = numbers[0];

    // Apply random operations to create a target
    for (let i = 1; i < 5; i++) {
      const op = ops[Math.floor(Math.random() * 4)];
      target = applyOperation(target, numbers[i], op);
    }

    // Skip if not a valid target (not integer or negative)
    if (!isInt(target) || target < 0) {
      continue;
    }

    iTarget = Math.floor(target);

    // Track min/max for fallback
    if (iTarget < minFound) {
      minFound = iTarget;
    }
    if (iTarget > maxFound) {
      maxFound = iTarget;
    }

    loopCount++;
  } while ((iTarget < minTarget || iTarget > maxTarget) && loopCount < MAX_ITERS);

  // If we couldn't find target in range, return closest we found
  if (loopCount === MAX_ITERS) {
    return minFound;
  }

  return iTarget;
}

/**
 * Creates a solvable game with random numbers and guaranteed solvable target
 */
export function createSolvableGame(
  minTarget: number,
  maxTarget: number
): { numbers: number[]; target: number } {
  const numbers = generateRandomNumbers();
  const target = findSolvableTarget(numbers, minTarget, maxTarget);
  return { numbers, target };
}

/**
 * Creates a new game for a specific difficulty level
 */
export function createNewGame(level: GameLevel): GameState {
  const config = LEVEL_CONFIGS[level];
  const { numbers, target } = createSolvableGame(config.minTarget, config.maxTarget);
  return new GameState(level, numbers, target);
}

/**
 * Gets the level configuration for a specific level
 */
export function getLevelConfig(level: GameLevel): LevelConfig {
  return LEVEL_CONFIGS[level];
}

/**
 * Gets all level configurations
 */
export function getAllLevelConfigs(): LevelConfig[] {
  return [
    LEVEL_CONFIGS[GameLevel.Easy],
    LEVEL_CONFIGS[GameLevel.Medium],
    LEVEL_CONFIGS[GameLevel.Hard],
    LEVEL_CONFIGS[GameLevel.VeryHard],
  ];
}
