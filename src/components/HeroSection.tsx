import React from 'react';
import { ShieldCheck, Truck, CreditCard, Headphones, ArrowRight } from 'lucide-react';
import { Banner } from '../types';
import { BannerSlider } from './BannerSlider';

interface HeroSectionProps {
  banners?: Banner[];
  onShopNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ banners = [], onShopNow }) => {
  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* Dynamic 5s Auto-Sliding Banner or Reference Hero */}
      {banners.length > 0 ? (
        <BannerSlider banners={banners} onCtaClick={onShopNow} />
      ) : (
        /* Static fallback matching the reference screenshot */
        <div className="relative w-full min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden bg-[#2D2A26]">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury Living Starts Here"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-20">
            <div className="max-w-xl text-white">
              <span className="text-xs sm:text-sm font-normal tracking-[0.25em] uppercase text-[#EAD0A8] block mb-3 font-sans">
                PREMIUM FURNITURE COLLECTION
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-wide leading-[1.15] mb-5">
                Luxury Living <br /> Starts Here
              </h1>

              <p className="text-sm sm:text-base text-[#F5F5F4] font-light leading-relaxed mb-8 max-w-md">
                Beautiful furniture. Timeless designs. <br />
                For a home that feels like you.
              </p>

              <button
                onClick={onShopNow}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#B88E52] hover:bg-[#A57D43] text-white font-normal text-sm tracking-wider uppercase rounded-md transition-all shadow-md group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Value Propositions Bar (4 badges on white background) */}
      <div className="bg-white border-b border-[#E7E5E4] py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* 1. Premium Quality */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Premium Quality
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  Built to last
                </p>
              </div>
            </div>

            {/* 2. Fast Delivery */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Fast Delivery
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  Across India
                </p>
              </div>
            </div>

            {/* 3. Secure Payment */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <CreditCard className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Secure Payment
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  PhonePe &amp; UPI Only
                </p>
              </div>
            </div>

            {/* 4. Easy Support */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <Headphones className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Easy Support
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  We're here to help
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
