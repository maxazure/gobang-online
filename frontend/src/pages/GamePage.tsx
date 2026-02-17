import { useEffect, useRef, useCallback } from 'react';
import { Player, GameStatus, GameResult, GameMode } from '../types/game';
import { useGameStore, formatTime, getGameStatusText } from '../stores/gameStore';
import { BoardCanvas } from '../components/Board';
import { motion, AnimatePresence } from 'framer-motion';

export function GamePage() {
  const game = useGameStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化游戏
  useEffect(() => {
    if (game.status === GameStatus.WAITING) {
      game.initGame({
        gameMode: GameMode.PRACTICE,
        timeLimit: 300, // 5分钟
        allowUndo: true,
      });
    }
  }, [game.status]);

  // 计时器逻辑
  useEffect(() => {
    if (game.isTimerRunning && game.status === GameStatus.PLAYING) {
      timerRef.current = setInterval(() => {
        game.updateTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game.isTimerRunning, game.status, game.updateTimer]);

  // 处理落子
  const handleMove = useCallback(
    (position: { row: number; col: number }) => {
      if (!game.isTimerRunning && game.status === GameStatus.PLAYING) {
        game.startTimer();
      }
      game.makeMove(position.row, position.col);
    },
    [game]
  );

  // 重新开始
  const handleRestart = useCallback(() => {
    game.reset();
    game.initGame({
      gameMode: GameMode.PRACTICE,
      timeLimit: 300,
      allowUndo: true,
    });
  }, [game]);

  // 悔棋
  const handleUndo = useCallback(() => {
    game.undo();
  }, [game]);

  // 认输
  const handleResign = useCallback(() => {
    game.resign(game.currentPlayer);
  }, [game, game.currentPlayer]);

  const statusText = getGameStatusText(game);
  const isGameOver = game.status === GameStatus.FINISHED;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          五子棋在线对战
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 游戏区域 */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass rounded-2xl p-4 inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <BoardCanvas
                board={game.board}
                currentPlayer={game.currentPlayer}
                lastMove={game.history[game.history.length - 1]?.position}
                winningLine={game.winningLine?.positions}
                disabled={isGameOver}
                onMove={handleMove}
              />
            </motion.div>
          </div>

          {/* 信息面板 */}
          <div className="space-y-4">
            {/* 游戏状态 */}
            <motion.div
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-white mb-3">游戏状态</h2>
              <div className="text-2xl font-bold text-indigo-400 mb-2">
                {statusText}
              </div>
              <div className="text-slate-400">
                总步数: {game.history.length}
              </div>
            </motion.div>

            {/* 计时器 */}
            <motion.div
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-white mb-3">剩余时间</h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg text-center ${
                    game.currentPlayer === Player.BLACK && game.status === GameStatus.PLAYING
                      ? 'bg-indigo-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className="text-sm text-slate-300">黑方</div>
                  <div className="text-2xl font-mono text-white">
                    {formatTime(game.blackTime)}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${
                    game.currentPlayer === Player.WHITE && game.status === GameStatus.PLAYING
                      ? 'bg-indigo-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className="text-sm text-slate-300">白方</div>
                  <div className="text-2xl font-mono text-white">
                    {formatTime(game.whiteTime)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 控制按钮 */}
            <motion.div
              className="glass rounded-xl p-4 space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-3">操作</h2>

              <button
                onClick={handleUndo}
                disabled={game.history.length === 0 || isGameOver}
                className="w-full py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-medium transition-colors"
              >
                悔棋
              </button>

              <button
                onClick={handleResign}
                disabled={isGameOver}
                className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-medium transition-colors"
              >
                认输
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                重新开始
              </button>
            </motion.div>

            {/* 游戏结束弹窗 */}
            <AnimatePresence>
              {isGameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="glass rounded-xl p-6 text-center"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {game.result === GameResult.DRAW
                      ? '🤝 平局！'
                      : game.result === GameResult.TIMEOUT
                      ? `⏰ ${game.winner === Player.BLACK ? '黑方' : '白方'}超时获胜！`
                      : `🎉 ${game.winner === Player.BLACK ? '黑方' : '白方'}获胜！`}
                  </h2>
                  <p className="text-slate-400 mb-4">
                    共进行了 {game.history.length} 步
                  </p>
                  <button
                    onClick={handleRestart}
                    className="py-2 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                  >
                    再来一局
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
