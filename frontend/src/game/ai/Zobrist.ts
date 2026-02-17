import { CellState } from '../../types/game';

/**
 * Zobrist 哈希实现
 * 用于置换表，快速计算棋盘状态的哈希值
 */
export class Zobrist {
  private boardSize: number;
  private table: Map<string, bigint>;
  private initialized: boolean;

  constructor(boardSize: number = 15) {
    this.boardSize = boardSize;
    this.table = new Map();
    this.initialized = false;
    this.initTable();
  }

  /**
   * 初始化随机数表
   * 每个位置、每种状态对应一个随机数
   */
  private initTable(): void {
    if (this.initialized) return;

    // 为每个位置的每种状态生成随机哈希值
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        // EMPTY 状态
        this.table.set(this.key(row, col, CellState.EMPTY), this.randomBigInt());
        // BLACK 状态
        this.table.set(this.key(row, col, CellState.BLACK), this.randomBigInt());
        // WHITE 状态
        this.table.set(this.key(row, col, CellState.WHITE), this.randomBigInt());
      }
    }

    this.initialized = true;
  }

  /**
   * 生成 64 位随机数
   */
  private randomBigInt(): bigint {
    // 使用两个 32 位随机数组合成 64 位
    const high = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    const low = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    return (high << 32n) | low;
  }

  /**
   * 生成哈希键
   */
  private key(row: number, col: number, state: CellState): string {
    return `${row},${col},${state}`;
  }

  /**
   * 计算棋盘的完整哈希值
   */
  hash(board: CellState[][]): bigint {
    let hashValue = 0n;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const state = board[row][col];
        const key = this.key(row, col, state);
        const value = this.table.get(key);
        if (value !== undefined) {
          hashValue ^= value;
        }
      }
    }

    return hashValue;
  }

  /**
   * 增量更新哈希值
   * 在已有哈希值基础上更新一个位置的变化
   * @param currentHash 当前哈希值
   * @param row 行
   * @param col 列
   * @param oldState 旧状态
   * @param newState 新状态
   */
  updateHash(
    currentHash: bigint,
    row: number,
    col: number,
    oldState: CellState,
    newState: CellState
  ): bigint {
    // XOR 掉旧状态
    const oldKey = this.key(row, col, oldState);
    const oldValue = this.table.get(oldKey);
    if (oldValue !== undefined) {
      currentHash ^= oldValue;
    }

    // XOR 上新状态
    const newKey = this.key(row, col, newState);
    const newValue = this.table.get(newKey);
    if (newValue !== undefined) {
      currentHash ^= newValue;
    }

    return currentHash;
  }

  /**
   * 将哈希值转换为字符串（用于 Map 键）
   */
  static hashToString(hash: bigint): string {
    return hash.toString(36);
  }
}

/**
 * 创建 Zobrist 哈希实例
 */
export function createZobrist(boardSize?: number): Zobrist {
  return new Zobrist(boardSize);
}
