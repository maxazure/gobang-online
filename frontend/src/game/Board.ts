import { CellState, Player, Position, BoardState, GameConfig } from '../types/game';

/**
 * 五子棋棋盘类
 * 管理棋盘状态、落子、胜负判定等核心逻辑
 */
export class Board {
  private grid: CellState[][];
  private readonly size: number;
  private moveHistory: Position[];

  constructor(size: number = 15) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.moveHistory = [];
  }

  /**
   * 创建空棋盘
   */
  private createEmptyGrid(): CellState[][] {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(CellState.EMPTY));
  }

  /**
   * 重置棋盘
   */
  reset(): void {
    this.grid = this.createEmptyGrid();
    this.moveHistory = [];
  }

  /**
   * 获取棋盘大小
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取指定位置的格子状态
   */
  getCell(row: number, col: number): CellState {
    if (!this.isValidPosition(row, col)) {
      throw new Error(`Invalid position: (${row}, ${col})`);
    }
    return this.grid[row][col];
  }

  /**
   * 获取整个棋盘状态
   */
  getGrid(): CellState[][] {
    return this.grid.map(row => [...row]);
  }

  /**
   * 验证位置是否在棋盘范围内
   */
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * 检查位置是否为空
   */
  isEmpty(row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) return false;
    return this.grid[row][col] === CellState.EMPTY;
  }

  /**
   * 落子
   * @returns 是否成功
   */
  placePiece(row: number, col: number, player: Player): boolean {
    if (!this.isEmpty(row, col)) {
      return false;
    }

    this.grid[row][col] = player === Player.BLACK ? CellState.BLACK : CellState.WHITE;
    this.moveHistory.push({ row, col });
    return true;
  }

  /**
   * 悔棋（撤销最后一步）
   * @returns 被撤销的位置，如果没有历史记录则返回 null
   */
  undo(): Position | null {
    const lastMove = this.moveHistory.pop();
    if (!lastMove) return null;

    this.grid[lastMove.row][lastMove.col] = CellState.EMPTY;
    return lastMove;
  }

  /**
   * 获取落子历史
   */
  getMoveHistory(): Position[] {
    return [...this.moveHistory];
  }

  /**
   * 获取当前步数
   */
  getMoveCount(): number {
    return this.moveHistory.length;
  }

  /**
   * 获取最后一步位置
   */
  getLastMove(): Position | null {
    if (this.moveHistory.length === 0) return null;
    return this.moveHistory[this.moveHistory.length - 1];
  }

  /**
   * 检查棋盘是否已满
   */
  isFull(): boolean {
    return this.moveHistory.length >= this.size * this.size;
  }

  /**
   * 检查指定位置是否形成五连
   * @returns 获胜连线信息，如果没有则返回 null
   */
  checkWin(row: number, col: number): { hasWon: boolean; line?: Position[] } {
    const player = this.grid[row][col];
    if (player === CellState.EMPTY) {
      return { hasWon: false };
    }

    const directions = [
      { dr: 0, dc: 1, name: 'horizontal' },    // 横向
      { dr: 1, dc: 0, name: 'vertical' },      // 纵向
      { dr: 1, dc: 1, name: 'diagonal1' },     // 主对角线
      { dr: 1, dc: -1, name: 'diagonal2' },    // 副对角线
    ];

    for (const { dr, dc } of directions) {
      const line = this.getLineInDirection(row, col, dr, dc, player);
      if (line.length >= 5) {
        return { hasWon: true, line };
      }
    }

    return { hasWon: false };
  }

  /**
   * 获取指定方向上连续的同色棋子
   */
  private getLineInDirection(
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: CellState
  ): Position[] {
    const line: Position[] = [{ row, col }];

    // 正向搜索
    let r = row + dr;
    let c = col + dc;
    while (this.isValidPosition(r, c) && this.grid[r][c] === player) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // 反向搜索
    r = row - dr;
    c = col - dc;
    while (this.isValidPosition(r, c) && this.grid[r][c] === player) {
      line.unshift({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    return line;
  }

  /**
   * 检查整个棋盘是否有获胜方
   * @returns 获胜方和连线，如果没有则返回 null
   */
  checkBoardWin(): { winner: Player | null; line?: Position[] } {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] !== CellState.EMPTY) {
          const result = this.checkWin(row, col);
          if (result.hasWon && result.line) {
            const winner = this.grid[row][col] === CellState.BLACK ? Player.BLACK : Player.WHITE;
            return { winner, line: result.line };
          }
        }
      }
    }
    return { winner: null };
  }

  /**
   * 转换为简单数组表示（用于序列化）
   */
  toArray(): number[][] {
    return this.grid.map(row => row.map(cell => cell as number));
  }

  /**
   * 从数组恢复棋盘状态
   */
  fromArray(array: number[][]): void {
    if (array.length !== this.size || array[0].length !== this.size) {
      throw new Error('Invalid board array size');
    }
    this.grid = array.map(row => row.map(cell => cell as CellState));
  }

  /**
   * 克隆棋盘
   */
  clone(): Board {
    const newBoard = new Board(this.size);
    newBoard.grid = this.getGrid();
    newBoard.moveHistory = [...this.moveHistory];
    return newBoard;
  }

  /**
   * 获取棋盘状态对象
   */
  getState(): BoardState {
    return {
      grid: this.getGrid(),
      lastMove: this.getLastMove() || undefined,
      moveCount: this.getMoveCount(),
    };
  }
}

/**
 * 创建棋盘实例的工厂函数
 */
export function createBoard(size: number = 15): Board {
  return new Board(size);
}

/**
 * 检查是否形成五连（静态方法，用于AI评估）
 */
export function checkFiveInARow(
  board: CellState[][],
  row: number,
  col: number
): boolean {
  const size = board.length;
  const player = board[row][col];

  if (player === CellState.EMPTY) return false;

  const directions = [
    [0, 1],   // 横向
    [1, 0],   // 纵向
    [1, 1],   // 主对角线
    [1, -1],  // 副对角线
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // 正向
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    // 反向
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 5) return true;
  }

  return false;
}
