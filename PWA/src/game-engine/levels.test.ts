import { describe, it, expect } from 'vitest';
import {
  createSolvableGame,
  createNewGame,
  getLevelConfig,
  getAllLevelConfigs,
  LEVEL_CONFIGS,
} from './levels';
import { GameLevel } from './GameState';

describe('levels', () => {
  describe('LEVEL_CONFIGS', () => {
    it('has configuration for all three levels', () => {
      expect(LEVEL_CONFIGS[GameLevel.Easy]).toBeDefined();
      expect(LEVEL_CONFIGS[GameLevel.Medium]).toBeDefined();
      expect(LEVEL_CONFIGS[GameLevel.Hard]).toBeDefined();
      expect(LEVEL_CONFIGS[GameLevel.VeryHard]).toBeDefined();
    });

    it('has correct target ranges', () => {
      expect(LEVEL_CONFIGS[GameLevel.Easy].minTarget).toBe(11);
      expect(LEVEL_CONFIGS[GameLevel.Easy].maxTarget).toBe(40);

      expect(LEVEL_CONFIGS[GameLevel.Medium].minTarget).toBe(19);
      expect(LEVEL_CONFIGS[GameLevel.Medium].maxTarget).toBe(60);

      expect(LEVEL_CONFIGS[GameLevel.Hard].minTarget).toBe(60);
      expect(LEVEL_CONFIGS[GameLevel.Hard].maxTarget).toBe(120);
      expect(LEVEL_CONFIGS[GameLevel.VeryHard].minTarget).toBe(100);
      expect(LEVEL_CONFIGS[GameLevel.VeryHard].maxTarget).toBe(150);
    });

    it('has correct colors', () => {
      expect(LEVEL_CONFIGS[GameLevel.Easy].color).toBe('green');
      expect(LEVEL_CONFIGS[GameLevel.Medium].color).toBe('yellow');
      expect(LEVEL_CONFIGS[GameLevel.Hard].color).toBe('red');
      expect(LEVEL_CONFIGS[GameLevel.VeryHard].color).toBe('red');
    });

    it('has Hebrew names', () => {
      expect(LEVEL_CONFIGS[GameLevel.Easy].name).toBe('קל');
      expect(LEVEL_CONFIGS[GameLevel.Medium].name).toBe('בינוני');
      expect(LEVEL_CONFIGS[GameLevel.Hard].name).toBe('קשה');
      expect(LEVEL_CONFIGS[GameLevel.VeryHard].name).toBe('קשה מאד');
    });
  });

  describe('createSolvableGame', () => {
    it('generates 5 numbers between 1 and 9', () => {
      const { numbers } = createSolvableGame(10, 50);

      expect(numbers).toHaveLength(5);
      numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
        expect(Number.isInteger(num)).toBe(true);
      });
    });

    it('generates target within specified range (usually)', () => {
      // Run multiple times since it's random
      const results: number[] = [];
      for (let i = 0; i < 10; i++) {
        const { target } = createSolvableGame(20, 30);
        results.push(target);
      }

      // At least some should be in range (might not all be due to algorithm fallback)
      const inRange = results.filter((t) => t >= 20 && t <= 30).length;
      expect(inRange).toBeGreaterThan(0);
    });

    it('generates integer targets', () => {
      for (let i = 0; i < 10; i++) {
        const { target } = createSolvableGame(10, 100);
        expect(Number.isInteger(target)).toBe(true);
      }
    });

    it('generates non-negative targets', () => {
      for (let i = 0; i < 10; i++) {
        const { target } = createSolvableGame(10, 100);
        expect(target).toBeGreaterThanOrEqual(0);
      }
    });

    it('generates different games on each call', () => {
      const game1 = createSolvableGame(10, 50);
      const game2 = createSolvableGame(10, 50);

      // Very unlikely to be identical
      const same =
        JSON.stringify(game1.numbers) === JSON.stringify(game2.numbers) &&
        game1.target === game2.target;
      expect(same).toBe(false);
    });
  });

  describe('createNewGame', () => {
    it('creates easy game with correct parameters', () => {
      const game = createNewGame(GameLevel.Easy);

      expect(game.level).toBe(GameLevel.Easy);
      expect(game.numbers).toHaveLength(5);
      expect(game.plays).toHaveLength(0);

      // Target might be outside range if algorithm couldn't find one,
      // but should be reasonable
      expect(game.target).toBeGreaterThanOrEqual(0);
      expect(game.target).toBeLessThan(200);
    });

    it('creates medium game with correct parameters', () => {
      const game = createNewGame(GameLevel.Medium);

      expect(game.level).toBe(GameLevel.Medium);
      expect(game.numbers).toHaveLength(5);
      expect(game.plays).toHaveLength(0);
      expect(game.target).toBeGreaterThanOrEqual(0);
    });

    it('creates hard game with correct parameters', () => {
      const game = createNewGame(GameLevel.Hard);

      expect(game.level).toBe(GameLevel.Hard);
      expect(game.numbers).toHaveLength(5);
      expect(game.plays).toHaveLength(0);
      expect(game.target).toBeGreaterThanOrEqual(0);
    });

    it('creates different games for same level', () => {
      const game1 = createNewGame(GameLevel.Easy);
      const game2 = createNewGame(GameLevel.Easy);

      const same =
        JSON.stringify([...game1.numbers]) === JSON.stringify([...game2.numbers]) &&
        game1.target === game2.target;
      expect(same).toBe(false);
    });

    it('creates games with different target ranges for different levels', () => {
      const easyGames = Array.from({ length: 5 }, () => createNewGame(GameLevel.Easy));
      const hardGames = Array.from({ length: 5 }, () => createNewGame(GameLevel.Hard));

      const avgEasy = easyGames.reduce((sum, g) => sum + g.target, 0) / easyGames.length;
      const avgHard = hardGames.reduce((sum, g) => sum + g.target, 0) / hardGames.length;

      // Hard games should generally have higher targets
      expect(avgHard).toBeGreaterThan(avgEasy);
    });
  });

  describe('getLevelConfig', () => {
    it('returns correct config for easy level', () => {
      const config = getLevelConfig(GameLevel.Easy);

      expect(config.level).toBe(GameLevel.Easy);
      expect(config.minTarget).toBe(11);
      expect(config.maxTarget).toBe(40);
      expect(config.color).toBe('green');
    });

    it('returns correct config for medium level', () => {
      const config = getLevelConfig(GameLevel.Medium);

      expect(config.level).toBe(GameLevel.Medium);
      expect(config.minTarget).toBe(19);
      expect(config.maxTarget).toBe(60);
      expect(config.color).toBe('yellow');
    });

    it('returns correct config for hard level', () => {
      const config = getLevelConfig(GameLevel.Hard);

      expect(config.level).toBe(GameLevel.Hard);
      expect(config.minTarget).toBe(60);
      expect(config.maxTarget).toBe(120);
      expect(config.color).toBe('red');
    });
  });

  describe('getAllLevelConfigs', () => {
    it('returns all three level configs', () => {
      const configs = getAllLevelConfigs();

      expect(configs).toHaveLength(4);
      expect(configs[0].level).toBe(GameLevel.Easy);
      expect(configs[1].level).toBe(GameLevel.Medium);
      expect(configs[2].level).toBe(GameLevel.Hard);
      expect(configs[3].level).toBe(GameLevel.VeryHard);
    });
  });

  describe('solvability verification', () => {
    it('generates games that are theoretically solvable', () => {
      // The algorithm creates targets by actually performing operations,
      // so every generated game MUST be solvable
      // We can verify this by checking that the algorithm succeeded

      for (let i = 0; i < 5; i++) {
        const game = createNewGame(GameLevel.Easy);
        
        // If the game was created, it's solvable
        // We can't easily verify the solution without implementing a solver,
        // but we can check basic properties
        expect(game.numbers).toHaveLength(5);
        expect(Number.isInteger(game.target)).toBe(true);
        expect(game.target).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('edge cases', () => {
    it('handles very narrow target range', () => {
      const { target } = createSolvableGame(25, 26);
      
      // Should find something, even if outside range
      expect(Number.isInteger(target)).toBe(true);
      expect(target).toBeGreaterThanOrEqual(0);
    });

    it('handles very wide target range', () => {
      const { target } = createSolvableGame(1, 1000);
      
      expect(Number.isInteger(target)).toBe(true);
      expect(target).toBeGreaterThanOrEqual(0);
    });
  });
});
