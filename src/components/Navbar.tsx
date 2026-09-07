import React from 'react';
import { motion } from 'motion/react';
import { ViewTab } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <header className="bg-[#111217] border-b border-[#2D2F39] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTab('marketplace')}
          className="flex items-center gap-3 cursor-pointer group select-none py-1"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#181920] border-2 border-[#2D2F39] flex items-center justify-center p-1.5 shadow-lg group-hover:border-[#FF5A36] group-hover:shadow-[#FF5A36]/20 transition-all duration-300">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
              <rect width="100" height="100" rx="20" fill="#181920" />
              {/* Left Pillar */}
              <rect x="20" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
              {/* Right Pillar */}
              <rect x="62" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
              {/* Modern Diagonal Crossbar */}
              <path d="M 24 64 L 76 28 L 76 42 L 24 78 Z" fill="#FFFFFF" />
              {/* Accent Arrowhead / Crown */}
              <polygon points="66,16 88,26 74,28" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="flex flex-col leading-none justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                HUTA
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#FF5A36] tracking-tight">
                .lk
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Sri Lanka Marketplace
            </span>
          </div>
        </motion.div>

        {/* Center/Right Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#181920] border border-[#2D2F39] rounded-2xl p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => onSelectTab('marketplace')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'marketplace'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('huta_in')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentTab === 'huta_in'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>HUTA</span>
            <span className="bg-[#FF5A36] text-white text-[10px] px-1 py-0.5 rounded font-black leading-none">
              IN
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('categories')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'categories'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('user_dashboard')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'user_dashboard'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('more')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'more'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            More
          </button>
        </div>
      </div>
    </header>
  );
};
