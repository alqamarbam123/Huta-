import React, { useState } from 'react';
import { Listing } from '../types';
import {
  ShieldCheck,
  Clock,
  Star,
  Check,
  X,
  Trash2,
  ArrowLeft,
  LogOut,
  Layers,
  Sparkles,
  KeyRound,
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { formatLKR } from './ListingsSection';
import { api } from '../services/api';

interface AdminDashboardProps {
  listings: Listing[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onToggleFeature: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBackToMarketplace: () => void;
  onLogoutAdmin: () => void;
  onSelectListing: (listing: Listing) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  listings,
  onApprove,
  onReject,
  onToggleFeature,
  onDelete,
  onBackToMarketplace,
  onLogoutAdmin,
  onSelectListing,
  onToast,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'featured'>('all');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (newPass !== confirmNewPass) {
      setChangeError('New password and confirmation do not match.');
      return;
    }
    if (newPass.length < 6) {
      setChangeError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changeAdminPassword(currentPass, newPass);
      setChangeSuccess(res.message || 'Admin password updated successfully!');
      if (onToast) onToast(res.message || 'Admin password updated successfully!', 'success');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        setChangeSuccess('');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update admin password';
      setChangeError(msg);
      if (onToast) onToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = listings.length;
  const pending = listings.filter((l) => l.status === 'pending').length;
  const featured = listings.filter((l) => l.isFeatured).length;

  const filteredListings = listings.filter((item) => {
    if (filterTab === 'pending') return item.status === 'pending';
    if (filterTab === 'featured') return item.isFeatured;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#111217] text-white rounded-3xl p-6 sm:p-8 border border-[#2D2F39] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF5A36] font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Administrator Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Admin Control Dashboard
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-xl">
            Review submitted advertisements, verify listing details, feature high-priority ads, or remove spam from HUTA Marketplace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setChangeError('');
              setChangeSuccess('');
              setIsChangePasswordOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-sm font-semibold transition-colors border border-amber-500/30 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marketplace</span>
          </button>
          <button
            type="button"
            onClick={onLogoutAdmin}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div
          onClick={() => setFilterTab('all')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Advertisements</span>
            <Layers className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#111217]">{total}</div>
          <p className="text-xs text-gray-400 mt-1">Across all districts</p>
        </div>

        <div
          onClick={() => setFilterTab('pending')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pending}</div>
          <p className="text-xs text-amber-600/70 mt-1">Requires approval to go live</p>
        </div>

        <div
          onClick={() => setFilterTab('featured')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'featured'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-[#FF5A36] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Featured Ads</span>
            <Star className="w-5 h-5 text-[#FF5A36]" />
          </div>
          <div className="text-3xl font-extrabold text-[#FF5A36]">{featured}</div>
          <p className="text-xs text-[#FF5A36]/70 mt-1">Highlighted on homepage</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-[#181920] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Ads ({total})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pending Review ({pending})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('featured')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'featured'
                ? 'bg-[#FF5A36] text-white'
                : 'bg-orange-50 text-[#FF5A36] hover:bg-orange-100'
            }`}
          >
            Featured ({featured})
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-bold">Item Details</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Price</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No advertisements in this category.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => onSelectListing(item)}
                      >
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">Tel: {item.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>

                    {/* Location */}
                    <td className="py-3 px-4 text-gray-700">{item.location}</td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {formatLKR(item.price)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5A36] text-white">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {item.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(item.id)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(item.id)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleFeature(item.id)}
                            className={`inline-flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                              item.isFeatured
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.isFeatured ? 'Unfeature' : 'Feature'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Admin Password Modal */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsChangePasswordOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-none">
                    Change Admin Password
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Update the master administrator credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changeError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {changeError}
              </div>
            )}

            {changeSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Current Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password (default admin123)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
