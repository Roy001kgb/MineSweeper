export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  revealedBy?: string;
  isGold?: boolean;
  goldValue?: number;
}

export type GameStatus = 'menu' | 'playing' | 'won' | 'lost';
export type GameMode = 'single' | 'multi';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySettings {
  boardSize: number;
  minesCount: number;
  goldBoxChance: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  minesHit: number;
  color: string;
}

export interface GameState {
  board: Cell[][];
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  minesCount: number;
  flagsPlaced: number;
  players: Player[];
  currentPlayerIndex: number;
  leaderboard: Player[];
  minePenalty: number;
}