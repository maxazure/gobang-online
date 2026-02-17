import { CellState, Player, Position } from '../../types/game';

/**
 * 棋型定义
 * 按照威胁程度从高到低排序
 */
export enum Pattern {
  FIVE = 'FIVE',           // 五连（胜）
  OPEN_FOUR = 'OPEN_FOUR', // 活四（必胜）
  FOUR = 'FOUR',           // 冲四
  OPEN_THREE = 'OPEN_THREE', // 活三
  THREE = 'THREE',         // 眠三
  OPEN_TWO = 'OPEN_TWO',   // 活二
  TWO = 'TWO',             // 眠二
  NONE = 'NONE',           // 无
}

/**
 * 棋型评分表
 * 可根据需要调整权重
 */
export const PATTERN_SCORES: Record<Pattern, number> = {
  [Pattern.FIVE]: 1000000,       // 五连：直接获胜
  [Pattern.OPEN_FOUR]: 100000,   // 活四：必胜
  [Pattern.FOUR]: 10000,         // 冲四：威胁很大
  [Pattern.OPEN_THREE]: 5000,    // 活三：强威胁
  [Pattern.THREE]: 500,          // 眠三
  [Pattern.OPEN_TWO]: 200,       // 活二
  [Pattern.TWO]: 50,             // 眠二
  [Pattern.NONE]: 0,             // 无
};

/**
 * 方向定义
 */
const DIRECTIONS = [
  { dr: 0, dc: 1, name: 'horizontal' },   // 横向
  { dr: 1, dc: 0, name: 'vertical' },     // 纵向
  { dr: 1, dc: 1, name: 'diagonal1' },    // 主对角线
  { dr: 1, dc: -1, name: 'diagonal2' },   // 副对角线
] as const;

/**
 * 棋局评估器
 * 评估当前局面对指定玩家的有利程度
 */
export class Evaluator {
  private boardSize: number;

  constructor(boardSize: number = 15) {
    this.boardSize = boardSize;
  }

