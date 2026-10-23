import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, Sparkles, ArrowUp } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Category } from '../types';

interface FooterProps {
  categories: Category[];
  onSelectCategory?: (categoryName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, onSelectCategory }) => {
  const { settings } = useSettings();
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF6F0] text-[#1C1917] border-t border-[#E5DBCB] pt-16 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E8DFC9]">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">
                <img
                  src={settings.logoUrl || 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png'}
                  alt="Luxeupho-Gold-Home-Interiors-Emblem"
                  className="h-16 sm:h-20 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png';
                  }}
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.16em] text-[#1C1917] block">
                  LUXEUPHO
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B88E52] font-bold">
                  Furniture & Home Interiors
                </span>
              </div>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed max-w-sm font-light">
              Premium modern furniture showroom curating handcrafted comfort, architectural stone pieces, and bespoke residential sanctuaries across India.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-[#1C1917]">
                <div className="w-7 h-7 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a href={`tel:${settings.phone}`} className="hover:text-[#B88E52] transition-colors font-semibold">
                  Customer Care: {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#1C1917]">
                <div className="w-7 h-7 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href={`mailto:${settings.email}`} className="hover:text-[#B88E52] transition-colors font-semibold break-all">
                  Support: {settings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories (1 col) */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1C1917] uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#57534E]">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                    className="hover:text-[#B88E52] transition-colors text-left font-medium"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <span className="text-[#8C867D]">Custom Sizing & Fabrics</span>
              </li>
            </ul>
          </div>

          {/* Customer Care & Assurance (1 col) */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1C1917] uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#57534E]">
              <li>
                <span className="text-[#1C1917] font-medium">Pan-India White-Glove Setup</span>
              </li>
              <li>
                <span className="text-[#1C1917] font-medium">5-Year Structural Warranty</span>
              </li>
              <li>
                <span className="text-[#1C1917] font-medium">PhonePe & UPI Integration</span>
              </li>
              <li>
                <span className="text-[#1C1917] font-medium">7 Days Easy Support Policy</span>
              </li>
              <li>
                <a href="#support-section" className="text-[#B88E52] hover:underline font-medium">
                  Book Design Consultation
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Exclusive Access (1 col) */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1C1917] uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
              Stay Informed
            </h4>
            <p className="text-xs text-[#57534E] leading-relaxed mb-3">
              Receive updates on new collections and showroom announcements.
            </p>
            {subscribed ? (
              <div className="p-3 bg-[#FAF0DD] border border-[#E5D5BA] rounded-md text-[#B88E52] text-xs font-medium">
                Thank you for subscribing to LUXEUPHO updates.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] text-[#1C1917] rounded-md focus:border-[#B88E52] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#B88E52] text-white text-xs uppercase font-bold tracking-wider rounded-md hover:bg-[#A57D43] transition-colors shadow-sm"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar in warm golden theme */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} LUXEUPHO Furniture &amp; Home Interiors. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors font-medium"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#B88E52]" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
