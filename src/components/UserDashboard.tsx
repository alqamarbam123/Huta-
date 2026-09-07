import React, { useState } from 'react';
import { Listing, User } from '../types';
import {
  User as UserIcon,
  KeyRound,
  LogOut,
  ArrowLeft,
  PlusCircle,
  Clock,
  Heart,
  Edit,
  Trash2,
  Inbox,
  Eye
} from 'lucide-react';
import { formatLKR } from './ListingsSection';

interface UserDashboardProps {
  currentUser: User | null;
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenPostAd: () => void;
  onChangePassword: () => void;
  onLogoutUser: () => void;
  onBackToMarketplace: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  listings,
  favorites,
  onToggleFavorite,
  onEditListing,
  onDeleteListing,
  onSelectListing,
  onOpenPostAd,
  onChangePassword,
  onLogoutUser,
  onBackToMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<'myads' | 'favorites'>('myads');

  if (!currentUser) return null;

  const myAds = listings.filter((l) => l.userId === currentUser.id);
  const pendingAds = myAds.filter((l) => l.status === 'pending');
  const favoriteAds = listings.filter((l) => favorites.includes(l.id));

  const displayAds = activeTab === 'myads' ? myAds : favoriteAds;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* User Header Banner */}
      <div className="bg-[#111217] text-white rounded-3xl p-6 sm:p-8 border border-[#2D2F39] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5A36] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#FF5A36]/30">
            {currentUser.fullname ? currentUser.fullname[0].toUpperCase() : currentUser.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">
                {currentUser.fullname || currentUser.username}
              </h2>
              <span className="bg-white/10 text-xs px-2.5 py-0.5 rounded-full text-gray-300">
                Member
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenPostAd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Ad</span>
          </button>
          <button
            type="button"
            onClick={onChangePassword}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-gray-200 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={onLogoutUser}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div
          onClick={() => setActiveTab('myads')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'myads'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            My Posted Advertisements
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{myAds.length}</div>
          <p className="text-xs text-gray-400 mt-1">Live and pending ads</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pendingAds.length}</div>
          <p className="text-xs text-amber-600/70 mt-1">Being reviewed by admin</p>
        </div>

        <div
          onClick={() => setActiveTab('favorites')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Favorites</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{favoriteAds.length}</div>
          <p className="text-xs text-rose-600/70 mt-1">Your bookmarked listings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('myads')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'myads'
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Ads ({myAds.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Saved Favorites ({favoriteAds.length})
          </button>
        </div>

        {/* Content */}
        {displayAds.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              {activeTab === 'myads' ? "You haven't posted any advertisements yet" : 'No saved favorites'}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'myads'
                ? 'Sell your vehicle, electronic device, or property quickly on Sri Lanka’s top marketplace.'
                : 'Browse the marketplace and click the heart icon on any ad to bookmark it here.'}
            </p>
            {activeTab === 'myads' && (
              <button
                type="button"
                onClick={onOpenPostAd}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A36] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#E04826] transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Ad</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayAds.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-[#FF5A36] overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
              >
                <div className="w-full h-40 bg-gray-100 overflow-hidden relative">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x200'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF5A36] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mt-0.5">
                      {item.title}
                    </h4>
                    <div className="text-base font-extrabold text-gray-900 mt-1">
                      {formatLKR(item.price)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {item.views || 0} views
                    </span>

                    {activeTab === 'myads' ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditListing(item);
                          }}
                          className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteListing(item.id);
                          }}
                          className="p-1 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
