import React, { useState } from 'react';
import { Phone, Mail, ArrowUp } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Category } from '../types';

interface FooterProps {
  categories: Category[];
  onSelectCategory?: (categoryName: string) => void;
}

const LOGO_URL =
  'https://i.ibb.co/fYfHj2J8/Polished-Gold-House-Monogram-Logo.png';

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
}) => {
  const { settings } = useSettings();
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF6F0] text-[#1C1917] border-t border-[#E5DBCB] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E8DFC9]">

          {/* Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_URL}
                alt="LUXEUPHO Furniture & Home Interiors"
                width={240}
                height={240}
                loading="eager"
                decoding="async"
                className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 shrink-0 object-contain"
                style={{
                  filter: 'none',
                  opacity: 1,
                  imageRendering: 'auto',
                  transform: 'none',
                }}
              />

              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.16em] text-[#B88E52] block">
                  LUXEUPHO
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B88E52] font-bold">
                  Furniture &amp; Home Interiors
                </span>
              </div>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed max-w-sm font-light">
              Premium modern furniture showroom curating handcrafted
              comfort, architectural stone pieces, and bespoke residential
              sanctuaries across India.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a
                  href={settings.phone ? `tel:${settings.phone}` : undefined}
                  className="hover:text-[#B88E52] transition-colors font-semibold"
                >
                  Customer Care: {settings.phone || 'Contact us'}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={settings.email ? `mailto:${settings.email}` : undefined}
                  className="hover:text-[#B88E52] transition-colors font-semibold break-all"
                >
                  Support: {settings.email || 'Contact us'}
                </a>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#57534E]">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory?.(cat.name)}
                    className="hover:text-[#B88E52] transition-colors text-left font-medium"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <span className="text-[#8C867D]">
                  Custom Sizing &amp; Fabrics
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#57534E]">
              <li>
                <span className="font-medium text-[#1C1917]">
                  Pan-India White-Glove Setup
                </span>
              </li>
              <li>
                <span className="font-medium text-[#1C1917]">
                  5-Year Structural Warranty
                </span>
              </li>
              <li>
                <span className="font-medium text-[#1C1917]">
                  PhonePe &amp; UPI Integration
                </span>
              </li>
              <li>
                <span className="font-medium text-[#1C1917]">
                  7 Days Easy Support Policy
                </span>
              </li>
              <li>
                <a
                  href="#support-section"
                  className="text-[#B88E52] hover:underline font-medium"
                >
                  Book Design Consultation
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#E8DFC9]">
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
                  name="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email address"
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

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <span>
            &copy; {new Date().getFullYear()} LUXEUPHO Furniture &amp; Home
            Interiors. All rights reserved.
          </span>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors font-medium"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#B88E52]" />
          </button>
        </div>

      </div>
    </footer>
  );
};