/**
 * GameState represents the complete state of a game
 * Ported from Android GameState.java
 */

import { OnePlay } from './OnePlay';
import type { Operation } from './formatters';

/**
 * Difficulty level enumeration
 */
export enum GameLevel {
  Easy = 1,
  Medium = 2,
  Hard = 3,
  VeryHard = 4,
}

/**
 * Interface for JSON serialization
 */
interface GameStateJSON {
  level: number;
  numbers: number[];
  target: number;
  plays: ReturnType<OnePlay['toJSON']>[];
}

/**
 * Represents the complete state of a game
 * Contains the initial numbers, target, difficulty level, and all plays made
 */
export class GameState {
  private readonly _level: GameLevel;
  private readonly _numbers: number[];
  private readonly _target: number;
  private readonly _plays: OnePlay[];

  /**
   * Creates a new game state
   * @param level Difficulty level
   * @param numbers Array of initial numbers (must be exactly 5 numbers)
   * @param target Target number to reach
   * @throws Error if numbers array is not exactly 5 elements
   */
  constructor(level: GameLevel, numbers: number[], target: number) {
    if (numbers.length !== 5) {
      throw new Error('Only 5 numbers are supported for now');
    }

    this._level = level;
    this._numbers = [...numbers]; // Clone to prevent external modification
    this._target = target;
    this._plays = [];
  }

  // Getters
  get level(): GameLevel {
    return this._level;
  }

  get numbers(): readonly number[] {
    return this._numbers;
  }

  get target(): number {
    return this._target;
  }

  get plays(): readonly OnePlay[] {
    return this._plays;
  }

  /**
   * Gets the current numbers array after all plays
   * @returns Current state of numbers
   */
  getCurrentNumbers(): number[] {
    if (this._plays.length === 0) {
      return [...this._numbers];
    }
    return [...this._plays[this._plays.length - 1].numbersPost];
  }

  /**
   * Adds a new play to the game
   * @param first Index of first number
   * @param second Index of second number
   * @param op Operation to apply
   * @returns The created OnePlay instance
   * @throws Error if play is invalid
   */
  addPlay(first: number, second: number, op: Operation): OnePlay {
    const currentNumbers = this.getCurrentNumbers();
    const play = new OnePlay(first, second, op, currentNumbers);
    this._plays.push(play);
    return play;
  }

  /**
   * Removes the last play
   * @returns The removed play, or undefined if no plays exist
   */
  undoLastPlay(): OnePlay | undefined {
    return this._plays.pop();
  }

  /**
   * Clears all plays
   */
  reset(): void {
    this._plays.length = 0;
  }

  /**
   * Checks if the game is solved (current result equals target)
   * @param epsilon Tolerance for floating point comparison
   * @returns True if solved
   */
  isSolved(epsilon: number = 1e-5): boolean {
    const current = this.getCurrentNumbers();
    if (current.length !== 1) {
      return false;
    }
    return Math.abs(current[0] - this._target) < epsilon;
  }

  /**
   * Gets the current result (if only one number remains)
   * @returns The current result, or undefined if multiple numbers remain
   */
  getCurrentResult(): number | undefined {
    const current = this.getCurrentNumbers();
    return current.length === 1 ? current[0] : undefined;
  }

  /**
   * Serializes the game state to JSON
   */
  toJSON(): GameStateJSON {
    return {
      level: this._level,
      numbers: this._numbers,
      target: this._target,
      plays: this._plays.map((play) => play.toJSON()),
    };
  }

  /**
   * Deserializes a game state from JSON
   */
  static fromJSON(data: GameStateJSON): GameState {
    const state = new GameState(data.level as GameLevel, data.numbers, data.target);
    
    // Reconstruct plays
    for (const playData of data.plays) {
      const play = OnePlay.fromJSON(playData as any);
      state._plays.push(play);
    }

    return state;
  }

  /**
   * Creates a clone of this game state
   */
  clone(): GameState {
    return GameState.fromJSON(this.toJSON());
  }
}
