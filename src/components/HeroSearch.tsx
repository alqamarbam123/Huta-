import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, RotateCcw, Sparkles } from 'lucide-react';

interface HeroSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const DISTRICTS = [
  'All Sri Lanka',
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

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <section className="relative bg-[#111217] text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#2D2F39] overflow-hidden">
      {/* Background ambient glow circles with gentle floating movement */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 -left-20 w-80 h-80 bg-[#FF5A36] rounded-full blur-3xl pointer-events-none -translate-y-1/2"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -top-10 right-0 w-96 h-96 bg-[#FF5A36] rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Animated Badge & Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Sri Lanka's Direct Buyer-Seller Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Buy & Sell Anything in{' '}
            <span className="text-[#FF5A36] underline decoration-wavy decoration-[#FF5A36]/40 underline-offset-8">
              Sri Lanka
            </span>
          </h1>
          <p className="text-[#9CA3AF] text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Discover verified vehicles, smartphones, real estate, and services across all 25 districts with direct phone & WhatsApp contact.
          </p>
        </motion.div>

        {/* Search Bar Container with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#181920] border border-[#2D2F39] p-2.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-2 text-left"
        >
          {/* Text Input */}
          <div className="flex items-center gap-2.5 bg-[#22242F] px-3.5 py-2.5 rounded-xl flex-1 border border-transparent focus-within:border-[#FF5A36] transition-colors">
            <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="What are you looking for? (e.g. Vitz, iPhone 15, Kandy house...)"
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400"
            />
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 bg-[#22242F] px-3.5 py-2.5 rounded-xl md:w-56 shrink-0 border border-transparent focus-within:border-[#FF5A36] transition-colors">
            <MapPin className="w-5 h-5 text-[#FF5A36] shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-[#181920] text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2 bg-[#22242F] px-3 py-2 rounded-xl md:w-64 shrink-0 border border-transparent focus-within:border-[#FF5A36] transition-colors">
            <span className="text-xs text-[#9CA3AF] font-bold">Rs</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="bg-transparent border border-[#3D3F4A] rounded px-2 py-1 text-white text-xs w-full outline-none focus:border-[#FF5A36]"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="bg-transparent border border-[#3D3F4A] rounded px-2 py-1 text-white text-xs w-full outline-none focus:border-[#FF5A36]"
            />
          </div>

          {/* Reset Filters CTA if filtered */}
          {hasActiveFilters && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetFilters}
              title="Reset Search Filters"
              className="flex items-center justify-center gap-1 px-3.5 py-2 bg-[#22242F] hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

