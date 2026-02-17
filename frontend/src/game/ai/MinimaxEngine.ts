import { CellState, Player, Position } from '../../types/game';
import { Evaluator, createEvaluator, Pattern, PATTERN_SCORES } from './Evaluator';
import { TranspositionTable, TTEntryType, createTranspositionTable } from './TranspositionTable';

/**
 * 搜索配置
 */
export interface SearchConfig {
  maxDepth: number;           // 最大搜索深度
  timeLimit: number;          // 时间限制（毫秒）
  useIterativeDeepening: boolean; // 是否使用迭代加深
  useTranspositionTable: boolean; // 是否使用置换表
}

/**
 * 搜索结果
 */
export interface SearchResult {
  move: Position | null;      // 最佳走法
  score: number;              // 评估分数
  depth: number;              // 搜索深度
  nodesSearched: number;      // 搜索节点数
  timeUsed: number;           // 用时（毫秒）
  cutoffs: number;            // 剪枝次数
}

/**
 * Minimax 引擎
 * 使用 Alpha-Beta 剪枝和迭代加深搜索
 */
export class MinimaxEngine {
  private boardSize: number;
  private evaluator: Evaluator;
  private transpositionTable: TranspositionTable;
  private config: SearchConfig;

  // 搜索状态
  private nodesSearched: number;
  private cutoffs: number;
  private startTime: number;
  private abortSearch: boolean;
  private currentBestMove: Position | null;

  // 评估边界
  private static readonly INFINITY = 10000000;
  private static readonly WIN_SCORE = 1000000;
  private static readonly LOSE_SCORE = -1000000;

  constructor(boardSize: number = 15, config?: Partial<SearchConfig>) {
    this.boardSize = boardSize;
    this.evaluator = createEvaluator(boardSize);
    this.transpositionTable = createTranspositionTable(100000, boardSize);
    this.config = {
      maxDepth: 6,
      timeLimit: 5000,
      useIterativeDeepening: true,
      useTranspositionTable: true,
      ...config,
    };

    // 初始化搜索状态
    this.nodesSearched = 0;
    this.cutoffs = 0;
    this.startTime = 0;
    this.abortSearch = false;
    this.currentBestMove = null;
  }

  /**
   * 搜索最佳走法
   */
  search(board: CellState[][], player: Player): SearchResult {
    this.startTime = Date.now();
    this.nodesSearched = 0;
    this.cutoffs = 0;
    this.abortSearch = false;
    this.currentBestMove = null;

    // 检查是否可以立即获胜
    const immediateWin = this.findImmediateWin(board, player);
    if (immediateWin) {
      return {
        move: immediateWin,
        score: MinimaxEngine.WIN_SCORE,
        depth: 1,
        nodesSearched: 1,
        timeUsed: Date.now() - this.startTime,
        cutoffs: 0,
      };
    }

    // 检查是否需要防守
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
    const mustDefend = this.findImmediateWin(board, opponent);
    if (mustDefend) {
      return {
        move: mustDefend,
        score: MinimaxEngine.WIN_SCORE - 1,
        depth: 1,
        nodesSearched: 1,
        timeUsed: Date.now() - this.startTime,
        cutoffs: 0,
      };
    }

    let result: SearchResult;

    if (this.config.useIterativeDeepening) {
      result = this.iterativeDeepeningSearch(board, player);
    } else {
      result = this.minimaxSearch(board, player, this.config.maxDepth);
    }

    return result;
  }

  /**
   * 迭代加深搜索
   * 从深度 1 开始逐步加深，直到时间限制
   */
  private iterativeDeepeningSearch(board: CellState[][], player: Player): SearchResult {
    let bestResult: SearchResult = {
      move: null,
      score: 0,
      depth: 0,
      nodesSearched: 0,
      timeUsed: 0,
      cutoffs: 0,
    };

    for (let depth = 1; depth <= this.config.maxDepth; depth++) {
      // 检查时间限制
      if (Date.now() - this.startTime >= this.config.timeLimit) {
        break;
      }

      this.transpositionTable.incrementAge();

      const result = this.minimaxSearch(board, player, depth);

      // 如果搜索被中止，使用上次的结果
      if (this.abortSearch) {
        break;
      }

      bestResult = result;
      bestResult.depth = depth;

      // 如果找到必胜/必败走法，提前结束
      if (result.score >= MinimaxEngine.WIN_SCORE || result.score <= MinimaxEngine.LOSE_SCORE) {
        break;
      }
    }

    return bestResult;
  }

