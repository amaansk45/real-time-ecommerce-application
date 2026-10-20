import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_amount: '999.00',
    max_discount_amount: '',
    usage_limit: 100,
    is_active: true,
  });

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'No expiry';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminCoupons();
      setCoupons(data.results || data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreateModal = () => {
    setFormError('');
    setFormData({
      code: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      min_order_amount: '999.00',
      max_discount_amount: '',
      usage_limit: 100,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount || 0),
        usage_limit: parseInt(formData.usage_limit, 10) || 100,
        is_active: formData.is_active,
      };

      if (formData.max_discount_amount) {
        payload.max_discount_amount = parseFloat(formData.max_discount_amount);
      }

      await adminService.createCoupon(payload);
      showToast(`Promo coupon "${payload.code}" created successfully!`);
      setModalOpen(false);
      await fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.code?.[0] || 'Failed to create coupon.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      await adminService.deleteCoupon(coupon.id);
      showToast(`Coupon "${coupon.code}" was deleted.`);
      await fetchCoupons();
    } catch (err) {
      showToast('Could not delete coupon.', 'error');
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
            Promotional Coupons & Festive Offers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure discount promo codes, percentage savings, and minimum checkout thresholds
          </p>
        </div>
        <Button size="sm" icon={Plus} onClick={handleOpenCreateModal} className="shadow-md">
          Create New Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
            Loading active promotional coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No promotional coupons found</p>
            <p className="text-xs text-slate-400">Click "Create New Coupon" to offer festive discounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-6">Discount Value</th>
                  <th className="py-3.5 px-6">Min Order Req</th>
                  <th className="py-3.5 px-6">Max Cap</th>
                  <th className="py-3.5 px-6">Valid Until</th>
                  <th className="py-3.5 px-6 text-center">Uses / Limit</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Code */}
                    <td className="py-4 px-6 font-mono font-bold text-sm text-primary-700">
                      {c.code}
                    </td>

                    {/* Discount Value */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {c.discount_type === 'PERCENTAGE'
                        ? `${c.discount_value}% OFF`
                        : `₹${c.discount_value} FLAT OFF`}
                    </td>

                    {/* Min Order */}
                    <td className="py-4 px-6 text-slate-600">
                      ₹{c.min_order_amount}
                    </td>

                    {/* Max Cap */}
                    <td className="py-4 px-6 text-slate-500">
                      {c.max_discount_amount ? `₹${c.max_discount_amount}` : 'None'}
                    </td>

                    {/* Expiry */}
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {formatDate(c.valid_to)}
                    </td>

                    {/* Usage */}
                    <td className="py-4 px-6 text-center font-mono font-medium">
                      {c.used_count || 0} / {c.usage_limit || '∞'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Create Festive Promo Coupon
              </h3>
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

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <Input
                label="Coupon Code *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g. DIWALI25, FESTIVE50"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <Input
                  label="Discount Value *"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                  placeholder={formData.discount_type === 'PERCENTAGE' ? '20' : '150'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Order Amount (₹)"
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="999"
                />

                <Input
                  label="Max Discount Cap (₹)"
                  type="number"
                  step="0.01"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <Input
                label="Usage Limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="100"
              />

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                Active (Ready for checkout redemption)
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
