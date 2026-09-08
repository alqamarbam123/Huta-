import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Listing, User } from '../types';
import { X, Sparkles, Image as ImageIcon, Loader2, UploadCloud, Wrench, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAd: (data: Partial<Listing>, isEditId?: string) => Promise<void>;
  editingListing: Listing | null;
  currentUser: User | null;
  isAdminLoggedIn?: boolean;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Property',
  'Motorcycles',
  'Home & Garden',
  'Fashion',
  'Services',
  'Jobs',
];

const SERVICE_TRADES = [
  'AC Repair & Servicing',
  'Automotive Services & Breakdown',
  'Cleaning Services (Home & Office)',
  'Furniture Moving & Transport',
  'Plumbing & Sanitary Works',
  'Electrician & Electrical Wiring',
  'Pest Control & Extermination',
  'Maintenance Services & Handyman',
  'Events, DJ & Photography',
  'Education, Tuition & Coaching',
  'Fashion, Tailoring & Styling',
  'Health & Wellness',
  'Legal, Financial & Consultancy',
  'Pet Care & Veterinary Services',
  'Painting & Waterproofing',
  'Carpentry & Masonry',
  'IT, Laptop & Phone Repair',
  'Other Professional Services',
];

const SERVICE_AREAS = [
  'Colombo & Greater Suburbs',
  'All Western Province (Colombo, Gampaha, Kalutara)',
  'Kandy & Central Province',
  'Galle & Southern Coastal District',
  'Islandwide (All 25 Districts)',
  'Local District Only',
];

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onSubmitAd,
  editingListing,
  currentUser,
  isAdminLoggedIn,
  onToast,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('Colombo');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Specialized Service Fields
  const [serviceTrade, setServiceTrade] = useState('AC Repair & Servicing');
  const [pricingType, setPricingType] = useState<'fixed' | 'starting_at' | 'hourly' | 'quote'>('starting_at');
  const [serviceArea, setServiceArea] = useState('Colombo & Greater Suburbs');
  const [isEmergency247, setIsEmergency247] = useState(false);

  // Admin Overrides & Status Controls
  const [adminStatus, setAdminStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [adminIsFeatured, setAdminIsFeatured] = useState(false);
  const [adminIsVerifiedPro, setAdminIsVerifiedPro] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title);
      setCategory(editingListing.category);
      setLocation(editingListing.location);
      setPrice(editingListing.price.toString());
      setPhone(editingListing.phone);
      setDescription(editingListing.description);
      setImageUrl(editingListing.image || '');
      setImagePreview(editingListing.image || '');
      setServiceTrade(editingListing.serviceTrade || 'AC Repair & Servicing');
      setPricingType(editingListing.pricingType || (editingListing.category === 'Services' ? 'starting_at' : 'fixed'));
      setServiceArea(editingListing.serviceArea || 'Colombo & Greater Suburbs');
      setIsEmergency247(Boolean(editingListing.isEmergency247));
      setAdminStatus(editingListing.status || 'approved');
      setAdminIsFeatured(Boolean(editingListing.isFeatured));
      setAdminIsVerifiedPro(Boolean(editingListing.isVerifiedPro));
    } else {
      // Defaults
      setTitle('');
      setCategory('Electronics');
      setLocation('Colombo');
      setPrice('');
      setPhone('');
      setDescription('');
      setImageUrl('');
      setImagePreview('');
      setServiceTrade('AC Repair & Servicing');
      setPricingType('starting_at');
      setServiceArea('Colombo & Greater Suburbs');
      setIsEmergency247(false);
      setAdminStatus('approved');
      setAdminIsFeatured(false);
      setAdminIsVerifiedPro(false);
    }
  }, [editingListing, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onToast('Image size exceeds 5MB. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAIDescription = async () => {
    if (!title.trim()) {
      onToast('Please type an ad title first so AI knows what to write!', 'error');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await api.suggestDescription({
        title: title.trim(),
        category,
        location,
        price: price ? parseFloat(price) : undefined,
      });

      if (res.description) {
        setDescription(res.description);
        onToast(
          res.source === 'gemini'
            ? '✨ AI description generated with Gemini!'
            : '✨ Smart description drafted!',
          'success'
        );
      }
    } catch {
      onToast('Could not generate description automatically. Please write manually.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isService = category === 'Services';
    if (!title.trim() || (!price && pricingType !== 'quote') || !phone.trim() || !description.trim()) {
      onToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Listing> = {
        title: title.trim(),
        category,
        location,
        price: isService && pricingType === 'quote' ? 0 : parseFloat(price || '0'),
        phone: phone.trim(),
        description: description.trim(),
        image: imagePreview || imageUrl.trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        userId: editingListing ? editingListing.userId : (currentUser ? currentUser.id : 'system'),
        serviceTrade: isService ? serviceTrade : undefined,
        pricingType: isService ? pricingType : 'fixed',
        serviceArea: isService ? serviceArea : undefined,
        isEmergency247: isService ? isEmergency247 : false,
        ...(isAdminLoggedIn ? {
          status: adminStatus,
          isFeatured: adminIsFeatured,
          isVerifiedPro: isService ? adminIsVerifiedPro : false,
        } : {}),
      };

      await onSubmitAd(payload, editingListing ? editingListing.id : undefined);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save listing';
      onToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-8 border border-gray-100 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#181920]">
                {isAdminLoggedIn && editingListing
                  ? 'Admin: Edit Listing Details'
                  : (editingListing ? 'Edit Your Advertisement' : 'Post an Ad on HUTA.lk')}
              </h3>
              {isAdminLoggedIn && (
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  Admin Master
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAdminLoggedIn && editingListing
                ? `Administrator Mode — Modify any listing parameter • ID: ${editingListing.id}`
                : 'Reach thousands of prospective buyers across Sri Lanka'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Ad Title <span className="text-[#FF5A36]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Toyota Vitz 2018 or iPhone 15 Pro Max 256GB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-none transition-all"
            />
          </div>

          {/* Category and District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category <span className="text-[#FF5A36]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                District / Base City <span className="text-[#FF5A36]">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialized Fields for Services */}
          {category === 'Services' && (
            <div className="p-3.5 sm:p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A2540] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#FF5A36]" />
                  Professional Service Details
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100/80 font-bold px-2 py-0.5 rounded-md">
                  Service Directory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Specialized Trade / Profession <span className="text-[#FF5A36]">*</span>
                  </label>
                  <select
                    value={serviceTrade}
                    onChange={(e) => setServiceTrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                  >
                    {SERVICE_TRADES.map((trade) => (
                      <option key={trade} value={trade}>
                        {trade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Service Area Coverage <span className="text-[#FF5A36]">*</span>
                  </label>
                  <select
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                  >
                    {SERVICE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Model Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pricing Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'starting_at', label: 'Starting From' },
                    { id: 'hourly', label: 'Per Hour' },
                    { id: 'fixed', label: 'Fixed Job' },
                    { id: 'quote', label: 'Free Estimate / Quote' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPricingType(p.id as any);
                        if (p.id === 'quote') setPrice('0');
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                        pricingType === p.id
                          ? 'bg-[#0A2540] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 24/7 Emergency Service Toggle */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none bg-white/70 p-2.5 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  checked={isEmergency247}
                  onChange={(e) => setIsEmergency247(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF5A36] focus:ring-[#FF5A36] border-gray-300 accent-[#FF5A36]"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900">⚡ 24/7 Emergency Service</span>
                  <span className="text-gray-500 block text-[10px]">
                    Available for urgent callouts (e.g. breakdown, plumbing leak, power fault)
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Price and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {category === 'Services' && pricingType === 'quote'
                  ? 'Pricing'
                  : category === 'Services' && pricingType === 'starting_at'
                  ? 'Starting Rate (LKR) *'
                  : category === 'Services' && pricingType === 'hourly'
                  ? 'Hourly Rate (LKR/hr) *'
                  : 'Price (LKR) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-xs">Rs</span>
                <input
                  type="number"
                  required={!(category === 'Services' && pricingType === 'quote')}
                  disabled={category === 'Services' && pricingType === 'quote'}
                  value={category === 'Services' && pricingType === 'quote' ? '' : price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    category === 'Services' && pricingType === 'quote'
                      ? 'Free Estimate on Request'
                      : '2500'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp <span className="text-[#FF5A36]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="077 XXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
              />
            </div>
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Item Photo (Upload or URL)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#FF5A36] rounded-xl py-2 px-3 text-xs font-semibold text-gray-600 hover:text-[#FF5A36] transition-colors bg-gray-50">
                <UploadCloud className="w-4 h-4" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-gray-400">or</span>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Paste Image URL"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none"
              />
            </div>

            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div className="mt-2 flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-300"
                />
                <span className="text-xs text-gray-600 font-medium">Image ready for publishing</span>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageUrl('');
                  }}
                  className="ml-auto text-xs text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Description with AI Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description <span className="text-[#FF5A36]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] hover:text-[#E04826] bg-[#FF5A36]/10 hover:bg-[#FF5A36]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhance Description</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, features, warranty, usage, reason for selling, and inspection details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-none leading-relaxed"
            />
          </div>

          {/* Admin Moderation & Trust Badge Controls */}
          {isAdminLoggedIn && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Moderation & Badge Controls</span>
                </div>
                {editingListing?.userId && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    Author: {editingListing.userId}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Listing Status
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as 'approved' | 'pending' | 'rejected')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-800 outline-none focus:border-[#FF5A36]"
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="pending">Pending (Review)</option>
                    <option value="rejected">Rejected (Hidden)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={adminIsFeatured}
                      onChange={(e) => setAdminIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#FF5A36] accent-[#FF5A36] rounded"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Feature on Homepage
                    </span>
                  </label>

                  {category === 'Services' && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={adminIsVerifiedPro}
                        onChange={(e) => setAdminIsVerifiedPro(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-emerald-900">
                        HUTA Verified Pro Badge
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#FF5A36]/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Advertisement...</span>
                </>
              ) : (
                <span>
                  {isAdminLoggedIn && editingListing
                    ? 'Save Admin Changes'
                    : editingListing
                    ? 'Update Advertisement'
                    : 'Publish Advertisement'}
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
