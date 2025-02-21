import { useState, useCallback } from 'react';
import { Cell, GameState, GameStatus, Player, Difficulty, DifficultySettings } from '../types';

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: { boardSize: 8, minesCount: 10, goldBoxChance: 0.08 },
  medium: { boardSize: 12, minesCount: 20, goldBoxChance: 0.06 },
  hard: { boardSize: 16, minesCount: 40, goldBoxChance: 0.04 }
};

const DEFAULT_MINE_PENALTY = 5;

const PLAYER_COLORS = [
  'text-emerald-600',
  'text-rose-600',
  'text-purple-600',
  'text-amber-600',
];

const createEmptyBoard = (size: number): Cell[][] => {
  return Array(size).fill(null).map((_, row) =>
    Array(size).fill(null).map((_, col) => ({
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
      isGold: false,
    }))
  );
};

const placeMines = (board: Cell[][], firstClickRow: number, firstClickCol: number, settings: DifficultySettings): Cell[][] => {
  let minesPlaced = 0;
  const newBoard = [...board];
  const { boardSize, minesCount, goldBoxChance } = settings;

  // Place mines
  while (minesPlaced < minesCount) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    if (!newBoard[row][col].isMine && 
        (row !== firstClickRow || col !== firstClickCol)) {
      newBoard[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Place gold boxes
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (!newBoard[row][col].isMine && 
          Math.random() < goldBoxChance && 
          (row !== firstClickRow || col !== firstClickCol)) {
        newBoard[row][col].isGold = true;
        newBoard[row][col].goldValue = Math.floor(Math.random() * 4) + 7; // 7-10
      }
    }
  }

  // Calculate neighbor mines
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (!newBoard[row][col].isMine) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < boardSize && 
                newCol >= 0 && newCol < boardSize && 
                newBoard[newRow][newCol].isMine) {
              count++;
            }
          }
        }
        newBoard[row][col].neighborMines = Math.min(count, 6);
      }
    }
  }

  return newBoard;
};

const revealCell = (board: Cell[][], row: number, col: number, playerId: string): Cell[][] => {
  if (row < 0 || row >= board.length || col < 0 || col >= board.length || 
      board[row][col].isRevealed || board[row][col].isFlagged) {
    return board;
  }

  const newBoard = [...board.map(row => [...row])];
  newBoard[row][col].isRevealed = true;
  newBoard[row][col].revealedBy = playerId;
  return newBoard;
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(DIFFICULTY_SETTINGS.medium.boardSize),
    gameStatus: 'menu',
    gameMode: 'single',
    difficulty: 'medium',
    minesCount: DIFFICULTY_SETTINGS.medium.minesCount,
    flagsPlaced: 0,
    players: [],
    currentPlayerIndex: 0,
    leaderboard: [],
    minePenalty: DEFAULT_MINE_PENALTY,
  });
  const [isFirstClick, setIsFirstClick] = useState(true);

  const startGame = useCallback((mode: 'single' | 'multi', playerCount: number = 1, difficulty: Difficulty = 'medium') => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: `player${i + 1}`,
      name: `Player ${i + 1}`,
      score: 0,
      minesHit: 0,
      color: PLAYER_COLORS[i],
    }));

    setGameState({
      board: createEmptyBoard(settings.boardSize),
      gameStatus: 'playing',
      gameMode: mode,
      difficulty,
      minesCount: settings.minesCount,
      flagsPlaced: 0,
      players,
      currentPlayerIndex: 0,
      leaderboard: [...gameState.leaderboard],
      minePenalty: DEFAULT_MINE_PENALTY,
    });
    setIsFirstClick(true);
  }, [gameState.leaderboard]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' || gameState.board[row][col].isFlagged) {
      return;
    }

    let newBoard = [...gameState.board];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (isFirstClick) {
      newBoard = placeMines(newBoard, row, col, DIFFICULTY_SETTINGS[gameState.difficulty]);
      setIsFirstClick(false);
    }

    newBoard = revealCell(newBoard, row, col, currentPlayer.id);
    const updatedPlayers = [...gameState.players];
    const cell = newBoard[row][col];
    
    if (cell.isMine) {
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        minesHit: currentPlayer.minesHit + 1,
        score: currentPlayer.score - gameState.minePenalty,
      };
    } else {
      const points = cell.isGold ? cell.goldValue! : cell.neighborMines;
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        score: currentPlayer.score + points,
      };
    }

    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const allCellsRevealed = newBoard.every(row => 
      row.every(cell => cell.isRevealed || cell.isMine)
    );

    if (allCellsRevealed || (gameState.gameMode === 'single' && newBoard[row][col].isMine)) {
      const newLeaderboard = [...gameState.leaderboard, ...updatedPlayers]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        gameStatus: allCellsRevealed ? 'won' : 'lost',
        players: updatedPlayers,
        leaderboard: newLeaderboard,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
      }));
    }
  }, [gameState, isFirstClick]);

  const handleRightClick = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState.gameStatus !== 'playing' || gameState.board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...gameState.board.map(row => [...row])];
    const cell = newBoard[row][col];
    const newFlagsPlaced = gameState.flagsPlaced + (cell.isFlagged ? -1 : 1);

    if (!cell.isFlagged && newFlagsPlaced > gameState.minesCount) {
      return;
    }

    cell.isFlagged = !cell.isFlagged;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      flagsPlaced: newFlagsPlaced,
    }));
  }, [gameState]);

  const updateMinePenalty = useCallback((penalty: number) => {
    setGameState(prev => ({
      ...prev,
      minePenalty: penalty,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
    }));
  }, []);

  return {
    gameState,
    handleCellClick,
    handleRightClick,
    resetGame,
    startGame,
    updateMinePenalty,
  };
};