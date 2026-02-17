import { useEffect, useRef, useCallback, useState } from 'react';
import { CellState, Player, Position, BoardRenderConfig } from '../types/game';
import { Board } from '../game/Board';

interface BoardProps {
  board: Board;
  currentPlayer?: Player;
  lastMove?: Position;
  winningLine?: Position[];
  disabled?: boolean;
  onMove?: (position: Position) => void;
  className?: string;
}

// 默认渲染配置
const defaultRenderConfig: BoardRenderConfig = {
  cellSize: 36,
  padding: 20,
  boardColor: '#E8C39E',
  lineColor: '#5C4033',
  blackPieceColor: '#1A1A1A',
  whitePieceColor: '#F5F5F5',
  highlightColor: 'rgba(99, 102, 241, 0.5)',
  lastMoveColor: '#EF4444',
};

export function BoardCanvas({
  board,
  currentPlayer,
  lastMove,
  winningLine,
  disabled = false,
  onMove,
  className = '',
}: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const [config] = useState<BoardRenderConfig>(defaultRenderConfig);

  const size = board.getSize();
  const canvasSize = config.cellSize * (size - 1) + config.padding * 2;

  // 坐标转换：像素 -> 棋盘坐标
  const pixelToBoard = useCallback(
    (pixelX: number, pixelY: number): Position | null => {
      const x = pixelX - config.padding;
      const y = pixelY - config.padding;

      const col = Math.round(x / config.cellSize);
      const row = Math.round(y / config.cellSize);

      if (row >= 0 && row < size && col >= 0 && col < size) {
        return { row, col };
      }
      return null;
    },
    [config.cellSize, config.padding, size]
  );

  // 坐标转换：棋盘坐标 -> 像素
  const boardToPixel = useCallback(
    (row: number, col: number): { x: number; y: number } => {
      return {
        x: config.padding + col * config.cellSize,
        y: config.padding + row * config.cellSize,
      };
    },
    [config.cellSize, config.padding]
  );

  // 绘制棋盘
  const drawBoard = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // 清空画布
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // 绘制背景
      ctx.fillStyle = config.boardColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 绘制网格线
      ctx.strokeStyle = config.lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < size; i++) {
        const pos = config.padding + i * config.cellSize;

        // 横线
        ctx.moveTo(config.padding, pos);
        ctx.lineTo(canvasSize - config.padding, pos);

        // 竖线
        ctx.moveTo(pos, config.padding);
        ctx.lineTo(pos, canvasSize - config.padding);
      }
      ctx.stroke();

      // 绘制星位（天元、四星）
      const starPoints = getStarPoints(size);
      ctx.fillStyle = config.lineColor;
      starPoints.forEach(({ row, col }) => {
        const { x, y } = boardToPixel(row, col);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [canvasSize, config, size, boardToPixel]
  );

  // 绘制棋子
  const drawPieces = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const pieceRadius = config.cellSize * 0.42;

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const cell = board.getCell(row, col);
          if (cell === CellState.EMPTY) continue;

          const { x, y } = boardToPixel(row, col);

          // 绘制棋子阴影
          ctx.beginPath();
          ctx.arc(x + 2, y + 2, pieceRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fill();

          // 绘制棋子
          ctx.beginPath();
          ctx.arc(x, y, pieceRadius, 0, Math.PI * 2);

          if (cell === CellState.BLACK) {
            // 黑子渐变
            const gradient = ctx.createRadialGradient(
              x - pieceRadius * 0.3,
              y - pieceRadius * 0.3,
              0,
              x,
              y,
              pieceRadius
            );
            gradient.addColorStop(0, '#444444');
            gradient.addColorStop(1, '#0A0A0A');
            ctx.fillStyle = gradient;
          } else {
            // 白子渐变
            const gradient = ctx.createRadialGradient(
              x - pieceRadius * 0.3,
              y - pieceRadius * 0.3,
              0,
              x,
              y,
              pieceRadius
            );
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(1, '#D0D0D0');
            ctx.fillStyle = gradient;
          }

          ctx.fill();
          ctx.strokeStyle = cell === CellState.BLACK ? '#000000' : '#AAAAAA';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    },
    [board, config.cellSize, size, boardToPixel]
  );

  // 绘制最后一步标记
  const drawLastMove = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!lastMove) return;

      const { x, y } = boardToPixel(lastMove.row, lastMove.col);
      const radius = config.cellSize * 0.15;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = config.lastMoveColor;
      ctx.fill();
    },
    [lastMove, config.cellSize, config.lastMoveColor, boardToPixel]
  );

  // 绘制获胜连线
  const drawWinningLine = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!winningLine || winningLine.length === 0) return;

      const start = boardToPixel(winningLine[0].row, winningLine[0].col);
      const end = boardToPixel(
        winningLine[winningLine.length - 1].row,
        winningLine[winningLine.length - 1].col
      );

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = config.highlightColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 高亮获胜棋子
      winningLine.forEach(({ row, col }) => {
        const { x, y } = boardToPixel(row, col);
        const radius = config.cellSize * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = config.highlightColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    },
    [winningLine, config.cellSize, config.highlightColor, boardToPixel]
  );

  // 绘制悬停提示
  const drawHover = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!hoverPosition || disabled || !currentPlayer) return;

      // 检查位置是否为空
      if (board.getCell(hoverPosition.row, hoverPosition.col) !== CellState.EMPTY) {
        return;
      }

      const { x, y } = boardToPixel(hoverPosition.row, hoverPosition.col);
      const radius = config.cellSize * 0.42;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle =
        currentPlayer === Player.BLACK
          ? 'rgba(26, 26, 26, 0.5)'
          : 'rgba(245, 245, 245, 0.5)';
      ctx.fill();
    },
    [hoverPosition, disabled, currentPlayer, board, config.cellSize, boardToPixel]
  );

  // 渲染画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBoard(ctx);
    drawPieces(ctx);
    drawLastMove(ctx);
    drawWinningLine(ctx);
    drawHover(ctx);
  }, [drawBoard, drawPieces, drawLastMove, drawWinningLine, drawHover]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || disabled) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pos = pixelToBoard(x, y);
      setHoverPosition(pos);
    },
    [disabled, pixelToBoard]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  // 处理点击
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled || !onMove) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pos = pixelToBoard(x, y);
      if (pos) {
        onMove(pos);
      }
    },
    [disabled, onMove, pixelToBoard]
  );

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`cursor-pointer ${disabled ? 'cursor-not-allowed opacity-80' : ''} ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

/**
 * 获取星位坐标（天元和四角星）
 */
function getStarPoints(size: number): Position[] {
  if (size !== 15) return [];

  // 15路棋盘的星位
  return [
    { row: 3, col: 3 },
    { row: 3, col: 7 },
    { row: 3, col: 11 },
    { row: 7, col: 3 },
    { row: 7, col: 7 }, // 天元
    { row: 7, col: 11 },
    { row: 11, col: 3 },
    { row: 11, col: 7 },
    { row: 11, col: 11 },
  ];
}

export default BoardCanvas;
