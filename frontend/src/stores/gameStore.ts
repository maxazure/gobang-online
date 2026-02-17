import { create } from 'zustand';
import {
  CellState,
  Player,
  GameStatus,
  GameResult,
  GameMode,
  Position,
  Move,
  GameConfig,
  GameState,
  WinningLine,
} from '../types/game';
import { Board } from '../game/Board';

// 默认游戏配置
const defaultConfig: GameConfig = {
  boardSize: 15,
  allowUndo: true,
  gameMode: GameMode.PRACTICE,
};

// 游戏状态接口
interface GameStoreState {
  // 核心状态
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  result: GameResult;
  winner: Player | null;
  history: Move[];
  winningLine: WinningLine | null;
  config: GameConfig;

  // 计时器状态
  blackTime: number;
  whiteTime: number;
  isTimerRunning: boolean;

  // Actions
  initGame: (config?: Partial<GameConfig>) => void;
  makeMove: (row: number, col: number) => boolean;
  undo: () => boolean;
  reset: () => void;
  passTurn: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  updateTimer: () => void;
  setConfig: (config: Partial<GameConfig>) => void;
  resign: (player: Player) => void;
}

// 创建游戏状态管理
export const useGameStore = create<GameStoreState>((set, get) => ({
  // 初始状态
  board: new Board(15),
  currentPlayer: Player.BLACK,
  status: GameStatus.WAITING,
  result: GameResult.NONE,
  winner: null,
  history: [],
  winningLine: null,
  config: defaultConfig,
  blackTime: 0,
  whiteTime: 0,
  isTimerRunning: false,

  /**
   * 初始化游戏
   */
  initGame: (config?: Partial<GameConfig>) => {
    const newConfig = { ...defaultConfig, ...config };
    set({
      board: new Board(newConfig.boardSize),
      currentPlayer: Player.BLACK,
      status: GameStatus.PLAYING,
      result: GameResult.NONE,
      winner: null,
      history: [],
      winningLine: null,
      config: newConfig,
      blackTime: newConfig.timeLimit || 0,
      whiteTime: newConfig.timeLimit || 0,
      isTimerRunning: false,
    });
  },

  /**
   * 落子
   */
  makeMove: (row: number, col: number): boolean => {
    const state = get();

    // 检查游戏状态
    if (state.status !== GameStatus.PLAYING) {
      console.warn('Game is not in playing state');
      return false;
    }

    // 尝试落子
    const success = state.board.placePiece(row, col, state.currentPlayer);
    if (!success) {
      return false;
    }

    // 记录历史
    const move: Move = {
      position: { row, col },
      player: state.currentPlayer,
      timestamp: Date.now(),
      moveNumber: state.history.length + 1,
    };

    const newHistory = [...state.history, move];

    // 检查胜负
    const winResult = state.board.checkWin(row, col);
    if (winResult.hasWon && winResult.line) {
      set({
        history: newHistory,
        status: GameStatus.FINISHED,
        result:
          state.currentPlayer === Player.BLACK
            ? GameResult.BLACK_WIN
            : GameResult.WHITE_WIN,
        winner: state.currentPlayer,
        winningLine: {
          positions: winResult.line,
          direction: getDirection(winResult.line),
        },
        isTimerRunning: false,
      });
      return true;
    }

    // 检查平局
    if (state.board.isFull()) {
      set({
        history: newHistory,
        status: GameStatus.FINISHED,
        result: GameResult.DRAW,
        winner: null,
        isTimerRunning: false,
      });
      return true;
    }

    // 切换回合
    const nextPlayer =
      state.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;

    set({
      history: newHistory,
      currentPlayer: nextPlayer,
    });

    return true;
  },

  /**
   * 悔棋
   */
  undo: (): boolean => {
    const state = get();

    // 检查是否允许悔棋
    if (!state.config.allowUndo) {
      console.warn('Undo is not allowed in this game mode');
      return false;
    }

    // 检查是否有历史记录
    if (state.history.length === 0) {
      return false;
    }

    // 撤销最后一步
    const undonePosition = state.board.undo();
    if (!undonePosition) {
      return false;
    }

    // 回退到上一步玩家
    const lastMove = state.history[state.history.length - 1];
    const previousPlayer = lastMove.player;

    set({
      history: state.history.slice(0, -1),
      currentPlayer: previousPlayer,
      // 如果游戏已结束，恢复到进行中
      status: state.status === GameStatus.FINISHED ? GameStatus.PLAYING : state.status,
      result: state.status === GameStatus.FINISHED ? GameResult.NONE : state.result,
      winner: state.status === GameStatus.FINISHED ? null : state.winner,
      winningLine: state.status === GameStatus.FINISHED ? null : state.winningLine,
    });

    return true;
  },

  /**
   * 重置游戏
   */
  reset: () => {
    const state = get();
    state.board.reset();
    set({
      currentPlayer: Player.BLACK,
      status: GameStatus.PLAYING,
      result: GameResult.NONE,
      winner: null,
      history: [],
      winningLine: null,
      blackTime: state.config.timeLimit || 0,
      whiteTime: state.config.timeLimit || 0,
      isTimerRunning: false,
    });
  },

  /**
   * 跳过回合（用于测试或特殊规则）
   */
  passTurn: () => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return;

    const nextPlayer =
      state.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;

    set({ currentPlayer: nextPlayer });
  },

  /**
   * 开始计时
   */
  startTimer: () => {
    set({ isTimerRunning: true });
  },

  /**
   * 暂停计时
   */
  pauseTimer: () => {
    set({ isTimerRunning: false });
  },

  /**
   * 更新计时器（每秒调用）
   */
  updateTimer: () => {
    const state = get();
    if (!state.isTimerRunning || state.status !== GameStatus.PLAYING) return;

    const timeLimit = state.config.timeLimit;
    if (!timeLimit || timeLimit <= 0) return;

    if (state.currentPlayer === Player.BLACK) {
      const newTime = state.blackTime - 1;
      if (newTime <= 0) {
        // 黑方超时，白方获胜
        set({
          blackTime: 0,
          status: GameStatus.FINISHED,
          result: GameResult.TIMEOUT,
          winner: Player.WHITE,
          isTimerRunning: false,
        });
      } else {
        set({ blackTime: newTime });
      }
    } else {
      const newTime = state.whiteTime - 1;
      if (newTime <= 0) {
        // 白方超时，黑方获胜
        set({
          whiteTime: 0,
          status: GameStatus.FINISHED,
          result: GameResult.TIMEOUT,
          winner: Player.BLACK,
          isTimerRunning: false,
        });
      } else {
        set({ whiteTime: newTime });
      }
    }
  },

  /**
   * 更新游戏配置
   */
  setConfig: (config: Partial<GameConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  /**
   * 认输
   */
  resign: (player: Player) => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return;

    const winner = player === Player.BLACK ? Player.WHITE : Player.BLACK;

    set({
      status: GameStatus.FINISHED,
      result: winner === Player.BLACK ? GameResult.BLACK_WIN : GameResult.WHITE_WIN,
      winner,
      isTimerRunning: false,
    });
  },
}));

/**
 * 根据连线位置判断方向
 */
function getDirection(line: Position[]): WinningLine['direction'] {
  if (line.length < 2) return 'horizontal';

  const first = line[0];
  const second = line[1];

  if (first.row === second.row) return 'horizontal';
  if (first.col === second.col) return 'vertical';
  if (second.row > first.row && second.col > first.col) return 'diagonal1';
  return 'diagonal2';
}

/**
 * 获取游戏状态的派生数据
 */
export function getGameStatusText(state: GameStoreState): string {
  switch (state.status) {
    case GameStatus.WAITING:
      return '等待开始';
    case GameStatus.PLAYING:
      return state.currentPlayer === Player.BLACK ? '黑方回合' : '白方回合';
    case GameStatus.FINISHED:
      if (state.result === GameResult.DRAW) return '平局';
      if (state.result === GameResult.TIMEOUT) {
        return state.winner === Player.BLACK ? '黑方获胜（超时）' : '白方获胜（超时）';
      }
      return state.winner === Player.BLACK ? '黑方获胜' : '白方获胜';
    default:
      return '';
  }
}

/**
 * 格式化时间显示
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
