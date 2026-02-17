import { CellState, Player, Position } from '../../types/game';
import { MinimaxEngine, SearchResult } from './MinimaxEngine';
import { OpeningBook } from './OpeningBook';
import { AIDifficulty, getDifficultyConfig } from '../../config/ai';

/**
 * Worker 消息类型
 */
export type WorkerMessage =
  | { type: 'INIT'; boardSize: number }
  | { type: 'SEARCH'; board: CellState[][]; player: Player; difficulty: AIDifficulty; moveCount: number }
  | { type: 'CANCEL' }
  | { type: 'PING' };

export type WorkerResponse =
  | { type: 'RESULT'; result: SearchResult }
  | { type: 'PROGRESS'; depth: number; nodes: number; time: number }
  | { type: 'ERROR'; error: string }
  | { type: 'PONG' }
  | { type: 'READY' };

/**
 * AI Worker 类
 * 在 Web Worker 中运行 AI 计算
 */
class AIWorker {
  private engine: MinimaxEngine | null = null;
  private openingBook: OpeningBook;
  private isSearching: boolean = false;

  constructor() {
    this.openingBook = new OpeningBook();
    this.setupMessageHandler();
  }

  /**
   * 设置消息处理器
   */
  private setupMessageHandler(): void {
    self.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'INIT':
          this.handleInit(message.boardSize);
          break;

        case 'SEARCH':
          this.handleSearch(
            message.board,
            message.player,
            message.difficulty,
            message.moveCount
          );
          break;

        case 'CANCEL':
          this.handleCancel();
          break;

        case 'PING':
          this.postMessage({ type: 'PONG' });
          break;
      }
    };
  }

  /**
   * 处理初始化消息
   */
  private handleInit(boardSize: number): void {
    try {
      this.engine = new MinimaxEngine(boardSize);
      this.postMessage({ type: 'READY' });
    } catch (error) {
      this.postMessage({
        type: 'ERROR',
        error: `Failed to initialize engine: ${error}`,
      });
    }
  }

  /**
   * 处理搜索消息
   */
  private async handleSearch(
    board: CellState[][],
    player: Player,
    difficulty: AIDifficulty,
    moveCount: number
  ): Promise<void> {
    if (this.isSearching) {
      this.postMessage({
        type: 'ERROR',
        error: 'Already searching',
      });
      return;
    }

    this.isSearching = true;

    try {
      // 检查开局库
      const openingMove = this.openingBook.findMove(board, moveCount);
      if (openingMove) {
        const result: SearchResult = {
          move: openingMove,
          score: 0,
          depth: 1,
          nodesSearched: 1,
          timeUsed: 0,
          cutoffs: 0,
        };
        this.postMessage({ type: 'RESULT', result });
        this.isSearching = false;
        return;
      }

      // 使用 Minimax 搜索
      if (!this.engine) {
        this.engine = new MinimaxEngine(board.length);
      }

      // 配置难度
      const config = getDifficultyConfig(difficulty);
      this.engine.setConfig(config.searchConfig);

      // 发送进度更新（模拟，实际引擎需要修改以支持进度回调）
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        if (!this.isSearching) {
          clearInterval(progressInterval);
          return;
        }

        const time = Date.now() - startTime;
        if (time < config.maxThinkingTime) {
          this.postMessage({
            type: 'PROGRESS',
            depth: 1,
            nodes: 0,
            time,
          });
        }
      }, 100);

      // 执行搜索
      const result = this.engine.search(board, player);

      clearInterval(progressInterval);

      if (this.isSearching) {
        this.postMessage({ type: 'RESULT', result });
      }
    } catch (error) {
      this.postMessage({
        type: 'ERROR',
        error: `Search failed: ${error}`,
      });
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * 处理取消消息
   */
  private handleCancel(): void {
    this.isSearching = false;
    // 实际的取消逻辑需要在引擎中实现
  }

  /**
   * 发送消息到主线程
   */
  private postMessage(response: WorkerResponse): void {
    self.postMessage(response);
  }
}

// 创建 Worker 实例
new AIWorker();
