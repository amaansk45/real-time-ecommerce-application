import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    image_url: '',
    is_featured: false,
    order: 0,
  });

  // Subcategory Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const [subForm, setSubForm] = useState({
    category: '',
    name: '',
    description: '',
  });

  const [feedback, setFeedback] = useState(null);

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminCategories();
      setCategories(data.results || data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCatCreate = () => {
    setEditingCategory(null);
    setCatError('');
    setCatForm({
      name: '',
      description: '',
      image_url: '',
      is_featured: false,
      order: categories.length + 1,
    });
    setCatModalOpen(true);
  };

  const handleOpenCatEdit = (cat) => {
    setEditingCategory(cat);
    setCatError('');
    setCatForm({
      name: cat.name || '',
      description: cat.description || '',
      image_url: cat.image_url || cat.image || '',
      is_featured: cat.is_featured ?? false,
      order: cat.order ?? 0,
    });
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCatSaving(true);
    setCatError('');

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, catForm);
        showToast(`Category "${catForm.name}" updated!`);
      } else {
        await adminService.createCategory(catForm);
        showToast(`Category "${catForm.name}" created!`);
      }
      setCatModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setCatError(err.response?.data?.detail || 'Failed to save category.');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products inside may become uncategorized.`)) {
      return;
    }
    try {
      await adminService.deleteCategory(cat.id);
      showToast(`Category "${cat.name}" removed.`);
      await fetchCategories();
    } catch (err) {
      showToast('Could not delete category.', 'error');
    }
  };

  const handleOpenSubCreate = (categoryId = '') => {
    setSubError('');
    setSubForm({
      category: categoryId || categories[0]?.id || '',
      name: '',
      description: '',
    });
    setSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    setSubSaving(true);
    setSubError('');

    try {
      await adminService.createSubcategory(subForm);
      showToast(`Subcategory "${subForm.name}" added!`);
      setSubModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setSubError(err.response?.data?.detail || 'Failed to add subcategory.');
    } finally {
      setSubSaving(false);
    }
  };

  const handleDeleteSubcategory = async (subId, subName) => {
    if (!window.confirm(`Delete subcategory "${subName}"?`)) {
      return;
    }
    try {
      await adminService.deleteSubcategory(subId);
      showToast(`Subcategory "${subName}" deleted.`);
      await fetchCategories();
    } catch (err) {
      showToast('Could not delete subcategory.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Category Taxonomy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize Indian handlooms, spices, crafts, and heritage collections into structured hierarchies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Layers} onClick={() => handleOpenSubCreate()}>
            Add Subcategory
          </Button>
          <Button size="sm" icon={Plus} onClick={handleOpenCatCreate}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading store taxonomy...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80 space-y-3">
          <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No categories created yet</h3>
          <p className="text-xs text-slate-400">Click "Add Category" above to begin structuring your store catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-slate-200/80 flex flex-col justify-between"
            >
              {/* Category Header Card */}
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      cat.image_url ||
                      cat.image ||
                      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {cat.is_featured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenCatEdit(cat)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-primary-600 shadow-sm"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-600 shadow-sm"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      /{cat.slug}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </div>

              {/* Subcategories Shelf */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subcategories ({cat.subcategories?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenSubCreate(cat.id)}
                    className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Sub
                  </button>
                </div>

                {cat.subcategories && cat.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-[11px] font-semibold border border-slate-200"
                      >
                        <span>{sub.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                          className="text-slate-400 hover:text-red-600 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No subcategories yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {catError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <Input
                label="Category Name *"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
                placeholder="e.g. Royal Brassware & Artifacts"
              />

              <Input
                label="Banner / Photo Image URL"
                value={catForm.image_url}
                onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Summary of products in this collection..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <Input
                  label="Display Order"
                  type="number"
                  value={catForm.order}
                  onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-24"
                />

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={catForm.is_featured}
                    onChange={(e) => setCatForm({ ...catForm, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  Feature on Home
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={catSaving}>
                  {editingCategory ? 'Update' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Add Subcategory
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {subError}
              </div>
            )}

            <form onSubmit={handleSaveSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent Category *
                </label>
                <select
                  value={subForm.category}
                  onChange={(e) => setSubForm({ ...subForm, category: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Subcategory Name *"
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                required
                placeholder="e.g. Sarees, Diyas, Incense"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={subForm.description}
                  onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  placeholder="Subcategory details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={subSaving}>
                  Add Subcategory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
