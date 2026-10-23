import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { Banner } from '../../types';
import { saveBanner, deleteBanner } from '../../firebase/firestore';
import { uploadImageToStorage } from '../../firebase/storageUpload';

interface BannersTabProps {
  banners: Banner[];
}

export const BannersTab: React.FC<BannersTabProps> = ({ banners }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [buttonLink, setButtonLink] = useState('#collections');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('THE ATELIER COLLECTION 2026');
    setImageUrl('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85');
    setButtonText('Explore Collection');
    setButtonLink('#furniture-section');
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setUploadError('');
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setBadge(banner.badge || '');
    setImageUrl(banner.imageUrl);
    setButtonText(banner.buttonText || 'Explore Collection');
    setButtonLink(banner.buttonLink || '#furniture-section');
    setSortOrder(banner.sortOrder || 1);
    setIsActive(banner.isActive !== false);
    setUploadError('');
    setModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const url = await uploadImageToStorage(file, 'banners', (prog) => {
        setUploadProgress(prog);
      });
      setImageUrl(url);
    } catch (err: any) {
      console.error('Banner image upload error:', err);
      setUploadError(err.message || 'Image upload failed. Please try a valid PNG or JPG.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setSaving(true);
    try {
      const bannerId = editingBanner ? editingBanner.id : `banner-${Date.now()}`;
      const payload: Banner = {
        id: bannerId,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim(),
        buttonText: buttonText.trim() || 'Explore Collection',
        buttonLink: buttonLink.trim() || '#furniture-section',
        sortOrder: Number(sortOrder) || 1,
        isActive: Boolean(isActive),
      };

      await saveBanner(payload);
      setModalOpen(false);
    } catch (err) {
      console.error('Save banner error:', err);
      setUploadError('Failed to save banner to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this showcase banner?')) {
      try {
        await deleteBanner(id);
      } catch (err) {
        console.error('Delete banner error:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Sliding Banner System
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Configure homepage hero carousels, editorial slogans, and button destinations.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-sm border border-[#E8E2D9] p-4 flex flex-col md:flex-row items-center gap-5 shadow-sm hover:border-[#9A7B4F] transition-all"
          >
            <div className="relative w-full md:w-56 aspect-[16/9] bg-[#121214] rounded overflow-hidden shrink-0">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-[#C5A880] text-[10px] font-bold uppercase rounded">
                Slide #{b.sortOrder}
              </span>
            </div>

            <div className="flex-1 space-y-1">
              {b.badge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#9A7B4F] uppercase">
                  <Sparkles className="w-3 h-3" />
                  {b.badge}
                </span>
              )}
              <h3 className="font-serif-luxury text-lg font-bold text-[#121214]">
                {b.title}
              </h3>
              <p className="text-xs text-[#736D64] font-light leading-relaxed line-clamp-2">
                {b.subtitle}
              </p>
              <div className="text-[11px] text-[#8C867D] pt-1">
                Button: <strong className="text-[#121214]">{b.buttonText}</strong> &rarr; Link: <code className="bg-[#FAF9F6] px-1 py-0.5 border rounded">{b.buttonLink}</code>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#F0EBE1]">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {b.isActive ? 'Active' : 'Disabled'}
              </span>
              <button
                onClick={() => openEdit(b)}
                className="p-2 text-[#736D64] hover:text-[#9A7B4F] hover:bg-[#FAF9F6] rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 text-[#736D64] hover:text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal with safe boundaries and scrolling */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full my-6 border border-[#E8E2D9] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            <div className="p-4 sm:p-5 bg-[#121214] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#E5D5BA]">
                  {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Create Hero Banner Slide'}
                </h3>
                <span className="text-[11px] text-[#A89F91]">
                  Configure homepage hero slide image, editorial copy, and call-to-action button.
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. THE ATELIER COLLECTION 2026"
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LUXURY LIVING STARTS HERE"
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                  Subtitle / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Curated architectural luxury pieces crafted with seasoned teak, bouclé, and solid brass..."
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#121214] uppercase tracking-wider">
                  Banner Image (PNG, JPG • High Resolution) *
                </label>

                {isUploading && (
                  <div className="p-3 bg-[#FAF8F5] border border-[#B88E52]/30 rounded space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#121214]">
                      <span>Processing & Uploading Hero Banner...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E8E2D9] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#B88E52] h-full transition-all duration-200 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <label className="px-3.5 py-2 bg-white border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white rounded cursor-pointer transition-colors flex items-center gap-1.5 font-bold shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Upload File (PNG / JPG)'}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      disabled={isUploading}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="or paste image URL (https://...)"
                    className="flex-1 w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>
                {imageUrl && (
                  <div className="aspect-[16/7] rounded overflow-hidden border border-[#DCD5C9] bg-black mt-2">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    Button Link Destination
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#F0EBE1]">
                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    Slide Sequence Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#9A7B4F] w-4 h-4"
                    />
                    <span className="font-semibold text-[#121214]">Active in Carousel</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E8E2D9] sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[#DCD5C9] text-[#736D64] hover:bg-[#FAF9F6] rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isUploading}
                  className="px-6 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white font-bold rounded uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
