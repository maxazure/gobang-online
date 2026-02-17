import { CellState } from '../../types/game';
import { Zobrist } from './Zobrist';

/**
 * 置换表条目类型
 */
export enum TTEntryType {
  EXACT = 'EXACT',       // 精确值
  LOWER_BOUND = 'LOWER', // 下界（至少值这么多）
  UPPER_BOUND = 'UPPER', // 上界（至多值这么多）
}

/**
 * 置换表条目
 */
export interface TTEntry {
  hash: bigint;           // 哈希值
  depth: number;          // 搜索深度
  score: number;          // 评估分数
  type: TTEntryType;      // 条目类型
  bestMove?: { row: number; col: number }; // 最佳走法
  age: number;            // 条目年龄（用于LRU）
}

/**
 * 置换表
 * 缓存已评估的局面，避免重复计算
 */
export class TranspositionTable {
  private table: Map<string, TTEntry>;
  private maxSize: number;      // 最大条目数
  private zobrist: Zobrist;
  private currentAge: number;   // 当前年龄
  private hitCount: number;     // 命中次数
  private missCount: number;    // 未命中次数

  constructor(maxSize: number = 100000, boardSize: number = 15) {
    this.table = new Map();
    this.maxSize = maxSize;
    this.zobrist = new Zobrist(boardSize);
    this.currentAge = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * 计算棋盘哈希
   */
  computeHash(board: CellState[][]): bigint {
    return this.zobrist.hash(board);
  }

  /**
   * 查找条目
   */
  lookup(hash: bigint, depth: number): TTEntry | null {
    const key = this.key(hash);
    const entry = this.table.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // 哈希碰撞检查
    if (entry.hash !== hash) {
      this.missCount++;
      return null;
    }

    // 深度检查：只使用更深或相同深度的结果
    if (entry.depth < depth) {
      this.missCount++;
      return null;
    }

    // 更新访问
    entry.age = this.currentAge;
    this.hitCount++;

    return entry;
  }

  /**
   * 存储条目
   */
  store(hash: bigint, depth: number, score: number, type: TTEntryType, bestMove?: { row: number; col: number }): void {
    // 如果表已满，执行淘汰
    if (this.table.size >= this.maxSize) {
      this.evictLRU();
    }

    const key = this.key(hash);
    const existing = this.table.get(key);

    // 如果已有条目，只保留更深的结果
    if (existing && existing.hash === hash && existing.depth > depth) {
      return;
    }

    const entry: TTEntry = {
      hash,
      depth,
      score,
      type,
      bestMove,
      age: this.currentAge,
    };

    this.table.set(key, entry);
  }

  /**
   * 增加年龄（每轮搜索调用）
   */
  incrementAge(): void {
    this.currentAge++;
  }

  /**
   * 清空置换表
   */
  clear(): void {
    this.table.clear();
    this.currentAge = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    size: number;
    hitRate: number;
    maxSize: number;
  } {
    const total = this.hitCount + this.missCount;
    return {
      size: this.table.size,
      hitRate: total > 0 ? this.hitCount / total : 0,
      maxSize: this.maxSize,
    };
  }

  /**
   * LRU 淘汰策略
   * 移除最旧的条目
   */
  private evictLRU(): void {
    // 找到最旧的条目
    let oldestKey: string | null = null;
    let oldestAge = Infinity;

    for (const [key, entry] of this.table) {
      if (entry.age < oldestAge) {
        oldestAge = entry.age;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.table.delete(oldestKey);
    }
  }

  /**
   * 将哈希转换为字符串键
   */
  private key(hash: bigint): string {
    return Zobrist.hashToString(hash);
  }
}

/**
 * 创建置换表实例
 */
export function createTranspositionTable(maxSize?: number, boardSize?: number): TranspositionTable {
  return new TranspositionTable(maxSize, boardSize);
}
