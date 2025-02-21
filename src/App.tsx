import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Bomb, RefreshCw, Users, User, Trophy, MinusCircle, ArrowLeft } from 'lucide-react';
import { Cell } from './components/Cell';
import { useGame } from './hooks/useGame';
import { Difficulty } from './types';

function App() {
  const { gameState, handleCellClick, handleRightClick, resetGame, startGame, updateMinePenalty } = useGame();
  const { board, gameStatus, minesCount, flagsPlaced, players, currentPlayerIndex, gameMode, leaderboard, minePenalty } = gameState;
  const [playerCount, setPlayerCount] = useState(2);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(gameState.difficulty);

  if (gameStatus === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text"
          >
            Minesweeper
          </motion.h1>
          
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Select Difficulty</h2>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <motion.button
                    key={diff}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-3 rounded-xl font-medium capitalize shadow-lg transition-all duration-200
                      ${selectedDifficulty === diff
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-white ring-offset-2'
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200'
                      }`}
                  >
                    {diff}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Game Mode</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-5 rounded-xl flex items-center justify-center gap-3 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
                onClick={() => startGame('single', 1, selectedDifficulty)}
              >
                <User className="w-6 h-6" />
                <span className="text-lg font-semibold">Single Player</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white p-5 rounded-xl flex items-center justify-center gap-3 hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-lg"
                onClick={() => setShowPlayerSelect(true)}
              >
                <Users className="w-6 h-6" />
                <span className="text-lg font-semibold">Multiplayer</span>
              </motion.button>

              {showPlayerSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl border-2 border-purple-100 shadow-lg"
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Number of Players</h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={playerCount}
                      onChange={(e) => setPlayerCount(Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                      className="w-24 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg"
                    />
                    <button
                      onClick={() => {
                        startGame('multi', playerCount, selectedDifficulty);
                        setShowPlayerSelect(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all font-semibold"
                    >
                      Start Game
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {leaderboard.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-7 h-7 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
                </div>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((player, index) => (
                    <div key={index} className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <span className="font-medium text-gray-800">{player.name}</span>
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        {player.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-[90vw] border border-white/20">
        <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-2 rounded-lg">
              <Bomb className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-xl font-bold text-rose-600">
              {minesCount - flagsPlaced}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <MinusCircle className="w-5 h-5 text-rose-500" />
              <input
                type="number"
                value={minePenalty}
                onChange={(e) => updateMinePenalty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-16 text-center border-2 border-indigo-200 rounded-md focus:outline-none focus:border-indigo-400"
                min="1"
                placeholder="Mine penalty"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 p-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors shadow-lg"
              onClick={resetGame}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-indigo-600">
              {flagsPlaced}
            </span>
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded-lg">
              <Flag className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {(gameMode === 'multi' || gameMode === 'single') && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  index === currentPlayerIndex
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 ring-2 ring-indigo-500'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${player.color}`}>
                    {player.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{player.score}</span>
                    <div className="flex items-center gap-1 bg-rose-100 px-2 py-1 rounded-lg">
                      <Bomb className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-500 font-medium">{player.minesHit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl text-center font-bold text-lg ${
              gameStatus === 'won'
                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700'
            }`}
          >
            {gameStatus === 'won' ? '🎉 Victory! All mines found!' : '💥 Boom! Game Over!'}
          </motion.div>
        )}

        <div 
          className="grid gap-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-xl"
          style={{ 
            gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
            maxWidth: '90vmin',
            margin: '0 auto'
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onRightClick={(e) => handleRightClick(rowIndex, colIndex, e)}
                players={players}
              />
            ))
          )}
        </div>

        <div className="mt-6 text-center text-sm font-medium text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
          Left click to reveal • Right click to flag
        </div>
      </div>
    </div>
  );
}

export default App;