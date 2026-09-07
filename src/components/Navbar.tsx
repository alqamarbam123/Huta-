import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, ViewTab } from '../types';
import { PlusCircle, Shield, User as UserIcon, LogOut, ChevronDown, KeyRound, LayoutDashboard, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  onOpenUserAuth: () => void;
  onOpenAdminLogin: () => void;
  onOpenPostAd: () => void;
  onLogoutUser: () => void;
  onLogoutAdmin: () => void;
  onChangePassword: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isAdminLoggedIn,
  onOpenUserAuth,
  onOpenAdminLogin,
  onOpenPostAd,
  onLogoutUser,
  onLogoutAdmin,
  onChangePassword,
  onOpenChat,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#111217] border-b border-[#2D2F39] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectTab('marketplace')}
          className="flex items-center gap-3.5 cursor-pointer group select-none py-1"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#181920] border-2 border-[#2D2F39] flex items-center justify-center p-2 shadow-lg group-hover:border-[#FF5A36] group-hover:shadow-[#FF5A36]/20 transition-all duration-300">
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
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                HUTA
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#FF5A36] tracking-tight">
                .lk
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
              Sri Lanka Marketplace
            </span>
          </div>
        </motion.div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* User Status / Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-transparent hover:border-[#2D2F39]"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center font-bold text-xs">
                  {currentUser.fullname ? currentUser.fullname[0].toUpperCase() : currentUser.username[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{currentUser.fullname || currentUser.username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenUserAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all"
              >
                <UserIcon className="w-4 h-4 text-[#FF5A36]" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-52 bg-[#181920] border border-[#2D2F39] rounded-xl shadow-xl py-2 z-50 text-sm animate-in fade-in-50 zoom-in-95">
                <div className="px-4 py-2 border-b border-[#2D2F39]">
                  <p className="text-xs text-[#9CA3AF]">Signed in as</p>
                  <p className="font-semibold text-white truncate">{currentUser.username}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('dashboard');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#FF5A36]" />
                  <span>My Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangePassword();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  <span>Change Password</span>
                </button>
                <div className="border-t border-[#2D2F39] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    onLogoutUser();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Real-time Firebase Live Chat Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-200 hover:text-white border border-[#2D2F39] hover:border-[#FF5A36]/50 hover:bg-white/5 transition-all cursor-pointer"
            title="Open real-time buyer/seller chat"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MessageSquare className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span className="hidden sm:inline">Live Chat</span>
          </motion.button>

          {/* Admin Button */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onSelectTab(currentTab === 'admin_dashboard' ? 'marketplace' : 'admin_dashboard')
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  currentTab === 'admin_dashboard'
                    ? 'bg-[#FF5A36] text-white border-[#FF5A36]'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
              <button
                type="button"
                onClick={onLogoutAdmin}
                title="Logout Admin"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white border border-[#2D2F39] hover:bg-white/5 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Post Ad Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenPostAd}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#FF5A36]/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Ad</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
