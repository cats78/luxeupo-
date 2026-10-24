import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Upload,
  X,
  AlertCircle,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product, Category } from '../../types';
import { saveProduct, deleteProduct } from '../../firebase/firestore';
import { uploadImageToStorage } from '../../firebase/storageUpload';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  isAddModalOpen = false,
  onCloseAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(isAddModalOpen);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Living Room Furniture');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [inStock, setInStock] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [materialsInput, setMaterialsInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');

  const [uploadError, setUploadError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Sofas & Seating');
    setSubcategory('');
    setDescription('');
    setPrice(0);
    setOriginalPrice(0);
    setDiscountPercent(0);
    setStock(5);
    setInStock(true);
    setIsFeatured(false);
    setImages(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85']);
    setMaterialsInput('Italian Bouclé, Hardwood Frame, Champagne Brass Plinth');
    setColorsInput('Oatmeal Cream, Midnight Charcoal, Emerald');
    setSizesInput('Standard (92" x 40"), Grand (108" x 44")');
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setSubcategory(prod.subcategory || '');
    setDescription(prod.description);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || prod.price);
    setDiscountPercent(prod.discountPercent || 0);
    setStock(prod.stock);
    setInStock(prod.inStock);
    setIsFeatured(prod.isFeatured);
    setImages(prod.images || []);
    setMaterialsInput(prod.materials?.join(', ') || '');
    setColorsInput(prod.colors?.join(', ') || '');
    setSizesInput(prod.sizes?.join(', ') || '');
    setModalOpen(true);
  };

  const handlePriceChange = (newPrice: number, newOriginalPrice?: number) => {
    const currentPrice = newPrice;
    const currentOrig = newOriginalPrice !== undefined ? newOriginalPrice : originalPrice;
    setPrice(currentPrice);
    if (newOriginalPrice !== undefined) setOriginalPrice(currentOrig);

    if (currentOrig > currentPrice && currentOrig > 0) {
      const discount = Math.round(((currentOrig - currentPrice) / currentOrig) * 100);
      setDiscountPercent(discount);
    } else {
      setDiscountPercent(0);
    }
  };

  // Image Upload Handler (PNG, JPG, JPEG validation, saves to Firebase Storage, avoids duplicates)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccessMsg('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const downloadUrl = await uploadImageToStorage(file, 'products', (prog) => {
          const overallProgress = Math.round(((i + prog / 100) / files.length) * 100);
          setUploadProgress(overallProgress);
        });

        // Avoid duplicate uploads
        if (!images.includes(downloadUrl) && !newUrls.includes(downloadUrl)) {
          newUrls.push(downloadUrl);
        }
      }

      setImages(prev => {
        const combined = [...prev];
        for (const u of newUrls) {
          if (!combined.includes(u)) combined.push(u);
        }
        return combined;
      });
      setUploadSuccessMsg(`${files.length} image(s) processed and added successfully.`);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Product image upload error:', err);
      setUploadError(err.message || 'Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setUploadError('This image URL is already in the gallery.');
      return;
    }
    setImages(prev => [...prev, trimmed]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (images.length === 0) {
      setUploadError('Please provide at least one product image.');
      return;
    }

    setSaving(true);
    try {
      const productData: Partial<Product> = {
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || '',
        description: description.trim(),
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || Number(price) || 0,
        discountPercent: Number(discountPercent) || 0,
        stock: Number(stock) || 0,
        inStock: Boolean(inStock),
        isFeatured: Boolean(isFeatured),
        images: images,
        materials: materialsInput.split(',').map(s => s.trim()).filter(Boolean),
        colors: colorsInput.split(',').map(s => s.trim()).filter(Boolean),
        sizes: sizesInput.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingProduct) {
        productData.id = editingProduct.id;
        productData.createdAt = editingProduct.createdAt;
      }

      await saveProduct(productData);
      const savedName = productData.name;
      setEditingProduct(null);
      setModalOpen(false);
      setSuccessToast(`Product "${savedName}" saved and synchronized live to Firestore!`);
      setTimeout(() => setSuccessToast(''), 4500);
      if (onCloseAddModal) onCloseAddModal();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setUploadError(err?.message || 'Failed to save product to database. Check connection or authorization.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      setSuccessToast('Product removed from database.');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      console.error('Delete product error:', err);
      setSuccessToast(err?.message || 'Failed to delete product.');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Product Catalogue Management
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Create, edit, pricing updates, and multi-image uploads for showroom pieces.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Furniture Piece</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-sm flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C867D] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCD5C9] rounded-sm bg-white focus:border-[#9A7B4F] focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm bg-white focus:border-[#9A7B4F] focus:outline-none"
        >
          <option value="All">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#736D64] uppercase tracking-wider border-b border-[#E8E2D9]">
              <tr>
                <th className="p-3.5 font-semibold">Piece</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Selling Price</th>
                <th className="p-3.5 font-semibold">Stock</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-sm border border-[#E8E2D9] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-[#121214] block line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-[#8C867D] font-mono">ID: {p.id}</span>
                      {p.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-[#C5A880] font-bold uppercase ml-1">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-[#5C564D]">
                    <div>{p.category}</div>
                    {p.subcategory && (
                      <div className="text-[10px] text-[#8C867D]">{p.subcategory}</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-[#121214]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <div className="text-[10px] text-[#8C867D] line-through">
                        ₹{p.originalPrice.toLocaleString('en-IN')} ({p.discountPercent}% off)
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-[#121214]">{p.stock} units</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                      p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/product/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#736D64] hover:text-[#121214] hover:bg-[#F3F1EC] rounded transition-colors"
                        title="Open product in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-[#736D64] hover:text-[#9A7B4F] hover:bg-[#F3F1EC] rounded transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1.5 text-[#736D64] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm p-6 max-w-sm w-full space-y-4 border border-[#E8E2D9] shadow-xl">
            <h3 className="font-serif-luxury text-lg font-bold text-[#121214]">
              Delete Furniture Record?
            </h3>
            <p className="text-xs text-[#736D64] leading-relaxed">
              Are you sure you want to permanently delete this product from the public catalog? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs border border-[#DCD5C9] text-[#5C564D] rounded-sm hover:bg-[#FAF9F6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs bg-red-700 text-white font-bold rounded-sm hover:bg-red-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm max-w-3xl w-full my-8 border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-[#121214] text-white flex items-center justify-between shrink-0">
              <h3 className="font-serif-luxury text-lg font-bold">
                {editingProduct ? `Edit Piece: ${editingProduct.name}` : 'Add New Luxury Furniture Piece'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold text-[#121214] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aurelia Curved Velvet Sectional"
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#121214] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#121214] mb-1">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Sectional Sofas"
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold text-[#121214] mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe craftsmanship, materials, frame construction, and architectural presence..."
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing, Discount & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF9F6] rounded-sm border border-[#E8E2D9]">
                <div>
                  <label className="block font-semibold text-[#121214] mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#121214] mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => handlePriceChange(price, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#121214] mb-1">
                    Discount % (Auto)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#121214] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm bg-white"
                  />
                </div>
              </div>

              {/* Product Images (PNG/JPG validation, multi-image, preview) */}
              <div className="space-y-3">
                <label className="block uppercase tracking-wider font-semibold text-[#121214]">
                  Product Images (PNG, JPG, JPEG accepted • Max 10MB each) *
                </label>

                {uploadSuccessMsg && (
                  <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {isUploading && (
                  <div className="p-3 bg-[#FAF8F5] border border-[#B88E52]/30 rounded space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#121214]">
                      <span>Processing &amp; Uploading Images...</span>
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
                
                {/* File Upload Selector */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label className="px-4 py-2.5 bg-white border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white rounded cursor-pointer transition-colors flex items-center gap-2 font-bold shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Upload Image (PNG / JPG)'}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      multiple
                      disabled={isUploading}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[#8C867D] text-[11px]">or add external image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 w-full px-3 py-2 border border-[#DCD5C9] rounded focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded overflow-hidden border border-[#DCD5C9] bg-[#F3F1EC] group">
                      <img
                        src={imgUrl}
                        alt={`Thumb ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/75 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold uppercase rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants Configuration */}
              <div className="space-y-3 pt-2 border-t border-[#E8E2D9]">
                <h4 className="font-semibold text-[#121214] uppercase tracking-wider">
                  Variants &amp; Options (Comma-separated)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#736D64] mb-1">Materials</label>
                    <input
                      type="text"
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      placeholder="Italian Bouclé, Velvet, Teak"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#736D64] mb-1">Colors</label>
                    <input
                      type="text"
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      placeholder="Ivory Cream, Charcoal, Emerald"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#736D64] mb-1">Sizes / Dimensions</label>
                    <input
                      type="text"
                      value={sizesInput}
                      onChange={(e) => setSizesInput(e.target.value)}
                      placeholder='3-Seater (92"), 4-Seater (108")'
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F]"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-[#9A7B4F] focus:ring-[#9A7B4F] w-4 h-4"
                  />
                  <span className="font-semibold text-[#121214]">In Stock &amp; Ready for Dispatch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#9A7B4F] focus:ring-[#9A7B4F] w-4 h-4"
                  />
                  <span className="font-semibold text-[#121214]">Highlight as Signature / Featured</span>
                </label>
              </div>

              {/* Submit Buttons with Sticky Positioning */}
              <div className="flex justify-end gap-3 pt-4 pb-1 border-t border-[#E8E2D9] sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[#DCD5C9] text-[#736D64] rounded font-medium hover:bg-[#FAF9F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isUploading}
                  className="px-6 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white font-bold rounded uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving to Database...' : editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