  /**
   * 评估整个棋盘
   * @param board 棋盘状态
   * @param player 要评估的玩家
   * @returns 分数（正数表示有利，负数表示不利）
   */
  evaluate(board: CellState[][], player: Player): number {
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    let score = 0;

    // 遍历棋盘所有位置
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = board[row][col];
        if (cell === CellState.EMPTY) continue;

        // 评估四个方向
        for (const { dr, dc } of DIRECTIONS) {
          // 只评估每个连线的起点（避免重复计算）
          if (!this.isLineStart(board, row, col, dr, dc)) continue;

          const pattern = this.identifyPattern(board, row, col, dr, dc);
          const patternScore = PATTERN_SCORES[pattern];

          if (cell === player) {
            score += patternScore;
          } else {
            score -= patternScore;
          }
        }
      }
    }

    // 位置权重：中心位置更有价值
    score += this.evaluatePosition(board, player);

    return score;
  }

  /**
   * 检查是否为连线的起点
   * 避免同一线被重复计算
   */
  private isLineStart(
    board: CellState[][],
    row: number,
    col: number,
    dr: number,
    dc: number
  ): boolean {
    const prevRow = row - dr;
    const prevCol = col - dc;

    // 前一个位置超出边界或为空或颜色不同
    if (
      prevRow < 0 ||
      prevRow >= this.boardSize ||
      prevCol < 0 ||
      prevCol >= this.boardSize
    ) {
      return true;
    }

    return board[prevRow][prevCol] !== board[row][col];
  }

  /**
   * 识别指定位置的棋型
   */
  private identifyPattern(
    board: CellState[][],
    row: number,
    col: number,
    dr: number,
    dc: number
  ): Pattern {
    const player = board[row][col];
    if (player === CellState.EMPTY) return Pattern.NONE;

    // 获取连线信息
    const line = this.getLineInfo(board, row, col, dr, dc);

    // 五连
    if (line.count >= 5) return Pattern.FIVE;

    // 分析两端的情况
    const leftEmpty = line.leftEmpty;
    const rightEmpty = line.rightEmpty;
    const openEnds = (leftEmpty ? 1 : 0) + (rightEmpty ? 1 : 0);

    // 根据连子数和空位数判断棋型
    if (line.count === 4) {
      if (openEnds === 2) return Pattern.OPEN_FOUR;
      if (openEnds === 1) return Pattern.FOUR;
    }

    if (line.count === 3) {
      if (openEnds === 2) return Pattern.OPEN_THREE;
      if (openEnds === 1) return Pattern.THREE;
    }

    if (line.count === 2) {
      if (openEnds === 2) return Pattern.OPEN_TWO;
      if (openEnds === 1) return Pattern.TWO;
    }

    return Pattern.NONE;
  }

  /**
   * 获取连线信息
   */
  private getLineInfo(
    board: CellState[][],
    row: number,
    col: number,
    dr: number,
    dc: number
  ): {
    count: number;
    leftEmpty: boolean;
    rightEmpty: boolean;
  } {
    const player = board[row][col];
    let count = 1;

    // 正向搜索
    let r = row + dr;
    let c = col + dc;
    while (
      r >= 0 &&
      r < this.boardSize &&
      c >= 0 &&
      c < this.boardSize &&
      board[r][c] === player
    ) {
      count++;
      r += dr;
      c += dc;
    }
    const rightEmpty =
      r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && board[r][c] === CellState.EMPTY;

    // 反向搜索
    r = row - dr;
    c = col - dc;
    while (
      r >= 0 &&
      r < this.boardSize &&
      c >= 0 &&
      c < this.boardSize &&
      board[r][c] === player
    ) {
      count++;
      r -= dr;
      c -= dc;
    }
    const leftEmpty =
      r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && board[r][c] === CellState.EMPTY;

    return { count, leftEmpty, rightEmpty };
  }

  /**
   * 评估位置权重（中心优势）
   */
  private evaluatePosition(board: CellState[][], player: Player): number {
    let score = 0;
    const center = Math.floor(this.boardSize / 2);

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = board[row][col];
        if (cell === CellState.EMPTY) continue;

        // 计算到中心的距离
        const distance = Math.abs(row - center) + Math.abs(col - center);
        const positionValue = Math.max(0, 10 - distance);

        if (cell === player) {
          score += positionValue;
        } else {
          score -= positionValue;
        }
      }
    }

    return score;
  }

  /**
   * 快速评估：检查是否有立即获胜或必须防守的位置
   * @returns 高分值如果当前玩家可以获胜，负值如果对手可以获胜
   */
  evaluateUrgent(board: CellState[][], player: Player): number {
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

    // 检查自己是否可以直接获胜
    if (this.hasWinningMove(board, player)) {
      return 500000;
    }

    // 检查对手是否有必须防守的位置
    if (this.hasWinningMove(board, opponent)) {
      return -500000;
    }

    // 检查是否有活四（必胜局面）
    const myOpenFour = this.countPatterns(board, player, Pattern.OPEN_FOUR);
    const opponentOpenFour = this.countPatterns(board, opponent, Pattern.OPEN_FOUR);

    return myOpenFour * 50000 - opponentOpenFour * 40000;
  }

  /**
   * 检查是否有立即获胜的走法
   */
  private hasWinningMove(board: CellState[][], player: Player): boolean {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] !== CellState.EMPTY) continue;

        // 模拟落子
        board[row][col] = player as unknown as CellState;
        const hasWin = this.checkWinAt(board, row, col, player);
        board[row][col] = CellState.EMPTY;

        if (hasWin) return true;
      }
    }
    return false;
  }

  /**
   * 检查指定位置是否形成五连
   */
  private checkWinAt(board: CellState[][], row: number, col: number, player: Player): boolean {
    const cellValue = player as unknown as CellState;

    for (const { dr, dc } of DIRECTIONS) {
      let count = 1;

      // 正向
      let r = row + dr;
      let c = col + dc;
      while (
        r >= 0 &&
        r < this.boardSize &&
        c >= 0 &&
        c < this.boardSize &&
        board[r][c] === cellValue
      ) {
        count++;
        r += dr;
        c += dc;
      }

      // 反向
      r = row - dr;
      c = col - dc;
      while (
        r >= 0 &&
        r < this.boardSize &&
        c >= 0 &&
        c < this.boardSize &&
        board[r][c] === cellValue
      ) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 5) return true;
    }

    return false;
  }

  /**
   * 统计特定棋型的数量
   */
  private countPatterns(
    board: CellState[][],
    player: Player,
    pattern: Pattern
  ): number {
    let count = 0;
    const cellValue = player as unknown as CellState;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] !== cellValue) continue;

        for (const { dr, dc } of DIRECTIONS) {
          if (!this.isLineStart(board, row, col, dr, dc)) continue;

          const identified = this.identifyPattern(board, row, col, dr, dc);
          if (identified === pattern) count++;
        }
      }
    }

    return count;
  }

  /**
   * 获取候选落子位置（减少搜索空间）
   */
  getCandidateMoves(board: CellState[][], maxCandidates: number = 20): Position[] {
    const candidates: Position[] = [];
    const range = 2; // 搜索已有棋子周围2格的范围

    // 找出所有已有棋子的位置
    const occupiedPositions: Position[] = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] !== CellState.EMPTY) {
          occupiedPositions.push({ row, col });
        }
      }
    }

    // 空棋盘时，返回中心位置
    if (occupiedPositions.length === 0) {
      const center = Math.floor(this.boardSize / 2);
      return [{ row: center, col: center }];
    }

    // 收集候选位置（已有棋子周围的空位）并评分
    const candidateScores = new Map<string, number>();
    for (const { row, col } of occupiedPositions) {
      for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
          const newRow = row + dr;
          const newCol = col + dc;

          if (
            newRow >= 0 &&
            newRow < this.boardSize &&
            newCol >= 0 &&
            newCol < this.boardSize &&
            board[newRow][newCol] === CellState.EMPTY
          ) {
            const key = `${newRow},${newCol}`;
            // 简单的启发式：离中心越近，分数越高
            const center = this.boardSize / 2;
            const distToCenter = Math.abs(newRow - center) + Math.abs(newCol - center);
            const score = 100 - distToCenter;
            candidateScores.set(key, (candidateScores.get(key) || 0) + score);
          }
        }
      }
    }

    // 按分数排序并限制数量
    const sorted = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCandidates);

    // 转换为位置数组
    for (const [key] of sorted) {
      const [row, col] = key.split(',').map(Number);
      candidates.push({ row, col });
    }

    return candidates;
  }
}

/**
 * 创建评估器实例
 */
export function createEvaluator(boardSize?: number): Evaluator {
  return new Evaluator(boardSize);
}
