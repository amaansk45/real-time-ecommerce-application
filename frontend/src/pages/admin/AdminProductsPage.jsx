import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    category: '',
    subcategory: '',
    price: '',
    discount_price: '',
    stock_quantity: 10,
    unit: 'item',
    origin_region: '',
    short_description: '',
    description: '',
    image_url: '',
    is_active: true,
    is_featured: false,
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (stockFilter === 'low_stock') params.low_stock = 'true';
      if (stockFilter === 'out_of_stock') params.in_stock = 'false';

      const data = await adminService.getAdminProducts(params);
      setProducts(data.results || data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminService.getAdminCategories();
      setCategories(data.results || data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, stockFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormError('');
    setFormData({
      title: '',
      sku: `IB-${Date.now().toString().slice(-6)}`,
      category: categories[0]?.id || '',
      subcategory: '',
      price: '',
      discount_price: '',
      stock_quantity: 25,
      unit: 'piece',
      origin_region: '',
      short_description: '',
      description: '',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormError('');
    setFormData({
      title: prod.title || '',
      sku: prod.sku || '',
      category: prod.category?.id || prod.category || '',
      subcategory: prod.subcategory?.id || prod.subcategory || '',
      price: prod.price || '',
      discount_price: prod.discount_price || '',
      stock_quantity: prod.stock_quantity ?? 0,
      unit: prod.unit || 'piece',
      origin_region: prod.origin_region || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      image_url: prod.primary_image || '',
      is_active: prod.is_active ?? true,
      is_featured: prod.is_featured ?? false,
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10),
      };

      if (!payload.subcategory) {
        delete payload.subcategory;
      }

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        showToast(`Product "${payload.title}" updated successfully!`);
      } else {
        await adminService.createProduct(payload);
        showToast(`New product "${payload.title}" added to inventory!`);
      }

      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to save product. Verify inputs.';
      setFormError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.title}"?`)) {
      return;
    }

    try {
      await adminService.deleteProduct(prod.id);
      showToast(`Product "${prod.title}" was deleted.`);
      await fetchProducts();
    } catch (err) {
      showToast('Could not delete product.', 'error');
    }
  };

  // Subcategories belonging to chosen category
  const activeCategoryObj = categories.find((c) => String(c.id) === String(formData.category));
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Product Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your authentic store catalog, pricing, SKU codes, and stock levels
          </p>
        </div>
        <Button size="sm" icon={Plus} onClick={handleOpenCreateModal} className="shadow-md">
          Add New Product
        </Button>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <input
            type="text"
            placeholder="Search by title, SKU, or origin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">All Stock Levels</option>
            <option value="low_stock">Low Stock (≤ 5 units)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
            Loading product inventory...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Stock Status</th>
                  <th className="py-3.5 px-6 text-center">Featured</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((prod) => {
                  const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity <= 5;
                  const isOut = prod.stock_quantity === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            <img
                              src={
                                prod.primary_image ||
                                'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80'
                              }
                              alt={prod.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                              {prod.title}
                            </p>
                            {prod.origin_region && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-500" /> {prod.origin_region}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {prod.category_name || prod.category?.name || 'General'}
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-6 font-mono font-bold text-slate-500">
                        {prod.sku}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6">
                        <span className="font-heading font-black text-slate-900 block">
                          {formatCurrency(prod.effective_price)}
                        </span>
                        {prod.discount_price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(prod.price)}
                          </span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" /> Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Low Stock ({prod.stock_quantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> In Stock ({prod.stock_quantity})
                          </span>
                        )}
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-6 text-center">
                        {prod.is_featured ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Handcrafted Product'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in authentic item details, SKU, and inventory counts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <Input
                label="Product Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Royal Kashmiri Mongra Saffron (1g)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SKU Code *"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  placeholder="e.g. KSH-SAF-001"
                />

                <Input
                  label="Origin Region"
                  value={formData.origin_region}
                  onChange={(e) => setFormData({ ...formData, origin_region: e.target.value })}
                  placeholder="e.g. Pampore, Kashmir"
                />
              </div>

              {/* Category & Subcategory Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subcategory (Optional)
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    disabled={availableSubcategories.length === 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-primary-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">None / General</option>
                    {availableSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input
                  label="Regular Price (₹) *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="999"
                />

                <Input
                  label="Offer Price (₹)"
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  placeholder="799"
                />

                <Input
                  label="Stock Units *"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                  placeholder="25"
                />

                <Input
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="piece / gram"
                />
              </div>

              {/* Image URL */}
              <Input
                label="Primary Photo URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />

              {/* Short & Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Short Highlight / Tagline
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="e.g. 100% Grade A1 Certified Kashmiri Mongra Saffron"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed craft description, heritage story, and specifications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  Feature on Storefront
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  Active (Visible to customers)
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
