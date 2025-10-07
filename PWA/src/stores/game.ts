/**
 * Game Store - Manages current game state
 * Provides reactive game state with localStorage persistence
 */

import { writable, derived } from 'svelte/store';
import { GameState, GameLevel, createNewGame, type Operation } from '$game-engine/index';
import { storage } from '$utils/storage';

const STORAGE_KEY = 'ptorzot_game_state';

/**
 * Load game state from localStorage
 */
function loadGameState(): GameState {
  try {
    const stored = storage.get(STORAGE_KEY);
    if (stored) {
      return GameState.fromJSON(stored);
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  // If no stored state or error, create a new game with default level (Easy)
  return createNewGame(GameLevel.Easy);
}

/**
 * Save game state to localStorage
 */
function saveGameState(state: GameState): void {
  try {
    storage.set(STORAGE_KEY, state.toJSON());
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Create the game store
 */
function createGameStore() {
  const initialState = loadGameState();
  const { subscribe, set, update } = writable<GameState>(initialState);

  return {
    subscribe,

    /**
     * Start a new game at the specified difficulty level
     */
    newGame(level: GameLevel): void {
      const state = createNewGame(level);
      set(state);
      saveGameState(state);
    },

    /**
     * Make a play (add an operation)
     */
    addPlay(first: number, second: number, op: Operation): void {
      update((state) => {
        try {
          state.addPlay(first, second, op);
          saveGameState(state);
          return state;
        } catch (error) {
          console.error('Invalid play:', error);
          return state;
        }
      });
    },

    /**
     * Undo the last play
     */
    undo(): void {
      update((state) => {
        state.undoLastPlay();
        saveGameState(state);
        return state;
      });
    },

    /**
     * Reset the current game (clear all plays)
     */
    reset(): void {
      update((state) => {
        state.reset();
        saveGameState(state);
        return state;
      });
    },

    /**
     * Clear the game state and start a new game
     */
    clear(): void {
      const newState = createNewGame(GameLevel.Easy);
      set(newState);
      saveGameState(newState);
    },

    /**
     * Restore a game state (for undo/redo or loading)
     */
    restore(state: GameState): void {
      set(state);
      saveGameState(state);
    },
  };
}

/**
 * Main game store
 */
export const gameStore = createGameStore();

/**
 * Derived store: Current numbers
 */
export const currentNumbers = derived(gameStore, ($game) => {
  return $game.getCurrentNumbers();
});

/**
 * Derived store: Current result (if game is down to one number)
 */
export const currentResult = derived(gameStore, ($game) => {
  return $game.getCurrentResult();
});

/**
 * Derived store: Is the game solved?
 */
export const isSolved = derived(gameStore, ($game) => {
  return $game.isSolved();
});

/**
 * Derived store: Can undo?
 */
export const canUndo = derived(gameStore, ($game) => {
  return $game.plays.length > 0;
});

/**
 * Derived store: Number of plays made
 */
export const playCount = derived(gameStore, ($game) => {
  return $game.plays.length;
});

/**
 * Derived store: Target number
 */
export const targetNumber = derived(gameStore, ($game) => {
  return $game.target;
});

/**
 * Derived store: Current difficulty level
 */
export const currentLevel = derived(gameStore, ($game) => {
  return $game.level;
});

/**
 * Derived store: Plays made in current game
 */
export const plays = derived(gameStore, ($game) => {
  return $game.plays;
});
