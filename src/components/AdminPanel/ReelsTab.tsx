import React, { useState } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  Heart,
  CheckCircle2,
  Sparkles,
  Instagram,
  RefreshCw
} from 'lucide-react';
import { InstagramReel } from '../../types';
import { saveReel, deleteReel } from '../../firebase/firestore';

interface ReelsTabProps {
  reels: InstagramReel[];
}

export const ReelsTab: React.FC<ReelsTabProps> = ({ reels }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<InstagramReel | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/luxeupho_shops/');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [badge, setBadge] = useState('NEW REEL');
  const [views, setViews] = useState('15.2K');
  const [likes, setLikes] = useState('2.1K');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);

  const openAddModal = () => {
    setEditingReel(null);
    setTitle('');
    setCaption('');
    setInstagramUrl('https://www.instagram.com/luxeupho_shops/');
    setVideoUrl('');
    setThumbnailUrl('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85');
    setBadge('NEW REEL');
    setViews('15.4K');
    setLikes('2.2K');
    setIsActive(true);
    setSortOrder(reels.length + 1);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (reel: InstagramReel) => {
    setEditingReel(reel);
    setTitle(reel.title);
    setCaption(reel.caption || '');
    setInstagramUrl(reel.instagramUrl || 'https://www.instagram.com/luxeupho_shops/');
    setVideoUrl(reel.videoUrl || '');
    setThumbnailUrl(reel.thumbnailUrl);
    setBadge(reel.badge || 'NEW REEL');
    setViews(reel.views || '12.0K');
    setLikes(reel.likes || '1.8K');
    setIsActive(reel.isActive !== false);
    setSortOrder(reel.sortOrder || 1);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for the reel.');
      return;
    }
    if (!thumbnailUrl.trim()) {
      setErrorMsg('Please provide a thumbnail or cover image URL.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await saveReel({
        id: editingReel ? editingReel.id : undefined,
        title: title.trim(),
        caption: caption.trim(),
        instagramUrl: instagramUrl.trim() || 'https://www.instagram.com/luxeupho_shops/',
        videoUrl: videoUrl.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim(),
        badge: badge.trim() || 'REEL',
        views: views.trim() || '10K',
        likes: likes.trim() || '1.5K',
        isActive,
        sortOrder: Number(sortOrder) || 1,
      });

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save reel:', err);
      setErrorMsg(err.message || 'Failed to save reel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reelId: string, reelTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove "${reelTitle}"?`)) {
      return;
    }
    try {
      await deleteReel(reelId);
    } catch (err) {
      console.error('Failed to delete reel:', err);
      alert('Could not delete reel. Check connection.');
    }
  };

  const toggleReelStatus = async (reel: InstagramReel) => {
    try {
      await saveReel({
        ...reel,
        isActive: !reel.isActive,
      });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
              <Instagram className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
              Instagram Reels Showcase
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] font-light max-w-xl">
            Manage the Instagram reels displayed on your homepage. When you post a new video on <strong className="font-medium text-[#1C1917]">@luxeupho_shops</strong>, add it here to immediately show it live to all customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/luxeupho_shops/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-[#1C1917] text-xs font-medium hover:bg-[#FAF8F5] transition-colors inline-flex items-center gap-2"
          >
            <span>Open @luxeupho_shops</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#78716C]" />
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#B88E52] hover:bg-[#A07A43] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Reel</span>
          </button>
        </div>
      </div>

      {/* Reels List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Thumbnail Header with Aspect Ratio */}
            <div className="relative aspect-[16/10] bg-[#1C1917] overflow-hidden">
              <img
                src={reel.thumbnailUrl}
                alt={reel.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-sm text-white border border-white/20">
                  {reel.badge || 'REEL'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleReelStatus(reel)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase cursor-pointer transition-colors ${
                    reel.isActive !== false
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-stone-500/90 text-white'
                  }`}
                >
                  {reel.isActive !== false ? 'Live on Site' : 'Hidden'}
                </button>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-white/80" />
                    {reel.views || '0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-white/80" />
                    {reel.likes || '0'}
                  </span>
                </div>
                {reel.videoUrl && (
                  <span className="px-1.5 py-0.5 rounded bg-[#B88E52] text-[10px] font-bold text-white uppercase">
                    MP4 Active
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#1C1917] line-clamp-1 mb-1">
                  {reel.title}
                </h3>
                {reel.caption && (
                  <p className="text-xs text-[#78716C] line-clamp-2 font-light">
                    {reel.caption}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#F5F5F4] flex items-center justify-between text-xs">
                <a
                  href={reel.instagramUrl || 'https://www.instagram.com/luxeupho_shops/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B88E52] hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                >
                  <span>View on Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(reel)}
                    className="p-1.5 rounded-lg border border-[#E7E5E4] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
                    title="Edit Reel"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(reel.id, reel.title)}
                    className="p-1.5 rounded-lg border border-[#E7E5E4] text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Reel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Reel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E5E4] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#B88E52] border border-[#E7E5E4]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                    {editingReel ? 'Edit Instagram Reel' : 'Add New Instagram Reel'}
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Sync with @luxeupho_shops on the live storefront
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Instagram URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Instagram Reel / Post URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C.../ or https://www.instagram.com/luxeupho_shops/"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6D3D1] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#B88E52]"
                />
                <span className="text-[11px] text-[#78716C] mt-1 block">
                  Link to the reel on your Instagram profile @luxeupho_shops
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Reel Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sovereign Curved Sectional Reveal"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6D3D1] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#B88E52]"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Brief note about the craft, materials, or showroom styling..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6D3D1] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#B88E52]"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Cover / Thumbnail Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or uploaded photo URL"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6D3D1] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#B88E52]"
                />
              </div>

              {/* Optional Video MP4 URL for native player */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Direct Video MP4 URL (Optional)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4 (For instant video playback inside website modal)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6D3D1] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#B88E52]"
                />
                <span className="text-[11px] text-[#78716C] mt-1 block">
                  Provide an MP4 link for smooth in-page video playback, or leave blank to rely on Instagram link.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Badge */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="NEW REEL / ATELIER"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D3D1] bg-[#FAF8F5]"
                  />
                </div>

                {/* Views */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Views Count
                  </label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="24.8K"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D3D1] bg-[#FAF8F5]"
                  />
                </div>

                {/* Likes */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Likes Count
                  </label>
                  <input
                    type="text"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="3.1K"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D3D1] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Status & Sort Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1C1917]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B88E52] border-[#D6D3D1] focus:ring-[#B88E52]"
                  />
                  <span>Active &amp; Visible on Live Storefront</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#78716C]">Order:</span>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs rounded border border-[#D6D3D1]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5F5F4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D6D3D1] text-xs font-medium text-[#57534E] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#B88E52] hover:bg-[#A07A43] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingReel ? 'Update Reel' : 'Publish Reel to Site'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
