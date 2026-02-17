import { describe, it, expect, beforeEach } from 'vitest';
import { Evaluator, createEvaluator, Pattern, PATTERN_SCORES } from '../Evaluator';
import { CellState, Player } from '../../../types/game';

describe('Evaluator', () => {
  let evaluator: Evaluator;
  let board: CellState[][];

  beforeEach(() => {
    evaluator = createEvaluator(15);
    // 创建空棋盘
    board = Array(15).fill(null).map(() => Array(15).fill(CellState.EMPTY));
  });

  describe('基础评估', () => {
    it('空棋盘应该返回0分', () => {
      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBe(0);
    });

    it('中心位置应该有更高的权重', () => {
      // 黑方在中心
      board[7][7] = CellState.BLACK;
      const blackScore = evaluator.evaluate(board, Player.BLACK);

      // 重置棋盘
      board = Array(15).fill(null).map(() => Array(15).fill(CellState.EMPTY));
      board[0][0] = CellState.BLACK;
      const cornerScore = evaluator.evaluate(board, Player.BLACK);

      expect(blackScore).toBeGreaterThan(cornerScore);
    });

    it('棋子优势应该反映在分数上', () => {
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.BLACK;

      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('棋型识别', () => {
    it('应该识别活四', () => {
      // 黑方活四
      board[7][5] = CellState.BLACK;
      board[7][6] = CellState.BLACK;
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.BLACK;
      // 两端为空

      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBeGreaterThan(PATTERN_SCORES[Pattern.OPEN_FOUR] / 2);
    });

    it('应该识别冲四', () => {
      // 黑方冲四
      board[7][5] = CellState.BLACK;
      board[7][6] = CellState.BLACK;
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.BLACK;
      // 一端被堵住
      board[7][9] = CellState.WHITE;

      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBeGreaterThan(PATTERN_SCORES[Pattern.FOUR] / 2);
      expect(score).toBeLessThan(PATTERN_SCORES[Pattern.OPEN_FOUR]);
    });

    it('应该识别活三', () => {
      // 黑方活三
      board[7][6] = CellState.BLACK;
      board[7][7] = CellState.BLACK;
      board[7][8] = CellState.BLACK;

      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBeGreaterThan(PATTERN_SCORES[Pattern.OPEN_THREE] / 2);
    });

    it('应该识别五连（胜利）', () => {
      // 黑方五连
      for (let col = 5; col <= 9; col++) {
        board[7][col] = CellState.BLACK;
      }

      const score = evaluator.evaluate(board, Player.BLACK);
      expect(score).toBeGreaterThan(PATTERN_SCORES[Pattern.FIVE] / 2);
    });
  });

  describe('候选走法生成', () => {
    it('空棋盘应该返回中心位置', () => {
      const moves = evaluator.getCandidateMoves(board);
      expect(moves).toHaveLength(1);
      expect(moves[0]).toEqual({ row: 7, col: 7 });
    });

    it('应该返回已有棋子周围的位置', () => {
      board[7][7] = CellState.BLACK;
      const moves = evaluator.getCandidateMoves(board);

      // 应该有多个候选位置（中心周围2格内的空位）
      expect(moves.length).toBeGreaterThan(1);

      // 检查是否包含中心周围的位置
      const hasNeighbor = moves.some(m =>
        Math.abs(m.row - 7) <= 2 && Math.abs(m.col - 7) <= 2
      );
      expect(hasNeighbor).toBe(true);
    });

    it('候选位置不应该包含已有棋子的位置', () => {
      board[7][7] = CellState.BLACK;
      const moves = evaluator.getCandidateMoves(board);

      const hasOccupied = moves.some(m => m.row === 7 && m.col === 7);
      expect(hasOccupied).toBe(false);
    });
  });

  describe('紧急评估', () => {
    it('应该识别立即获胜的机会', () => {
      // 黑方已经有四连，下一手可以获胜
      for (let col = 5; col <= 8; col++) {
        board[7][col] = CellState.BLACK;
      }
      board[7][9] = CellState.EMPTY;

      const urgentScore = evaluator.evaluateUrgent(board, Player.BLACK);
      expect(urgentScore).toBeGreaterThan(0);
    });

    it('应该识别对手的必胜局面', () => {
      // 白方有四连
      for (let col = 5; col <= 8; col++) {
        board[7][col] = CellState.WHITE;
      }

      const urgentScore = evaluator.evaluateUrgent(board, Player.BLACK);
      expect(urgentScore).toBeLessThan(0);
    });
  });

  describe('性能', () => {
    it('评估空棋盘应该很快', () => {
      const start = performance.now();
      evaluator.evaluate(board, Player.BLACK);
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // 10ms
    });

    it('生成候选走法应该很快', () => {
      board[7][7] = CellState.BLACK;
      board[8][8] = CellState.WHITE;

      const start = performance.now();
      evaluator.getCandidateMoves(board);
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // 5ms
    });
  });
});