  /**
   * Minimax 搜索（带 Alpha-Beta 剪枝）
   */
  private minimaxSearch(
    board: CellState[][],
    player: Player,
    depth: number
  ): SearchResult {
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

    // 获取候选走法
    const moves = this.getSortedMoves(board, player);

    if (moves.length === 0) {
      return {
        move: null,
        score: 0,
        depth,
        nodesSearched: this.nodesSearched,
        timeUsed: Date.now() - this.startTime,
        cutoffs: this.cutoffs,
      };
    }

    let bestMove = moves[0];
    let bestScore = -MinimaxEngine.INFINITY;
    const alpha = -MinimaxEngine.INFINITY;
    const beta = MinimaxEngine.INFINITY;

    for (const move of moves) {
      // 检查时间限制
      if (Date.now() - this.startTime >= this.config.timeLimit) {
        this.abortSearch = true;
        break;
      }

      // 执行走法
      board[move.row][move.col] = player as unknown as CellState;

      // 评估
      const score = this.minimize(board, player, opponent, depth - 1, alpha, beta);

      // 撤销走法
      board[move.row][move.col] = CellState.EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
        this.currentBestMove = move;
      }
    }

    return {
      move: bestMove,
      score: bestScore,
      depth,
      nodesSearched: this.nodesSearched,
      timeUsed: Date.now() - this.startTime,
      cutoffs: this.cutoffs,
    };
  }

  /**
   * 极大化层（Max层）
   */
  private maximize(
    board: CellState[][],
    player: Player,
    opponent: Player,
    depth: number,
    alpha: number,
    beta: number
  ): number {
    this.nodesSearched++;

    // 检查时间限制
    if (Date.now() - this.startTime >= this.config.timeLimit) {
      this.abortSearch = true;
      return this.evaluator.evaluate(board, player);
    }

    // 检查置换表
    if (this.config.useTranspositionTable) {
      const hash = this.transpositionTable.computeHash(board);
      const entry = this.transpositionTable.lookup(hash, depth);
      if (entry) {
        if (entry.type === TTEntryType.EXACT) return entry.score;
        if (entry.type === TTEntryType.LOWER_BOUND && entry.score >= beta) return entry.score;
        if (entry.type === TTEntryType.UPPER_BOUND && entry.score <= alpha) return entry.score;
      }
    }

    // 终止条件
    if (depth === 0) {
      return this.evaluator.evaluate(board, player);
    }

    // 检查终局
    const gameOver = this.checkGameOver(board);
    if (gameOver.isOver) {
      if (gameOver.winner === player) return MinimaxEngine.WIN_SCORE;
      if (gameOver.winner === opponent) return MinimaxEngine.LOSE_SCORE;
      return 0;
    }

    let maxScore = -MinimaxEngine.INFINITY;
    const moves = this.getSortedMoves(board, player, depth <= 2 ? 40 : 20);

    for (const move of moves) {
      board[move.row][move.col] = player as unknown as CellState;
      const score = this.minimize(board, player, opponent, depth - 1, alpha, beta);
      board[move.row][move.col] = CellState.EMPTY;

      maxScore = Math.max(maxScore, score);

      // Alpha-Beta 剪枝
      if (maxScore >= beta) {
        this.cutoffs++;
        break;
      }

      alpha = Math.max(alpha, maxScore);
    }

    // 存储到置换表
    if (this.config.useTranspositionTable) {
      const hash = this.transpositionTable.computeHash(board);
      const type = maxScore <= alpha ? TTEntryType.UPPER_BOUND : TTEntryType.EXACT;
      this.transpositionTable.store(hash, depth, maxScore, type);
    }

    return maxScore;
  }

  /**
   * 极小化层（Min层）
   */
  private minimize(
    board: CellState[][],
    player: Player,
    opponent: Player,
    depth: number,
    alpha: number,
    beta: number
  ): number {
    this.nodesSearched++;

    // 检查时间限制
    if (Date.now() - this.startTime >= this.config.timeLimit) {
      this.abortSearch = true;
      return this.evaluator.evaluate(board, player);
    }

    // 检查置换表
    if (this.config.useTranspositionTable) {
      const hash = this.transpositionTable.computeHash(board);
      const entry = this.transpositionTable.lookup(hash, depth);
      if (entry) {
        if (entry.type === TTEntryType.EXACT) return entry.score;
        if (entry.type === TTEntryType.LOWER_BOUND && entry.score >= beta) return entry.score;
        if (entry.type === TTEntryType.UPPER_BOUND && entry.score <= alpha) return entry.score;
      }
    }

    // 终止条件
    if (depth === 0) {
      return this.evaluator.evaluate(board, player);
    }

    // 检查终局
    const gameOver = this.checkGameOver(board);
    if (gameOver.isOver) {
      if (gameOver.winner === player) return MinimaxEngine.WIN_SCORE;
      if (gameOver.winner === opponent) return MinimaxEngine.LOSE_SCORE;
      return 0;
    }

    let minScore = MinimaxEngine.INFINITY;
    const moves = this.getSortedMoves(board, opponent, depth <= 2 ? 40 : 20);

    for (const move of moves) {
      board[move.row][move.col] = opponent as unknown as CellState;
      const score = this.maximize(board, player, opponent, depth - 1, alpha, beta);
      board[move.row][move.col] = CellState.EMPTY;

      minScore = Math.min(minScore, score);

      // Alpha-Beta 剪枝
      if (minScore <= alpha) {
        this.cutoffs++;
        break;
      }

      beta = Math.min(beta, minScore);
    }

    // 存储到置换表
    if (this.config.useTranspositionTable) {
      const hash = this.transpositionTable.computeHash(board);
      const type = minScore >= beta ? TTEntryType.LOWER_BOUND : TTEntryType.EXACT;
      this.transpositionTable.store(hash, depth, minScore, type);
    }

    return minScore;
  }

  /**
   * 获取排序后的候选走法
   * 使用启发式排序提高剪枝效率
   */
  private getSortedMoves(board: CellState[][], player: Player, maxMoves: number = 20): Position[] {
    const moves = this.evaluator.getCandidateMoves(board, maxMoves);
    const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

    // 评估每个走法并排序
    const scoredMoves = moves.map(move => {
      board[move.row][move.col] = player as unknown as CellState;
      const score = this.evaluator.evaluate(board, player);
      board[move.row][move.col] = CellState.EMPTY;
      return { move, score };
    });

    // 按分数降序排序（好的走法优先）
    scoredMoves.sort((a, b) => b.score - a.score);

    return scoredMoves.map(sm => sm.move);
  }

  /**
   * 查找立即获胜的走法
   */
  private findImmediateWin(board: CellState[][], player: Player): Position | null {
    const moves = this.evaluator.getCandidateMoves(board, 40);

    for (const move of moves) {
      board[move.row][move.col] = player as unknown as CellState;
      const isWin = this.checkWin(board, move.row, move.col, player);
      board[move.row][move.col] = CellState.EMPTY;

      if (isWin) return move;
    }

    return null;
  }

  /**
   * 检查指定位置是否获胜
   */
  private checkWin(board: CellState[][], row: number, col: number, player: Player): boolean {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dr, dc] of directions) {
      let count = 1;

      // 正向
      let r = row + dr;
      let c = col + dc;
      while (
        r >= 0 && r < this.boardSize &&
        c >= 0 && c < this.boardSize &&
        board[r][c] === (player as unknown as CellState)
      ) {
        count++;
        r += dr;
        c += dc;
      }

      // 反向
      r = row - dr;
      c = col - dc;
      while (
        r >= 0 && r < this.boardSize &&
        c >= 0 && c < this.boardSize &&
        board[r][c] === (player as unknown as CellState)
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
   * 检查游戏是否结束
   */
  private checkGameOver(board: CellState[][]): { isOver: boolean; winner: Player | null } {
    // 检查是否有五连
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cell = board[row][col];
        if (cell === CellState.EMPTY) continue;

        const player = cell === CellState.BLACK ? Player.BLACK : Player.WHITE;
        if (this.checkWin(board, row, col, player)) {
          return { isOver: true, winner: player };
        }
      }
    }

    // 检查是否满盘
    const isFull = board.every(row => row.every(cell => cell !== CellState.EMPTY));
    if (isFull) {
      return { isOver: true, winner: null };
    }

    return { isOver: false, winner: null };
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    nodesSearched: number;
    cutoffs: number;
    transpositionTable: ReturnType<TranspositionTable['getStats']>;
  } {
    return {
      nodesSearched: this.nodesSearched,
      cutoffs: this.cutoffs,
      transpositionTable: this.transpositionTable.getStats(),
    };
  }
}

/**
 * 创建 Minimax 引擎实例
 */
export function createMinimaxEngine(boardSize?: number, config?: Partial<SearchConfig>): MinimaxEngine {
  return new MinimaxEngine(boardSize, config);
}
