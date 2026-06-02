import React from 'react';
import { motion } from 'framer-motion';

interface ProgressData {
  averageProgress: number;
  totalTechniques: number;
  totalRecipes: number;
  totalSkills: number;
}

export default function LearningProgressCard({ data }: { data?: ProgressData }) {
  const progress = data?.averageProgress ?? 78;
  const techniques = data?.totalTechniques ?? 12;
  const recipes = data?.totalRecipes ?? 24;
  const skills = data?.totalSkills ?? 8;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-slate-50 to-concepto rounded-[40px] p-6 shadow-lg border-2 border-glacial-salt relative overflow-hidden flex flex-col group"
    >
      {/* Decorative background gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/20 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-200/10 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h3 className="text-xl font-bold text-slate-950 mb-3 font-serif tracking-wide">
          Learning Progress
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Progress</span>
          <span className="text-3xl font-black text-primary ml-auto">{progress}%</span>
        </div>
      </div>

      {/* Animated Winding Chart */}
      <div className="h-40 w-full relative mb-6 flex items-center justify-center">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Background grid */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A4D88" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#2A4D88" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7C94B8" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main winding path */}
          <motion.path
            d="M0,40 Q15,10 35,30 T65,15 T100,5"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Secondary subtle line */}
          <path
            d="M0,50 Q20,30 40,40 T80,30 T100,20"
            fill="none"
            stroke="#B1BBC8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.5"
          />

          {/* Milestones - checkpoint 1 */}
          <motion.circle
            cx="35"
            cy="30"
            r="4"
            fill="#fff"
            stroke="#0B182E"
            strokeWidth="2"
            animate={{ r: [4, 6, 4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Milestones - checkpoint 2 */}
          <motion.circle
            cx="65"
            cy="15"
            r="4"
            fill="#fff"
            stroke="#0B182E"
            strokeWidth="2"
            animate={{ r: [4, 6, 4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />

          {/* Chef flag at end */}
          <g transform="translate(92, 0)">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#0B182E" strokeWidth="1.5" />
            <motion.path
              d="M0,0 L10,4 L0,8 Z"
              fill="#7C94B8"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </g>
        </svg>
      </div>

      {/* Month labels */}
      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-6">
        <span>May</span>
        <span>June</span>
        <span>July</span>
        <span>Aug</span>
        <span>Sept</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-auto relative z-10">
        <div className="bg-white p-4 rounded-2xl text-center border border-glacial-salt shadow-sm hover:shadow-md transition-all">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Teknik</p>
          <p className="text-2xl font-black text-primary mt-2">{techniques}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center border border-glacial-salt shadow-sm hover:shadow-md transition-all">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Resep</p>
          <p className="text-2xl font-black text-primary mt-2">{recipes}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center border border-glacial-salt shadow-sm hover:shadow-md transition-all">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Skill</p>
          <p className="text-2xl font-black text-primary mt-2">{skills}</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-4 right-4 text-6xl opacity-5">🌸</div>
    </motion.div>
  );
}
