import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Listing, User, ViewTab } from './types';
import { api } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { CategoryGrid } from './components/CategoryGrid';
import { ListingsSection } from './components/ListingsSection';
import { AdDetailModal } from './components/AdDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthModals } from './components/AuthModals';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { ChatDrawer } from './components/ChatDrawer';
import { BottomNav } from './components/BottomNav';
import { AllCategoriesPage } from './components/AllCategoriesPage';
import { HutaInPage } from './components/HutaInPage';
import { MorePage } from './components/MorePage';
import { testConnection } from './firebase';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<ViewTab>('marketplace');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Real-time Chat State (Firebase Firestore)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatTargetListing, setChatTargetListing] = useState<Listing | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Sri Lanka');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data & Session Load
  useEffect(() => {
    // 1. Session check
    const user = api.getCurrentUser();
    if (user) setCurrentUser(user);

    const adminAuth = api.isAdmin();
    setIsAdminLoggedIn(adminAuth);

    // 2. Favorites check
    try {
      const storedFavs = localStorage.getItem('huta_favorites');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch {
      // ignore
    }

    // 3. Fetch listings
    fetchListings();

    // 4. Test Firebase Firestore connection
    testConnection();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getListings();
      setListings(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not fetch advertisements';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering & Sorting Logic
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Marketplace view only shows approved listings
    if (currentTab === 'marketplace') {
      result = result.filter((item) => item.status === 'approved');
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Location Filter
    if (selectedLocation !== 'All Sri Lanka') {
      result = result.filter(
        (item) => item.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    // Keyword Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      );
    }

    // Price Range Filter
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min >= 0) {
      result = result.filter((item) => item.price >= min);
    }

    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0) {
      result = result.filter((item) => item.price <= max);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // default: newest first
      result.sort((a, b) => new Date(b.date || (b as any).createdAt || 0).getTime() - new Date(a.date || (a as any).createdAt || 0).getTime());
    }

    // Keep featured ads on top
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return result;
  }, [listings, currentTab, selectedCategory, selectedLocation, searchTerm, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedCategory !== 'All' ||
    selectedLocation !== 'All Sri Lanka' ||
    minPrice ||
    maxPrice
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All Sri Lanka');
    setMinPrice('');
    setMaxPrice('');
  };

  // Favorites Toggle
  const handleToggleFavorite = (adId: string) => {
    let updated: string[];
    if (favorites.includes(adId)) {
      updated = favorites.filter((id) => id !== adId);
      showToast('Removed from saved favorites', 'info');
    } else {
      updated = [...favorites, adId];
      showToast('Saved to your favorites!', 'success');
    }
    setFavorites(updated);
    try {
      localStorage.setItem('huta_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Listing Selection (Ad Detail)
  const handleSelectListing = async (listing: Listing) => {
    setSelectedListing(listing);
    // Fetch fresh details (which also increments views count on server)
    try {
      const fresh = await api.getListing(listing.id);
      setSelectedListing(fresh);
      // Update in local list too
      setListings((prev) =>
        prev.map((item) => (item.id === fresh.id ? fresh : item))
      );
    } catch {
      // ignore view error
    }
  };

  // Post / Edit Ad
  const handleOpenPostAd = () => {
    setEditingListing(null);
    setIsPostAdOpen(true);
  };

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(null);
    setEditingListing(listing);
    setIsPostAdOpen(true);
  };

  const handleSubmitAd = async (adData: Partial<Listing>, isEditId?: string) => {
    try {
      if (isEditId) {
        const updated = await api.updateListing(isEditId, adData);
        setListings((prev) =>
          prev.map((item) => (item.id === isEditId ? updated : item))
        );
        if (selectedListing?.id === isEditId) {
          setSelectedListing(updated);
        }
        showToast('Advertisement updated successfully!', 'success');
      } else {
        const created = await api.createListing({
          ...adData,
          userId: currentUser ? currentUser.id : undefined,
        });
        setListings((prev) => [created, ...prev]);

        if (created.status === 'approved') {
          showToast('Advertisement published live immediately!', 'success');
        } else {
          showToast(
            'Advertisement submitted! It will appear after quick admin review.',
            'info'
          );
        }
      }
      setIsPostAdOpen(false);
      setEditingListing(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save advertisement';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Delete Ad
  const handleDeleteListing = async (adId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this advertisement?')) {
      return;
    }

    try {
      await api.deleteListing(adId);
      setListings((prev) => prev.filter((item) => item.id !== adId));
      if (selectedListing?.id === adId) {
        setSelectedListing(null);
      }
      showToast('Advertisement removed successfully.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete advertisement';
      showToast(msg, 'error');
    }
  };

  // Admin Actions
  const handleApproveListing = async (adId: string) => {
    try {
      const updated = await api.approveListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast('Advertisement approved and is now live!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve advertisement';
      showToast(msg, 'error');
    }
  };

  const handleRejectListing = async (adId: string) => {
    try {
      const updated = await api.rejectListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast('Advertisement marked as rejected.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject advertisement';
      showToast(msg, 'error');
    }
  };

  const handleToggleFeatureListing = async (adId: string) => {
    try {
      const updated = await api.toggleFeatureListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast(
        updated.isFeatured
          ? 'Featured status enabled! This ad will now appear on top.'
          : 'Featured status removed.',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle featured status';
      showToast(msg, 'error');
    }
  };

  // Auth Handlers
  const handleUserAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Logged in as ${user.fullname || user.username}`, 'success');
  };

  const handleLogoutUser = () => {
    api.userLogout();
    setCurrentUser(null);
    if (currentTab === 'user_dashboard') {
      setCurrentTab('marketplace');
    }
    showToast('You have been logged out.', 'info');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentTab('admin_dashboard');
    showToast('Admin logged in successfully.', 'success');
  };

  const handleLogoutAdmin = () => {
    api.adminLogout();
    setIsAdminLoggedIn(false);
    if (currentTab === 'admin_dashboard') {
      setCurrentTab('marketplace');
    }
    showToast('Admin session ended.', 'info');
  };

  // Share Link
  const handleCopyShareLink = (listing: Listing) => {
    const text = `${listing.title} - ${listing.location} on HUTA Sri Lanka Marketplace. Tel: ${listing.phone}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Listing details copied to clipboard!', 'success');
    } else {
      showToast(text, 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#181920] pb-16 sm:pb-20">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Main Views Container */}
      <main className="flex-1">
        {currentTab === 'marketplace' && (
          <div>
            {/* Search Header Banner */}
            <HeroSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Category Browser */}
            <CategoryGrid
              currentCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              listings={listings}
              onViewAllCategories={() => setCurrentTab('categories')}
            />

            {/* Classified Advertisements Grid */}
            <ListingsSection
              listings={filteredListings}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectListing={handleSelectListing}
              isLoading={isLoading}
            />
          </div>
        )}

        {currentTab === 'huta_in' && (
          <HutaInPage
            onBackToHome={() => setCurrentTab('marketplace')}
            onOpenPostAd={handleOpenPostAd}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('marketplace');
            }}
            onToast={showToast}
          />
        )}

        {currentTab === 'categories' && (
          <AllCategoriesPage
            onBack={() => setCurrentTab('marketplace')}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('marketplace');
            }}
            listings={listings}
          />
        )}

        {currentTab === 'more' && (
          <MorePage
            currentUser={currentUser}
            isAdminLoggedIn={isAdminLoggedIn}
            favoritesCount={favorites.length}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onOpenUserAuth={() => setIsUserAuthOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenPostAd={handleOpenPostAd}
            onOpenChat={() => {
              setChatTargetListing(null);
              setIsChatOpen(true);
            }}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onLogoutUser={handleLogoutUser}
            onLogoutAdmin={handleLogoutAdmin}
            onBackToHome={() => setCurrentTab('marketplace')}
          />
        )}

        {currentTab === 'user_dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            listings={listings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onSelectListing={handleSelectListing}
            onOpenPostAd={handleOpenPostAd}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onLogoutUser={handleLogoutUser}
            onBackToMarketplace={() => setCurrentTab('marketplace')}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            listings={listings}
            onApprove={handleApproveListing}
            onReject={handleRejectListing}
            onToggleFeature={handleToggleFeatureListing}
            onDelete={handleDeleteListing}
            onBackToMarketplace={() => setCurrentTab('marketplace')}
            onLogoutAdmin={handleLogoutAdmin}
            onSelectListing={handleSelectListing}
            onToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <AdDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        currentUser={currentUser}
        isAdminLoggedIn={isAdminLoggedIn}
        isFavorite={Boolean(selectedListing && favorites.includes(selectedListing.id))}
        onToggleFavorite={handleToggleFavorite}
        onEditListing={handleEditListing}
        onDeleteListing={handleDeleteListing}
        onCopyShareLink={handleCopyShareLink}
        onStartChat={(listing) => {
          setSelectedListing(null);
          setChatTargetListing(listing);
          setIsChatOpen(true);
        }}
      />

      {/* Real-time Firebase Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatTargetListing(null);
        }}
        targetListing={chatTargetListing}
        onSelectListing={(listingId) => {
          const found = listings.find((l) => l.id === listingId);
          if (found) {
            setSelectedListing(found);
            setIsChatOpen(false);
          }
        }}
      />

      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => {
          setIsPostAdOpen(false);
          setEditingListing(null);
        }}
        onSubmitAd={handleSubmitAd}
        editingListing={editingListing}
        currentUser={currentUser}
        onToast={showToast}
      />

      <AuthModals
        isAdminLoginOpen={isAdminLoginOpen}
        onCloseAdminLogin={() => setIsAdminLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        isUserAuthOpen={isUserAuthOpen}
        onCloseUserAuth={() => setIsUserAuthOpen(false)}
        onUserAuthSuccess={handleUserAuthSuccess}
        isChangePasswordOpen={isChangePasswordOpen}
        onCloseChangePassword={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onToast={showToast}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentTab('marketplace');
        }}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          setCurrentTab('marketplace');
        }}
        onOpenPostAd={handleOpenPostAd}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Sticky Bottom Navigation Bar (Image 1 style) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPostAd={handleOpenPostAd}
      />
    </div>
  );
}
