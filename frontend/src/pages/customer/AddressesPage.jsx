import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Home,
  Briefcase,
  AlertCircle,
  X,
} from 'lucide-react';

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    apartment_suite: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'HOME',
    is_default: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await authService.getAddresses();
      setAddresses(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await authService.createAddress(formData);
      setModalOpen(false);
      setFormData({
        full_name: '',
        phone_number: '',
        street_address: '',
        apartment_suite: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'HOME',
        is_default: false,
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setError('Please check the entered address details. Valid 6-digit PIN code required.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await authService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this delivery address?')) {
      try {
        await authService.deleteAddress(id);
        fetchAddresses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Saved Delivery Addresses
          </h1>
          <p className="text-sm text-slate-500">Manage your shipping destinations for faster checkout</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200/80 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No addresses saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add a primary shipping address to ensure smooth deliveries across India.
          </p>
          <Button onClick={() => setModalOpen(true)} icon={Plus} size="sm">
            Add First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-6 shadow-card border transition-all relative flex flex-col justify-between ${
                addr.is_default ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                    {addr.address_type === 'WORK' ? <Briefcase className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                    {addr.address_type}
                  </span>

                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Default Address
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{addr.full_name}</h3>
                  <p className="text-xs text-slate-500">{addr.phone_number}</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {addr.street_address}
                  {addr.apartment_suite && `, ${addr.apartment_suite}`}
                  <br />
                  {addr.city}, {addr.state} - <span className="font-semibold text-slate-900">{addr.postal_code}</span>
                  <br />
                  {addr.country}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Primary delivery</span>
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">Add New Address</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Receiver's Full Name"
                required
                placeholder="Rahul Sharma"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />

              <Input
                label="10-digit Mobile Number"
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />

              <Input
                label="Street Address / House No."
                required
                placeholder="Flat 101, Shanti Niketan Apartments"
                value={formData.street_address}
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              />

              <Input
                label="Apartment, Landmark, Suite (Optional)"
                placeholder="Near Metro Station"
                value={formData.apartment_suite}
                onChange={(e) => setFormData({ ...formData, apartment_suite: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State"
                  required
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="PIN Code (6 digits)"
                  required
                  placeholder="400001"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Address Type
                  </label>
                  <select
                    value={formData.address_type}
                    onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
