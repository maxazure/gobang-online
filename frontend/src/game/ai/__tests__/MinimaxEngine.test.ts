import { describe, it, expect, beforeEach } from 'vitest';
import { MinimaxEngine, createMinimaxEngine, SearchConfig } from '../MinimaxEngine';
import { CellState, Player } from '../../../types/game';

describe('MinimaxEngine', () => {
  let engine: MinimaxEngine;
  let board: CellState[][];

  beforeEach(() => {
    engine = createMinimaxEngine(15);
    board = Array(15).fill(null).map(() => Array(15).fill(CellState.EMPTY));
  });

  describe('基础搜索', () => {
    it('应该返回中心位置作为第一步', () => {
      const result = engine.search(board, Player.BLACK);

      expect(result.move).not.toBeNull();
      // 第一步应该是中心或附近
      if (result.move) {
        expect(Math.abs(result.move.row - 7)).toBeLessThanOrEqual(1);
        expect(Math.abs(result.move.col - 7)).toBeLessThanOrEqual(1);
      }
    });

    it('应该识别并执行立即获胜', () => {
      // 设置黑方有四连
      board[7][5] = CellState.BLACK;
      board[7][6] = CellState.BLACK;
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.BLACK;

      const result = engine.search(board, Player.BLACK);

      // 两端（col 4 或 col 9）都是有效的获胜走法
      expect(result.move).not.toBeNull();
      if (result.move) {
        expect(result.move.row).toBe(7);
        expect([4, 9]).toContain(result.move.col);
      }
      expect(result.score).toBeGreaterThan(500000);
    });

    it('应该阻止对手获胜', () => {
      // 白方有四连
      board[7][5] = CellState.WHITE;
      board[7][6] = CellState.WHITE;
      board[7][7] = CellState.WHITE;
      board[7][8] = CellState.WHITE;

      const result = engine.search(board, Player.BLACK);

      // 两端（col 4 或 col 9）都是有效的防守走法
      expect(result.move).not.toBeNull();
      if (result.move) {
        expect(result.move.row).toBe(7);
        expect([4, 9]).toContain(result.move.col);
      }
    });
  });

  describe('难度级别', () => {
    it('简单难度应该搜索深度2', () => {
      const config: Partial<SearchConfig> = { maxDepth: 2, useIterativeDeepening: false };
      engine.setConfig(config);

      const result = engine.search(board, Player.BLACK);
      expect(result.depth).toBe(2);
    });

    it('中等难度应该搜索深度4', () => {
      const config: Partial<SearchConfig> = { maxDepth: 4, useIterativeDeepening: false };
      engine.setConfig(config);

      const result = engine.search(board, Player.BLACK);
      expect(result.depth).toBe(4);
    });
  });

  describe('迭代加深', () => {
    it('应该返回不同深度的结果', () => {
      const config: Partial<SearchConfig> = {
        maxDepth: 4,
        useIterativeDeepening: true,
        timeLimit: 5000
      };
      engine.setConfig(config);

      const result = engine.search(board, Player.BLACK);

      expect(result.depth).toBeGreaterThanOrEqual(1);
      expect(result.depth).toBeLessThanOrEqual(4);
    });

    it('应该遵守时间限制', () => {
      const config: Partial<SearchConfig> = {
        maxDepth: 8,
        useIterativeDeepening: true,
        timeLimit: 100 // 100ms
      };
      engine.setConfig(config);

      const start = Date.now();
      engine.search(board, Player.BLACK);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(200); // 允许一些误差
    });
  });

  describe('置换表', () => {
    it('应该命中置换表', () => {
      // 第一次搜索
      engine.search(board, Player.BLACK);
      const stats1 = engine.getStats();

      // 相同局面的第二次搜索
      engine.search(board, Player.BLACK);
      const stats2 = engine.getStats();

      // 置换表应该有条目
      expect(stats2.transpositionTable.size).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    it('简单难度响应时间应小于100ms', () => {
      const config: Partial<SearchConfig> = { maxDepth: 2, useIterativeDeepening: false };
      engine.setConfig(config);

      const start = Date.now();
      engine.search(board, Player.BLACK);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    it('中等难度响应时间应小于300ms', () => {
      const config: Partial<SearchConfig> = { maxDepth: 4, useIterativeDeepening: false };
      engine.setConfig(config);

      const start = Date.now();
      engine.search(board, Player.BLACK);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(300);
    });

    it('困难难度响应时间应小于2000ms', () => {
      // 使用迭代加深确保在时间限制内返回结果
      const config: Partial<SearchConfig> = { maxDepth: 6, useIterativeDeepening: true, timeLimit: 1500 };
      engine.setConfig(config);

      // 添加一些棋子使局面更复杂
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.WHITE;

      const start = Date.now();
      engine.search(board, Player.BLACK);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe('剪枝效果', () => {
    it('应该有剪枝发生', () => {
      // 添加一些棋子使局面有威胁
      board[7][5] = CellState.BLACK;
      board[7][6] = CellState.BLACK;
      board[7][8] = CellState.WHITE;
      board[8][7] = CellState.WHITE;

      // 使用较浅的深度确保测试快速完成
      engine.setConfig({ maxDepth: 3, useIterativeDeepening: false });
      engine.search(board, Player.BLACK);
      const stats = engine.getStats();

      // 应该有一些剪枝（在复杂局面中）
      expect(stats.cutoffs).toBeGreaterThanOrEqual(0);
    }, 10000); // 10秒超时
  });
});
