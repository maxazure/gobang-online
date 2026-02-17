/**
 * 五子棋游戏类型定义
 */

// 格子状态
export enum CellState {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

// 玩家
export enum Player {
  BLACK = 1,
  WHITE = 2,
}

// 游戏状态
export enum GameStatus {
  WAITING = 'waiting',      // 等待中
  PLAYING = 'playing',      // 进行中
  FINISHED = 'finished',    // 已结束
}

// 游戏结果
export enum GameResult {
  NONE = 'none',
  BLACK_WIN = 'black_win',
  WHITE_WIN = 'white_win',
  DRAW = 'draw',
  TIMEOUT = 'timeout',
}

// 游戏模式
export enum GameMode {
  PRACTICE = 'practice',    // 练习模式（可悔棋）
  PVP = 'pvp',              // 人人对战
  PVE = 'pve',              // 人机对战
}

// 坐标位置
export interface Position {
  row: number;
  col: number;
}

// 落子记录
export interface Move {
  position: Position;
  player: Player;
  timestamp: number;
  moveNumber: number;
}

// 游戏配置
export interface GameConfig {
  boardSize: number;        // 棋盘大小（默认15）
  timeLimit?: number;       // 每步时间限制（秒）
  allowUndo: boolean;       // 是否允许悔棋
  gameMode: GameMode;
}

// 获胜连线信息
export interface WinningLine {
  positions: Position[];
  direction: 'horizontal' | 'vertical' | 'diagonal1' | 'diagonal2';
}

// 棋盘状态
export interface BoardState {
  grid: CellState[][];      // 15x15 棋盘
  lastMove?: Position;      // 最后一步位置
  moveCount: number;        // 总步数
}

// 游戏状态（完整）
export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  status: GameStatus;
  result: GameResult;
  winner?: Player;
  history: Move[];
  winningLine?: WinningLine;
  config: GameConfig;
}

// 计时器状态
export interface TimerState {
  blackTime: number;        // 黑方剩余时间（秒）
  whiteTime: number;        // 白方剩余时间（秒）
  isRunning: boolean;
  currentPlayer: Player;
}

// 棋盘渲染配置
export interface BoardRenderConfig {
  cellSize: number;         // 格子大小（像素）
  padding: number;          // 内边距（像素）
  boardColor: string;       // 棋盘颜色
  lineColor: string;        // 线条颜色
  blackPieceColor: string;  // 黑子颜色
  whitePieceColor: string;  // 白子颜色
  highlightColor: string;   // 高亮颜色
  lastMoveColor: string;    // 最后一步标记颜色
}

// Canvas 点击事件数据
export interface CanvasClickEvent {
  position: Position;
  pixelX: number;
  pixelY: number;
}
