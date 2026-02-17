import { CellState, Player, Position } from '../../types/game';
import { SearchResult } from './MinimaxEngine';
import { AIDifficulty } from '../../config/ai';
import { WorkerMessage, WorkerResponse } from './AIWorker';

/**
 * 搜索进度回调
 */
export type SearchProgressCallback = (progress: {
  depth: number;
  nodes: number;
  time: number;
}) => void;

/**
 * AI 管理器
 * 封装 Web Worker 通信，提供简洁的 AI 调用接口
 */
export class AIManager {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private currentSearch: {
    resolve: (result: SearchResult) => void;
    reject: (error: Error) => void;
    onProgress?: SearchProgressCallback;
  } | null = null;

  constructor() {
    this.initWorker();
  }

  /**
   * 初始化 Web Worker
   */
  private initWorker(): void {
    try {
      // 使用 Vite 的 worker 导入语法
      this.worker = new Worker(new URL('./AIWorker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('AI Worker error:', error);
        this.isReady = false;
      };
    } catch (error) {
      console.error('Failed to initialize AI Worker:', error);
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleMessage(response: WorkerResponse): void {
    switch (response.type) {
      case 'READY':
        this.isReady = true;
        break;

      case 'RESULT':
        if (this.currentSearch) {
          this.currentSearch.resolve(response.result);
          this.currentSearch = null;
        }
        break;

      case 'PROGRESS':
        if (this.currentSearch?.onProgress) {
          this.currentSearch.onProgress({
            depth: response.depth,
            nodes: response.nodes,
            time: response.time,
          });
        }
        break;

      case 'ERROR':
        if (this.currentSearch) {
          this.currentSearch.reject(new Error(response.error));
          this.currentSearch = null;
        }
        break;
    }
  }

  /**
   * 等待 Worker 就绪
   */
  async waitForReady(timeout: number = 5000): Promise<void> {
    if (this.isReady) return;

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 100);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('AI Worker initialization timeout'));
      }, timeout);
    });
  }

  /**
   * 搜索最佳走法
   * @param board 当前棋盘状态
   * @param player AI 玩家
   * @param difficulty 难度级别
   * @param moveCount 已走步数（用于开局库）
   * @param onProgress 进度回调
   * @returns 搜索结果
   */
  async search(
    board: CellState[][],
    player: Player,
    difficulty: AIDifficulty = AIDifficulty.MEDIUM,
    moveCount: number = 0,
    onProgress?: SearchProgressCallback
  ): Promise<SearchResult> {
    if (!this.worker) {
      throw new Error('AI Worker not initialized');
    }

    if (this.currentSearch) {
      throw new Error('Another search is in progress');
    }

    await this.waitForReady();

    return new Promise((resolve, reject) => {
      this.currentSearch = { resolve, reject, onProgress };

      const message: WorkerMessage = {
        type: 'SEARCH',
        board,
        player,
        difficulty,
        moveCount,
      };

      this.worker!.postMessage(message);
    });
  }

  /**
   * 取消当前搜索
   */
  cancel(): void {
    if (this.worker && this.currentSearch) {
      const message: WorkerMessage = { type: 'CANCEL' };
      this.worker.postMessage(message);
      this.currentSearch = null;
    }
  }

  /**
   * 终止 Worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }

  /**
   * 获取是否就绪
   */
  getIsReady(): boolean {
    return this.isReady;
  }
}

/**
 * 创建 AI 管理器实例
 */
export function createAIManager(): AIManager {
  return new AIManager();
}
