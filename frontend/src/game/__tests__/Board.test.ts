import { describe, it, expect, beforeEach } from 'vitest';
import { Board, createBoard, checkFiveInARow } from '../Board';
import { CellState, Player } from '../../types/game';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(15);
  });

  describe('初始化', () => {
    it('应该创建指定大小的棋盘', () => {
      expect(board.getSize()).toBe(15);
    });

    it('初始棋盘应该全部为空', () => {
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          expect(board.getCell(row, col)).toBe(CellState.EMPTY);
          expect(board.isEmpty(row, col)).toBe(true);
        }
      }
    });

    it('初始步数应该为0', () => {
      expect(board.getMoveCount()).toBe(0);
      expect(board.getLastMove()).toBeNull();
      expect(board.getMoveHistory()).toEqual([]);
    });
  });

  describe('落子', () => {
    it('黑方可以在空位落子', () => {
      expect(board.placePiece(7, 7, Player.BLACK)).toBe(true);
      expect(board.getCell(7, 7)).toBe(CellState.BLACK);
      expect(board.isEmpty(7, 7)).toBe(false);
    });

    it('白方可以在空位落子', () => {
      expect(board.placePiece(7, 7, Player.WHITE)).toBe(true);
      expect(board.getCell(7, 7)).toBe(CellState.WHITE);
    });

    it('不能在已有棋子的位置落子', () => {
      board.placePiece(7, 7, Player.BLACK);
      expect(board.placePiece(7, 7, Player.WHITE)).toBe(false);
    });

    it('不能在棋盘外落子', () => {
      expect(board.placePiece(-1, 7, Player.BLACK)).toBe(false);
      expect(board.placePiece(7, -1, Player.BLACK)).toBe(false);
      expect(board.placePiece(15, 7, Player.BLACK)).toBe(false);
      expect(board.placePiece(7, 15, Player.BLACK)).toBe(false);
    });

    it('落子后步数应该增加', () => {
      board.placePiece(7, 7, Player.BLACK);
      expect(board.getMoveCount()).toBe(1);
      expect(board.getLastMove()).toEqual({ row: 7, col: 7 });
    });

    it('落子历史应该正确记录', () => {
      board.placePiece(7, 7, Player.BLACK);
      board.placePiece(7, 8, Player.WHITE);
      board.placePiece(8, 7, Player.BLACK);

      const history = board.getMoveHistory();
      expect(history).toHaveLength(3);
      expect(history[0]).toEqual({ row: 7, col: 7 });
      expect(history[1]).toEqual({ row: 7, col: 8 });
      expect(history[2]).toEqual({ row: 8, col: 7 });
    });
  });

  describe('悔棋', () => {
    it('可以悔棋', () => {
      board.placePiece(7, 7, Player.BLACK);
      const undone = board.undo();
      expect(undone).toEqual({ row: 7, col: 7 });
      expect(board.getCell(7, 7)).toBe(CellState.EMPTY);
      expect(board.getMoveCount()).toBe(0);
    });

    it('没有历史记录时悔棋返回null', () => {
      expect(board.undo()).toBeNull();
    });

    it('悔棋后可以继续落子', () => {
      board.placePiece(7, 7, Player.BLACK);
      board.undo();
      expect(board.placePiece(7, 7, Player.WHITE)).toBe(true);
    });
  });

  describe('重置', () => {
    it('重置后棋盘应该清空', () => {
      board.placePiece(7, 7, Player.BLACK);
      board.placePiece(7, 8, Player.WHITE);
      board.reset();

      expect(board.getMoveCount()).toBe(0);
      expect(board.getCell(7, 7)).toBe(CellState.EMPTY);
      expect(board.getCell(7, 8)).toBe(CellState.EMPTY);
    });
  });

  describe('平局检测', () => {
    it('新棋盘不应满', () => {
      expect(board.isFull()).toBe(false);
    });

    it('部分落子不应满', () => {
      for (let i = 0; i < 100; i++) {
        const row = Math.floor(i / 15);
        const col = i % 15;
        board.placePiece(row, col, i % 2 === 0 ? Player.BLACK : Player.WHITE);
      }
      expect(board.isFull()).toBe(false);
    });
  });

  describe('横向五连', () => {
    it('应该检测到横向五连', () => {
      // 黑方横向五连
      for (let col = 0; col < 5; col++) {
        board.placePiece(7, col, Player.BLACK);
      }

      const result = board.checkWin(7, 2);
      expect(result.hasWon).toBe(true);
      expect(result.line).toHaveLength(5);
    });

    it('横向四连不应获胜', () => {
      for (let col = 0; col < 4; col++) {
        board.placePiece(7, col, Player.BLACK);
      }

      const result = board.checkWin(7, 2);
      expect(result.hasWon).toBe(false);
    });

    it('横向六连应该获胜', () => {
      for (let col = 0; col < 6; col++) {
        board.placePiece(7, col, Player.BLACK);
      }

      const result = board.checkWin(7, 2);
      expect(result.hasWon).toBe(true);
      expect(result.line?.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('纵向五连', () => {
    it('应该检测到纵向五连', () => {
      for (let row = 0; row < 5; row++) {
        board.placePiece(row, 7, Player.BLACK);
      }

      const result = board.checkWin(2, 7);
      expect(result.hasWon).toBe(true);
    });

    it('纵向四连不应获胜', () => {
      for (let row = 0; row < 4; row++) {
        board.placePiece(row, 7, Player.BLACK);
      }

      const result = board.checkWin(2, 7);
      expect(result.hasWon).toBe(false);
    });
  });

  describe('主对角线五连（左上到右下）', () => {
    it('应该检测到主对角线五连', () => {
      for (let i = 0; i < 5; i++) {
        board.placePiece(i, i, Player.BLACK);
      }

      const result = board.checkWin(2, 2);
      expect(result.hasWon).toBe(true);
    });

    it('偏移的对角线五连也应该被检测', () => {
      for (let i = 0; i < 5; i++) {
        board.placePiece(5 + i, 3 + i, Player.BLACK);
      }

      const result = board.checkWin(7, 5);
      expect(result.hasWon).toBe(true);
    });
  });

  describe('副对角线五连（右上到左下）', () => {
    it('应该检测到副对角线五连', () => {
      for (let i = 0; i < 5; i++) {
        board.placePiece(i, 4 - i, Player.BLACK);
      }

      const result = board.checkWin(2, 2);
      expect(result.hasWon).toBe(true);
    });

    it('偏移的副对角线五连也应该被检测', () => {
      for (let i = 0; i < 5; i++) {
        board.placePiece(5 + i, 10 - i, Player.BLACK);
      }

      const result = board.checkWin(7, 8);
      expect(result.hasWon).toBe(true);
    });
  });

  describe('检查整个棋盘', () => {
    it('应该能检测出获胜方', () => {
      for (let col = 0; col < 5; col++) {
        board.placePiece(7, col, Player.BLACK);
      }

      const result = board.checkBoardWin();
      expect(result.winner).toBe(Player.BLACK);
      expect(result.line).toHaveLength(5);
    });

    it('没有获胜方时返回null', () => {
      board.placePiece(7, 7, Player.BLACK);
      board.placePiece(7, 8, Player.WHITE);

      const result = board.checkBoardWin();
      expect(result.winner).toBeNull();
    });
  });

  describe('边界情况', () => {
    it('空位不应获胜', () => {
      const result = board.checkWin(7, 7);
      expect(result.hasWon).toBe(false);
    });

    it('在边缘的五连也应该被检测', () => {
      for (let col = 0; col < 5; col++) {
        board.placePiece(0, col, Player.BLACK);
      }

      const result = board.checkWin(0, 2);
      expect(result.hasWon).toBe(true);
    });

    it('在角落的五连也应该被检测', () => {
      // 角落纵向五连
      for (let row = 0; row < 5; row++) {
        board.placePiece(row, 0, Player.BLACK);
      }

      const result = board.checkWin(2, 0);
      expect(result.hasWon).toBe(true);
    });
  });

  describe('复杂场景', () => {
    it('棋盘上的多个连线应该正确识别', () => {
      // 横向五连
      for (let col = 0; col < 5; col++) {
        board.placePiece(7, col, Player.BLACK);
      }
      // 另一个位置的纵向四连
      for (let row = 0; row < 4; row++) {
        board.placePiece(row, 10, Player.BLACK);
      }

      const result = board.checkBoardWin();
      expect(result.winner).toBe(Player.BLACK);
      expect(result.line).toHaveLength(5);
    });

    it('黑白双方都形成连珠时应该正确识别', () => {
      // 黑方五连
      for (let col = 0; col < 5; col++) {
        board.placePiece(7, col, Player.BLACK);
      }
      // 白方五连（在其他位置）
      for (let row = 0; row < 5; row++) {
        board.placePiece(row, 10, Player.WHITE);
      }

      // 先手方（黑方）获胜
      const result = board.checkBoardWin();
      expect(result.winner).toBe(Player.BLACK);
    });
  });
});

describe('createBoard 工厂函数', () => {
  it('应该创建默认15x15棋盘', () => {
    const board = createBoard();
    expect(board.getSize()).toBe(15);
  });

  it('应该能创建指定大小的棋盘', () => {
    const board = createBoard(19);
    expect(board.getSize()).toBe(19);
  });
});

describe('checkFiveInARow 静态方法', () => {
  it('应该检测到五连', () => {
    const grid: CellState[][] = Array(15)
      .fill(null)
      .map(() => Array(15).fill(CellState.EMPTY));

    // 横向五连
    for (let col = 0; col < 5; col++) {
      grid[7][col] = CellState.BLACK;
    }

    expect(checkFiveInARow(grid, 7, 2)).toBe(true);
  });

  it('没有五连时返回false', () => {
    const grid: CellState[][] = Array(15)
      .fill(null)
      .map(() => Array(15).fill(CellState.EMPTY));

    grid[7][7] = CellState.BLACK;

    expect(checkFiveInARow(grid, 7, 7)).toBe(false);
  });
});
