import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Pause, Play, ArrowRight } from 'lucide-react';
import { Banner } from '../types';

interface BannerSliderProps {
  banners: Banner[];
  onCtaClick?: (link: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners, onCtaClick }) => {
  const activeBanners = banners.filter(b => b.isActive !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Requirement: Auto-slide every 5 seconds (5000ms) with manual pause on hover
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeBanners.length, currentIndex]);

  const handleCta = (link: string) => {
    if (onCtaClick) {
      onCtaClick(link);
    } else if (link.startsWith('#')) {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-[#2D2A26] min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Banner Background Images with Cross-Fade */}
      {activeBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.03] transition-transform duration-[6000ms] ease-out scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85';
            }}
          />
          {/* Subtle warm luxury vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>
      ))}

      {/* Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
        <div className="max-w-2xl text-white">
          
          {/* Badge */}
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#EAD0A8]/40 text-[#EAD0A8] text-xs font-semibold tracking-[0.2em] uppercase mb-4 animate-in fade-in duration-500">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E52]" />
              <span>{currentBanner.badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-5 drop-shadow-sm">
            {currentBanner.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[#F5F5F4] font-light leading-relaxed mb-8 max-w-xl">
            {currentBanner.subtitle}
          </p>

          {/* CTA Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleCta(currentBanner.buttonLink || '#furniture-section')}
              className="px-7 py-3.5 sm:px-8 sm:py-4 bg-[#B88E52] hover:bg-[#A57D43] text-white font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-md shadow-lg transition-all flex items-center gap-2 group"
            >
              <span>{currentBanner.buttonText || 'Shop Now →'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#support-section"
              className="px-6 py-3.5 sm:px-7 sm:py-4 border border-white/40 text-white font-medium text-xs sm:text-sm tracking-wider uppercase rounded-md hover:bg-white/15 transition-all backdrop-blur-sm"
            >
              Private Consultation
            </a>
          </div>

        </div>
      </div>

      {/* Manual Previous / Next Arrow Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-[#B88E52] text-white transition-all backdrop-blur-md border border-white/20 group"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-[#B88E52] text-white transition-all backdrop-blur-md border border-white/20 group"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Bottom Controls: Pagination Dots & Pause/Play Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
        {activeBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 h-2 bg-[#B88E52]'
                : 'w-2 h-2 bg-white/40 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="ml-2 text-white/60 hover:text-white transition-colors"
          title={isPaused ? 'Resume 5s auto-play' : 'Pause 5s auto-play'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>

    </div>
  );
};
