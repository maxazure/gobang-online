import openingsData from '../../data/openings.json';
import { CellState, Player, Position } from '../../types/game';

/**
 * 开局数据接口
 */
interface OpeningData {
  name: string;
  description: string;
  moves: { row: number; col: number; player: number }[];
  tags: string[];
}

/**
 * 推荐开局
 */
interface RecommendedOpening {
  name: string;
  priority: number;
}

/**
 * 开局库
 * 管理和查询开局定式
 */
export class OpeningBook {
  private openings: OpeningData[];
  private recommended: RecommendedOpening[];

  constructor() {
    this.openings = openingsData.openings as OpeningData[];
    this.recommended = openingsData.recommended_openings as RecommendedOpening[];
  }

  /**
   * 根据当前局面查找推荐走法
   * @param board 当前棋盘状态
   * @param moveCount 已走步数
   * @returns 推荐走法，如果没有则返回 null
   */
  findMove(board: CellState[][], moveCount: number): Position | null {
    // 只在前10手使用开局库
    if (moveCount >= 10) return null;

    // 构建局面特征
    const signature = this.getBoardSignature(board);

    // 查找匹配的开局
    for (const opening of this.openings) {
      if (this.matchesOpening(signature, opening, moveCount)) {
        // 返回下一手
        const nextMove = opening.moves[moveCount];
        if (nextMove) {
          return { row: nextMove.row, col: nextMove.col };
        }
      }
    }

    return null;
  }

  /**
   * 随机获取一个开局（用于AI多样化）
   * @returns 开局名称和推荐走法
   */
  getRandomOpening(): { name: string; moves: Position[] } | null {
    if (this.openings.length === 0) return null;

    const opening = this.openings[Math.floor(Math.random() * this.openings.length)];
    return {
      name: opening.name,
      moves: opening.moves.map(m => ({ row: m.row, col: m.col })),
    };
  }

  /**
   * 获取推荐开局列表
   */
  getRecommendedOpenings(): { name: string; priority: number }[] {
    return this.recommended;
  }

  /**
   * 获取所有开局
   */
  getAllOpenings(): { name: string; description: string; tags: string[] }[] {
    return this.openings.map(o => ({
      name: o.name,
      description: o.description,
      tags: o.tags,
    }));
  }

  /**
   * 获取开局详情
   */
  getOpening(name: string): OpeningData | null {
    return this.openings.find(o => o.name === name) || null;
  }

  /**
   * 获取局面特征（用于匹配）
   */
  private getBoardSignature(board: CellState[][]): string {
    const occupied: string[] = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] !== CellState.EMPTY) {
          occupied.push(`${row},${col},${board[row][col]}`);
        }
      }
    }
    return occupied.sort().join(';');
  }

  /**
   * 检查是否匹配开局
   */
  private matchesOpening(
    signature: string,
    opening: OpeningData,
    moveCount: number
  ): boolean {
    // 构建开局到当前步数的局面
    const expectedOccupied: string[] = [];
    for (let i = 0; i < Math.min(moveCount, opening.moves.length); i++) {
      const move = opening.moves[i];
      expectedOccupied.push(`${move.row},${move.col},${move.player}`);
    }

    const expectedSignature = expectedOccupied.sort().join(';');
    return signature === expectedSignature;
  }
}

/**
 * 创建开局库实例
 */
export function createOpeningBook(): OpeningBook {
  return new OpeningBook();
}
