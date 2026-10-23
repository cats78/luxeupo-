import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Upload, Tag, Check, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { saveCategory, deleteCategory } from '../../firebase/firestore';
import { uploadImageToStorage } from '../../firebase/storageUpload';

interface CategoriesTabProps {
  categories: Category[];
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80');
    setSubcategories(['L-Shape Sofas', 'Chesterfields', 'Recliners']);
    setNewSubcatInput('');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image);
    setSubcategories(cat.subcategories && cat.subcategories.length > 0 ? [...cat.subcategories] : []);
    setNewSubcatInput('');
    setSortOrder(cat.sortOrder || 1);
    setIsActive(cat.isActive !== false);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setUploadingImage(true);
    setUploadProgress(10);

    try {
      const url = await uploadImageToStorage(file, 'categories', (prog) => {
        setUploadProgress(prog);
      });
      setImage(url);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMessage(err.message || 'Image upload failed. Please try a valid PNG or JPG under 5MB.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleAddSubcategory = () => {
    const trimmed = newSubcatInput.trim();
    if (trimmed && !subcategories.includes(trimmed)) {
      setSubcategories([...subcategories, trimmed]);
      setNewSubcatInput('');
    }
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMessage('');
    try {
      const catId = editingCategory ? editingCategory.id : `cat-${Date.now()}`;
      const payload: Category = {
        id: catId,
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
        subcategories: subcategories.filter(Boolean),
        sortOrder: Number(sortOrder) || 1,
        isActive: Boolean(isActive),
      };

      await saveCategory(payload);
      setModalOpen(false);
    } catch (err: any) {
      console.error('Save category error:', err);
      setErrorMessage('Failed to save category. Please check database permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (err) {
        console.error('Delete category error:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Category & Space Management
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Organize furniture spaces, subcategory tags, and cover photography.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] bg-[#F3F1EC] overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded uppercase font-bold">
                  Order: {cat.sortOrder}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-serif-luxury text-base font-bold text-[#121214] mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#736D64] line-clamp-2 font-light mb-2">
                  {cat.description || 'No description provided.'}
                </p>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cat.subcategories.map((sub, i) => (
                      <span key={i} className="text-[10px] bg-[#FAF9F6] border border-[#E8E2D9] text-[#5C564D] px-1.5 py-0.5 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] border-t border-[#E8E2D9] flex items-center justify-between text-xs">
              <span className={`text-[10px] font-bold uppercase ${cat.isActive ? 'text-green-700' : 'text-gray-400'}`}>
                {cat.isActive ? 'Active' : 'Hidden'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1 text-[#736D64] hover:text-[#9A7B4F]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 text-[#736D64] hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal with safe boundaries and scrolling */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full my-6 border border-[#E8E2D9] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#121214] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#E5D5BA]">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'Create Furniture Space / Category'}
                </h3>
                <span className="text-[11px] text-[#A89F91]">
                  Configure catalogue taxonomy, subcategories, and visual showcase card.
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sofas & Seating"
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. sofas-and-seating"
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of this collection for showcase and category carousels..."
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              {/* Cover Image Upload & URL */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#121214] uppercase tracking-wider">
                  Cover Photography (PNG, JPG • Max 10MB) *
                </label>

                {uploadingImage && (
                  <div className="p-3 bg-[#FAF8F5] border border-[#B88E52]/30 rounded space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#121214]">
                      <span>Processing & Uploading Category Image...</span>
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
                  <label className="px-3 py-2 bg-white border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white rounded cursor-pointer transition-colors flex items-center gap-1.5 font-bold shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? `Uploading ${uploadProgress}%...` : 'Upload PNG/JPG'}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="or paste image URL (https://...)"
                    className="flex-1 w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                {image && (
                  <div className="relative aspect-[16/8] max-w-sm rounded overflow-hidden border border-[#DCD5C9] bg-neutral-100 mt-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] rounded font-bold">
                      Active Cover
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Subcategory Tag Editor */}
              <div className="space-y-2 pt-1 border-t border-[#F0EBE1]">
                <label className="block font-semibold text-[#121214] uppercase tracking-wider">
                  Subcategories & Styles ({subcategories.length})
                </label>
                <p className="text-[11px] text-[#736D64]">
                  Add individual subcategory tags that clients can filter by on catalogue pages.
                </p>

                {/* Tag Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#FAF8F5] rounded border border-[#E8E2D9]">
                  {subcategories.length === 0 ? (
                    <span className="text-[#A8A29E] italic text-[11px]">No subcategories defined yet.</span>
                  ) : (
                    subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD5C9] text-[#1C1917] font-medium rounded-full text-[11px] shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-[#B88E52]" />
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(idx)}
                          className="hover:text-red-700 ml-0.5 p-0.5"
                          title="Remove subcategory"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add new subcategory input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Type subcategory name (e.g. Chesterfield, Sectional, Recliner)..."
                    className="flex-1 px-3 py-1.5 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-4 py-1.5 bg-[#FAF0DD] text-[#8C7654] hover:bg-[#8C7654] hover:text-white font-bold rounded border border-[#E8DFC9] transition-colors"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#F0EBE1]">
                <div>
                  <label className="block font-semibold text-[#121214] mb-1 uppercase tracking-wider">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
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
                    <span className="font-semibold text-[#121214]">Visible in Storefront</span>
                  </label>
                </div>
              </div>

              {/* Footer Sticky Actions */}
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
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white font-bold rounded uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving Category...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
