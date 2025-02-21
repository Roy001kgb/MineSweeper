import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Bomb, Coins } from 'lucide-react';
import { Cell as CellType } from '../types';

interface CellProps {
  cell: CellType;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  players: Array<{ id: string; color: string }>;
}

const cellVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  revealed: { scale: [0.8, 1.1, 1], opacity: 1 },
};

const getBackgroundColor = (cell: CellType) => {
  if (!cell.isRevealed) return 'bg-indigo-200 hover:bg-indigo-300';
  if (cell.isMine) return 'bg-rose-500';
  if (cell.isGold) return 'bg-amber-400';
  return 'bg-white';
};

const getTextColor = (count: number) => {
  const colors = [
    'text-transparent',
    'text-blue-600',
    'text-emerald-600',
    'text-rose-600',
    'text-purple-600',
    'text-amber-600',
    'text-cyan-600',
    'text-violet-600',
    'text-fuchsia-600',
  ];
  return colors[count];
};

export const Cell: React.FC<CellProps> = ({ cell, onClick, onRightClick, players }) => {
  const playerColor = cell.revealedBy 
    ? players.find(p => p.id === cell.revealedBy)?.color 
    : undefined;

  return (
    <motion.div
      initial="hidden"
      animate={cell.isRevealed ? "revealed" : "visible"}
      variants={cellVariants}
      transition={{ duration: 0.2 }}
      className={`
        w-11 h-11 border-2 border-indigo-300
        flex items-center justify-center
        cursor-pointer select-none
        shadow-sm hover:shadow-md
        transition-shadow duration-200
        ${getBackgroundColor(cell)}
        font-bold text-lg rounded-md
        ${playerColor ? `ring-2 ring-offset-1 ${playerColor.replace('text', 'ring')}` : ''}
      `}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      {cell.isFlagged ? (
        <Flag className="w-5 h-5 text-rose-600 drop-shadow-sm" />
      ) : cell.isRevealed && cell.isMine ? (
        <Bomb className="w-5 h-5 text-white drop-shadow-sm" />
      ) : cell.isRevealed && cell.isGold ? (
        <div className="flex items-center justify-center">
          <Coins className="w-5 h-5 text-amber-700 drop-shadow-sm" />
          <span className="text-amber-800 text-sm ml-0.5">{cell.goldValue}</span>
        </div>
      ) : cell.isRevealed && cell.neighborMines > 0 ? (
        <span className={`${getTextColor(cell.neighborMines)} drop-shadow-sm`}>
          {cell.neighborMines}
        </span>
      ) : null}
    </motion.div>
  );
};