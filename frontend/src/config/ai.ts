import { SearchConfig } from '../game/ai/MinimaxEngine';

/**
 * AI 难度级别
 */
export enum AIDifficulty {
  EASY = 'easy',           // 简单
  MEDIUM = 'medium',       // 中等
  HARD = 'hard',           // 困难
  MASTER = 'master',       // 大师
}

/**
 * 难度配置
 */
export interface DifficultyConfig {
  name: string;
  description: string;
  searchConfig: SearchConfig;
  maxThinkingTime: number;  // 最大思考时间（毫秒）
}

/**
 * 各难度级别的配置
 */
export const DIFFICULTY_CONFIGS: Record<AIDifficulty, DifficultyConfig> = {
  [AIDifficulty.EASY]: {
    name: '简单',
    description: '适合初学者，AI 会偶尔犯错',
    searchConfig: {
      maxDepth: 2,
      timeLimit: 100,
      useIterativeDeepening: false,
      useTranspositionTable: true,
    },
    maxThinkingTime: 100,
  },

  [AIDifficulty.MEDIUM]: {
    name: '中等',
    description: '适合有一定基础的玩家',
    searchConfig: {
      maxDepth: 4,
      timeLimit: 300,
      useIterativeDeepening: true,
      useTranspositionTable: true,
    },
    maxThinkingTime: 300,
  },

  [AIDifficulty.HARD]: {
    name: '困难',
    description: '挑战性较强，需要认真思考',
    searchConfig: {
      maxDepth: 6,
      timeLimit: 1000,
      useIterativeDeepening: true,
      useTranspositionTable: true,
    },
    maxThinkingTime: 1000,
  },

  [AIDifficulty.MASTER]: {
    name: '大师',
    description: '顶级难度，迎接挑战吧',
    searchConfig: {
      maxDepth: 8,
      timeLimit: 3000,
      useIterativeDeepening: true,
      useTranspositionTable: true,
    },
    maxThinkingTime: 3000,
  },
};

/**
 * 获取难度配置
 */
export function getDifficultyConfig(difficulty: AIDifficulty): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * 获取所有难度选项
 */
export function getAllDifficulties(): { value: AIDifficulty; label: string; description: string }[] {
  return Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => ({
    value: key as AIDifficulty,
    label: config.name,
    description: config.description,
  }));
}

/**
 * AI 玩家配置
 */
export interface AIPlayerConfig {
  difficulty: AIDifficulty;
  playerName?: string;
  avatarUrl?: string;
}

/**
 * 默认 AI 配置
 */
export const DEFAULT_AI_CONFIG: AIPlayerConfig = {
  difficulty: AIDifficulty.MEDIUM,
  playerName: 'AI 对手',
};
