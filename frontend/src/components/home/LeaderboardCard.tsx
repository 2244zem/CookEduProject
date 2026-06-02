import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  progress: number;
  avatar?: string;
}

export default function LeaderboardCard({ leaders }: { leaders?: LeaderboardEntry[] }) {
  const defaultLeaders: LeaderboardEntry[] = [
    {
      rank: 2,
      userId: 'user2',
      username: 'Chef Maria',
      points: 8500,
      progress: 72,
      avatar: '👩‍🍳',
    },
    {
      rank: 1,
      userId: 'user1',
      username: 'Zem#1',
      points: 9200,
      progress: 85,
      avatar: '👨‍🍳',
    },
    {
      rank: 3,
      userId: 'user3',
      username: 'Chef Budi',
      points: 7800,
      progress: 68,
      avatar: '👨‍🔧',
    },
  ];

  const leaderboardData = leaders || defaultLeaders;
  const topThree = leaderboardData.slice(0, 3).sort((a, b) => b.rank - a.rank);

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-32';
    if (rank === 2) return 'h-24';
    return 'h-16';
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-300';
    if (rank === 2) return 'bg-gray-300';
    return 'bg-orange-300';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-slate-50 to-concepto rounded-[40px] p-6 shadow-lg border-2 border-glacial-salt relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-pink-200/10 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-xl font-bold text-slate-950 font-serif">
            Leaderboard
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Top Chefs This Month</p>
      </div>

      {/* Podium */}
      <div className="relative z-10 h-56 mb-6">
        <div className="flex items-flex-end justify-center gap-4 h-full">
          {/* 2nd Place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-2xl">
              {topThree[1]?.avatar || '👩‍🍳'}
            </div>
            <div className="relative">
              <div className={`${getPodiumHeight(2)} w-16 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-2xl shadow-lg flex items-end justify-center p-2`}>
                <Medal className="w-6 h-6 text-gray-400" />
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-xs font-bold text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-center text-gray-700 dark:text-gray-300 max-w-[60px]">
              {topThree[1]?.username}
            </p>
            <p className="text-[10px] text-gray-500">{topThree[1]?.progress}%</p>
          </motion.div>

          {/* 1st Place (Champion) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 -mt-4"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              {topThree[0]?.avatar || '👨‍🍳'}
            </motion.div>
            <div className="relative">
              <motion.div
                animate={{ boxShadow: ['0 8px 16px rgba(124,148,184,0.3)', '0 12px 24px rgba(124,148,184,0.5)', '0 8px 16px rgba(124,148,184,0.3)'] }}
                className={`${getPodiumHeight(1)} w-16 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-t-3xl shadow-2xl flex items-end justify-center p-2 ring-2 ring-yellow-300`}
              >
                <Crown className="w-7 h-7 text-yellow-700" />
              </motion.div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-sm font-black text-yellow-700 bg-yellow-200 rounded-full w-10 h-10 flex items-center justify-center ring-2 ring-yellow-400">
                  👑
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-center text-gray-800 dark:text-white max-w-[60px]">
              {topThree[0]?.username}
            </p>
            <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">{topThree[0]?.progress}%</p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-2xl">
              {topThree[2]?.avatar || '👨‍🔧'}
            </div>
            <div className="relative">
              <div className={`${getPodiumHeight(3)} w-16 bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-2xl shadow-lg flex items-end justify-center p-2`}>
                <Medal className="w-6 h-6 text-orange-600" />
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-xs font-bold text-gray-700 bg-orange-200 rounded-full w-8 h-8 flex items-center justify-center">
                  3
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-center text-gray-700 dark:text-gray-300 max-w-[60px]">
              {topThree[2]?.username}
            </p>
            <p className="text-[10px] text-gray-500">{topThree[2]?.progress}%</p>
          </motion.div>
        </div>
      </div>

      {/* Points Display */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {topThree.map((leader) => (
          <div key={leader.rank} className="bg-white p-3 rounded-2xl border border-glacial-salt text-center">
            <p className="text-[9px] font-bold text-gray-500 uppercase">Poin</p>
            <p className="text-lg font-black text-primary mt-1">{leader.points}</p>
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-6 right-6 text-4xl opacity-10">🌹</div>
      <div className="absolute bottom-6 left-6 text-4xl opacity-10">🌷</div>
    </motion.div>
  );
}
