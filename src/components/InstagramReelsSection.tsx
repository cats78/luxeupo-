import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Eye,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  Instagram
} from 'lucide-react';
import { InstagramReel } from '../types';

interface InstagramReelsSectionProps {
  reels: InstagramReel[];
  instagramUrl?: string;
  instagramHandle?: string;
}

export const InstagramReelsSection: React.FC<InstagramReelsSectionProps> = ({
  reels,
  instagramUrl = 'https://www.instagram.com/luxeupho_shops/',
  instagramHandle = 'luxeupho_shops',
}) => {
  const activeReels = reels.filter((r) => r.isActive !== false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedReelIds, setLikedReelIds] = useState<string[]>([]);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const currentReel = selectedReelIndex !== null ? activeReels[selectedReelIndex] : null;

  // Reset playback when modal reel changes
  useEffect(() => {
    if (currentReel) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay policy might require mute
          setIsMuted(true);
        });
      }
    }
  }, [selectedReelIndex, currentReel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLike = (reelId: string) => {
    setLikedReelIds((prev) =>
      prev.includes(reelId) ? prev.filter((id) => id !== reelId) : [...prev, reelId]
    );
  };

  const handleShare = (reel: InstagramReel) => {
    const url = reel.instagramUrl || instagramUrl;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handlePrevReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedReelIndex === null || activeReels.length === 0) return;
    setSelectedReelIndex((prev) => (prev! > 0 ? prev! - 1 : activeReels.length - 1));
  };

  const handleNextReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedReelIndex === null || activeReels.length === 0) return;
    setSelectedReelIndex((prev) => (prev! < activeReels.length - 1 ? prev! + 1 : 0));
  };

  return (
    <section id="instagram-reels-section" className="w-full bg-[#FAF8F5] py-14 sm:py-20 border-t border-[#E7E5E4] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Instagram Header with Profile Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#F9EDDF] via-white to-[#F9EDDF] border border-[#B88E52]/30 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E1306C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E1306C]"></span>
              </span>
              <span className="text-[11px] font-medium tracking-widest uppercase text-[#B88E52]">
                Official Instagram Feed &amp; Reels
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Instagram Gradient Ring Avatar */}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm">
                <div className="bg-white p-0.5 rounded-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1C1917] flex items-center justify-center text-white">
                    <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                    LEXUPHO on Instagram
                  </h2>
                  <span title="Verified Showroom Account">
                    <CheckCircle2 className="w-5 h-5 text-[#3897f0] fill-[#3897f0] text-white" />
                  </span>
                </div>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-medium text-[#78716C] hover:text-[#B88E52] transition-colors inline-flex items-center gap-1.5"
                >
                  @{instagramHandle}
                  <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
                </a>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#78716C] max-w-xl font-light">
              Watch our master artisans shaping seasoned teak, explore bespoke upholstery reveals, and discover luxury styling in motion.
            </p>
          </div>

          {/* Action buttons & carousel arrows */}
          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-95 transition-opacity shadow-sm"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @{instagramHandle}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {activeReels.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-full border border-[#D6D3D1] bg-white hover:bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  aria-label="Previous Reels"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-full border border-[#D6D3D1] bg-white hover:bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  aria-label="Next Reels"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reels Showcase or Luxury 'Coming Soon With New Reels' State */}
        {activeReels.length === 0 ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] rounded-3xl border border-[#C5A880]/30 p-8 sm:p-14 text-center text-white shadow-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#B88E52]/20 via-[#E1306C]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              {/* Instagram Story Ring Animated Badge */}
              <div className="inline-flex p-1 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg">
                <div className="bg-[#1C1917] p-3 rounded-full">
                  <Instagram className="w-8 h-8 text-[#FAF8F5]" />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#C5A880] block font-sans">
                  @{instagramHandle} • Official Instagram
                </span>
                <h3 className="font-serif text-2xl sm:text-4xl font-normal tracking-wide text-[#FAF8F5]">
                  We Are Coming Soon With New Reels
                </h3>
                <p className="text-xs sm:text-sm text-[#D6D3D1] font-light leading-relaxed max-w-xl mx-auto">
                  We are filming and curating brand new showroom reels. Follow our official Instagram page to be the first to experience our handcrafted bespoke sofa reveals, behind-the-scenes atelier woodworking, and modern sanctuary transformations the moment we upload them!
                </p>
              </div>

              {/* 3 Luxury Coming Soon Teaser Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] mb-1">
                    Atelier Craft
                  </div>
                  <div className="text-xs font-medium text-white">
                    Teak Joinery &amp; Woodwork
                  </div>
                  <div className="text-[11px] text-white/60 font-light mt-0.5">
                    Live from our master workshop
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] mb-1">
                    New Arrivals
                  </div>
                  <div className="text-xs font-medium text-white">
                    Curved Velvet &amp; Bouclé
                  </div>
                  <div className="text-[11px] text-white/60 font-light mt-0.5">
                    Signature luxury silhouettes
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] mb-1">
                    Styling Notes
                  </div>
                  <div className="text-xs font-medium text-white">
                    Penthouse Transformations
                  </div>
                  <div className="text-[11px] text-white/60 font-light mt-0.5">
                    White-glove space setups
                  </div>
                </div>
              </div>

              {/* Direct Follow & Watch on Instagram Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Visit @{instagramHandle} on Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <span className="block text-[11px] text-[#A8A29E] font-light">
                Once new reels are uploaded, they will automatically appear here with in-page playback.
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeReels.map((reel, index) => {
              const isLiked = likedReelIds.includes(reel.id);
              const targetReelUrl = reel.instagramUrl || instagramUrl;

              return (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReelIndex(index)}
                  className="group relative flex-shrink-0 w-[240px] sm:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#1C1917] border border-[#E7E5E4] shadow-sm hover:shadow-xl hover:border-[#B88E52] transition-all duration-300 snap-start cursor-pointer select-none"
                >
                  {/* Thumbnail Cover or Live Preview */}
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Dark Vignette Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 group-hover:from-black/90 transition-colors" />

                  {/* Top Bar: Badge + Instagram Logo */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/50 backdrop-blur-md text-white border border-white/20">
                      {reel.badge || 'REEL'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:bg-[#E1306C] transition-colors">
                      <Instagram className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Center Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-[#B88E52] group-hover:border-[#B88E52] shadow-lg">
                      <Play className="w-6 h-6 ml-1 fill-white" />
                    </div>
                  </div>

                  {/* Bottom Info: Title, Likes, Views, and Instagram CTA */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white space-y-2">
                    <h3 className="font-serif text-sm sm:text-base font-normal leading-snug line-clamp-2 drop-shadow-sm text-white group-hover:text-[#F3E5D0] transition-colors">
                      {reel.title}
                    </h3>

                    {reel.caption && (
                      <p className="text-[11px] text-white/70 line-clamp-1 font-light">
                        {reel.caption}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/15 text-[11px] text-white/80">
                      <div className="flex items-center gap-3">
                        {reel.views && (
                          <span className="flex items-center gap-1 font-sans">
                            <Eye className="w-3.5 h-3.5 text-white/70" />
                            {reel.views}
                          </span>
                        )}
                        {reel.likes && (
                          <span className="flex items-center gap-1 font-sans">
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#E1306C] text-[#E1306C]' : 'text-white/70'}`} />
                            {reel.likes}
                          </span>
                        )}
                      </div>

                      {/* Direct link out to Instagram */}
                      <a
                        href={targetReelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] hover:text-white flex items-center gap-1 transition-colors"
                        title="Watch on Instagram"
                      >
                        Instagram
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Instagram Reel Video Player Modal */}
      {currentReel && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedReelIndex(null)}
        >
          {/* Main Reel Frame (Exact 9:16 vertical ratio) */}
          <div
            className="relative w-full max-w-[400px] h-[85vh] max-h-[780px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Video or Image */}
            <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
              {currentReel.videoUrl ? (
                <video
                  ref={videoRef}
                  src={currentReel.videoUrl}
                  poster={currentReel.thumbnailUrl}
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />
              ) : (
                <img
                  src={currentReel.thumbnailUrl}
                  alt={currentReel.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Pause overlay icon if video is paused */}
              {!isPlaying && currentReel.videoUrl && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Top Header Bar Overlay */}
              <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white">
                      <Instagram className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs tracking-wide">
                        @{instagramHandle}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3897f0] fill-[#3897f0]" />
                    </div>
                    <span className="text-[10px] text-white/70 block">
                      LEXUPHO Furniture Studio
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full bg-white text-black font-semibold text-[11px] hover:bg-[#FAF8F5] transition-colors"
                  >
                    Follow
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedReelIndex(null)}
                    className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Instagram Sidebar Actions */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20 text-white">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => toggleLike(currentReel.id)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
                    <Heart
                      className={`w-5 h-5 ${
                        likedReelIds.includes(currentReel.id)
                          ? 'fill-[#E1306C] text-[#E1306C]'
                          : 'text-white'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-sans font-medium">
                    {currentReel.likes || 'Like'}
                  </span>
                </button>

                {/* Sound Toggle */}
                {currentReel.videoUrl && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-[10px] font-sans font-medium">
                      {isMuted ? 'Muted' : 'Sound'}
                    </span>
                  </button>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShare(currentReel)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  title="Share link"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-sans font-medium">Share</span>
                </button>

                {/* Open Directly in Instagram */}
                <a
                  href={currentReel.instagramUrl || instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  title="Open on Instagram"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-sans font-medium">Open</span>
                </a>
              </div>

              {/* Bottom Caption & Watch on Instagram CTA */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 text-white space-y-3">
                <div>
                  <h4 className="font-serif text-sm font-normal text-white drop-shadow-sm mb-1">
                    {currentReel.title}
                  </h4>
                  {currentReel.caption && (
                    <p className="text-[11px] text-white/80 font-light leading-relaxed line-clamp-2">
                      {currentReel.caption}
                    </p>
                  )}
                </div>

                {/* High-visibility direct link to run reel on Instagram */}
                <a
                  href={currentReel.instagramUrl || instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Watch on Instagram @{instagramHandle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Next / Prev overlay buttons for desktop */}
            {activeReels.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevReel}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white hidden md:flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
                  aria-label="Previous reel"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextReel}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white hidden md:flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
                  aria-label="Next reel"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Link copied toast */}
            {copiedToast && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/90 text-white text-xs rounded-full border border-white/20 shadow-lg z-30 animate-in fade-in">
                Reel link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
