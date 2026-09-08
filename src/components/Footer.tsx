import React from 'react';
import { ShieldCheck, MapPin, PhoneCall, HelpCircle, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onSelectLocation: (loc: string) => void;
  onOpenPostAd: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectLocation,
  onOpenPostAd,
  onOpenAdminLogin,
}) => {
  return (
    <footer className="bg-[#111217] text-gray-300 border-t border-[#2D2F39] mt-20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#2D2F39]/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#181920] border-2 border-[#2D2F39] flex items-center justify-center p-2 shadow-lg">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                  <rect width="100" height="100" rx="20" fill="#181920" />
                  <rect x="20" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
                  <rect x="62" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
                  <path d="M 24 64 L 76 28 L 76 42 L 24 78 Z" fill="#FFFFFF" />
                  <polygon points="66,16 88,26 74,28" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white tracking-tight">HUTA</span>
                  <span className="text-2xl font-black text-[#FF5A36] tracking-tight">.lk</span>
                </div>
                <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mt-1">
                  Sri Lanka Marketplace
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Sri Lanka's trusted trading platform. Buy, sell, and find anything from vehicles and smartphones to houses and local services across all 25 districts.
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#FF5A36]" />
                Verified Listings
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin className="w-4 h-4 text-[#FF5A36]" />
                All 25 Districts
              </span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Vehicles', 'Electronics', 'Property', 'Motorcycles', 'Home & Garden'].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF5A36] transition-colors"
                  >
                    {cat} in Sri Lanka
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Districts */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Key Locations
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Kurunegala'].map((loc) => (
                <li key={loc}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF5A36] transition-colors"
                  >
                    Ads in {loc}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Safety & Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenPostAd}
                  className="hover:text-[#FF5A36] transition-colors font-semibold text-white flex items-center gap-1"
                >
                  <span>Post Free Advertisement</span>
                </button>
              </li>
              <li>
                <span className="text-xs text-amber-400/90 block leading-snug">
                  Always inspect goods in person in a safe, public place before transferring funds.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HUTA Sri Lanka. All prices in Sri Lankan Rupees (LKR).</p>
          <div className="flex items-center gap-4">
            <span>Fast & Secure Trading</span>
            <span>•</span>
            <span>Gemini AI Listing Assistant</span>
            <span>•</span>
            <button
              type="button"
              id="footer-staff-portal"
              onClick={onOpenAdminLogin}
              className="text-gray-600 hover:text-gray-400 transition-opacity opacity-30 hover:opacity-90 p-0.5 cursor-pointer"
              title="Staff Portal"
              aria-label="Staff Portal"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
