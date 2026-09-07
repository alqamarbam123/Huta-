import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Listing, User } from '../types';
import { X, Sparkles, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { api } from '../services/api';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAd: (data: Partial<Listing>, isEditId?: string) => Promise<void>;
  editingListing: Listing | null;
  currentUser: User | null;
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

    if (!title.trim() || !price || !phone.trim() || !description.trim()) {
      onToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Listing> = {
        title: title.trim(),
        category,
        location,
        price: parseFloat(price),
        phone: phone.trim(),
        description: description.trim(),
        image: imagePreview || imageUrl.trim() || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        userId: currentUser ? currentUser.id : 'system',
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
            <h3 className="text-xl font-extrabold text-[#181920]">
              {editingListing ? 'Edit Your Advertisement' : 'Post an Ad on HUTA.lk'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Reach thousands of prospective buyers across Sri Lanka
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
                District / Location <span className="text-[#FF5A36]">*</span>
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

          {/* Price and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Price (LKR) <span className="text-[#FF5A36]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-xs">Rs</span>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Phone <span className="text-[#FF5A36]">*</span>
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
                <span>{editingListing ? 'Update Advertisement' : 'Publish Advertisement'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
