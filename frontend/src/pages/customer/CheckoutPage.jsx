import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  MapPin,
  ShieldCheck,
  Truck,
  Plus,
  CheckCircle,
  AlertCircle,
  Lock,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RazorpayModal } from '../../components/customer/RazorpayModal';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, itemsCount, subtotal, shippingFee, discountAmount, grandTotal, appliedCoupon, fetchCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'COD'
  const [customerNotes, setCustomerNotes] = useState('');

  // Add Address Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    apartment_suite: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'HOME',
    is_default: true,
  });

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [activePendingOrder, setActivePendingOrder] = useState(null);
  const [activeRazorpayData, setActiveRazorpayData] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await authService.getAddresses();
      const list = data.results || data || [];
      setAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.is_default) || list[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to load customer addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressError('');
    try {
      const created = await authService.createAddress(newAddress);
      setModalOpen(false);
      setNewAddress({
        full_name: '',
        phone_number: '',
        street_address: '',
        apartment_suite: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'HOME',
        is_default: true,
      });
      await fetchAddresses();
      if (created?.id) {
        setSelectedAddressId(created.id);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save address. Please check all fields.';
      setAddressError(msg);
    } finally {
      setSavingAddress(false);
    }
  };

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Complete Payment Verification
  const verifyAndFinishOrder = async (orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      await paymentService.verifyRazorpayPayment({
        order_number: orderNumber,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      });
      await fetchCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      console.error('Payment verification error:', err);
      setCheckoutError(err.response?.data?.detail || 'Payment verification failed. Please contact support.');
    } finally {
      setProcessing(false);
      setRazorpayModalOpen(false);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError('Please select or add a delivery shipping address.');
      return;
    }

    setProcessing(true);
    setCheckoutError('');

    try {
      // 1. Create Order via checkout endpoint
      const checkoutRes = await orderService.checkout({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        customer_notes: customerNotes,
      });

      const order = checkoutRes.order;

      // 2. Branch depending on payment method
      if (paymentMethod === 'COD') {
        await paymentService.confirmCod(order.order_number);
        await fetchCart();
        navigate(`/order-success/${order.order_number}`);
        return;
      }

      // Online Razorpay / Instant Payment flow
      const rzpRes = await paymentService.createRazorpayOrder(order.order_number);

      // Check if real live Razorpay API key exists (must start with rzp_ and not contain dummy/indian_bazar)
      const hasRealRazorpayKey = Boolean(
        rzpRes.key_id &&
        !rzpRes.is_mock &&
        !rzpRes.key_id.toLowerCase().includes('dummy') &&
        !rzpRes.key_id.toLowerCase().includes('indian_bazar') &&
        /^rzp_(test|live)_[a-zA-Z0-9]{10,}$/.test(rzpRes.key_id)
      );

      if (hasRealRazorpayKey) {
        const isScriptLoaded = await loadRazorpayScript();
        if (isScriptLoaded) {
          const options = {
            key: rzpRes.key_id,
            amount: rzpRes.amount,
            currency: rzpRes.currency,
            name: 'Indian Bazar',
            description: `Order #${order.order_number} Payment`,
            order_id: rzpRes.razorpay_order_id,
            prefill: {
              name: rzpRes.customer_name || user?.first_name || '',
              email: rzpRes.customer_email || user?.email || '',
              contact: rzpRes.customer_phone || '',
            },
            theme: {
              color: '#E8590C', // Indian Bazar Royal Saffron
            },
            handler: async function (response) {
              await verifyAndFinishOrder(
                order.order_number,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
                setCheckoutError('Payment cancelled. Your order has been saved and can be paid later.');
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        }
      }

      // Open authentic Razorpay simulated gateway modal with UPI, Cards, Netbanking & Payment Successful animation
      setActivePendingOrder(order);
      setActiveRazorpayData(rzpRes);
      setRazorpayModalOpen(true);
      setProcessing(false);
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.detail || 'Order checkout failed. Please verify stock and address.';
      setCheckoutError(msg);
      setProcessing(false);
    }
  };

  if (cartLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Retrieving your shopping bag...</p>
      </div>
    );
  }

  if (!cart || itemsCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <Truck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Your Bag is Empty
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Add your favorite handcrafted items to your bag before proceeding to checkout.
          </p>
        </div>
        <Link to="/shop">
          <Button size="lg">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/cart"
            className="text-xs font-bold text-slate-500 hover:text-primary-600 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shopping Bag
          </Link>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Checkout & Order Confirmation
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Cart
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-primary-600 font-extrabold">Delivery & Payment</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span>Receipt</span>
        </div>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* Main Checkout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-slate-900">
                    Select Shipping Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Where should we deliver your handcrafted treasures?
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setModalOpen(true)}
              >
                Add New
              </Button>
            </div>

            {loadingAddresses ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading your saved addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No saved addresses found</p>
                <p className="text-xs text-slate-400">Add your first delivery address to continue</p>
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  Add Shipping Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/30 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {addr.full_name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                            {addr.address_type}
                          </span>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.street_address}
                        {addr.apartment_suite && `, ${addr.apartment_suite}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-2">
                        Phone: {addr.phone_number}
                      </p>

                      <div className="absolute top-4 right-4">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Select Payment Method
                </h2>
                <p className="text-xs text-slate-500">
                  All transactions are 100% encrypted and safe
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Online Option */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-primary-600 bg-primary-50/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'RAZORPAY' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Razorpay Online Payment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & NetBanking
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fast & 100% Encrypted
                </div>
              </div>

              {/* Cash On Delivery (COD) Option */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  paymentMethod === 'COD'
                    ? 'border-primary-600 bg-primary-50/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD'
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'COD' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay in cash directly to our delivery courier at your doorstep
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md w-fit">
                  <Truck className="w-3.5 h-3.5" /> Pay Upon Receipt
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Order Notes / Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Please ring bell twice or leave with security"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-5">
            <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-slate-500">{itemsCount} items</span>
            </h3>

            {/* Mini Items Preview */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {cart?.items?.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={
                        item.product?.primary_image_url ||
                        item.product_image ||
                        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.product?.title || item.product_title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product?.title || item.product_title || 'Item'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-heading text-slate-900">
                    {formatCurrency(item.subtotal || item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financials Breakdown */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Coupon Discount ({appliedCoupon?.code})
                  </span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Pan-India Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="font-heading font-extrabold text-base text-slate-900 block">
                    Grand Total
                  </span>
                  <span className="text-[10px] text-slate-400">Inclusive of GST</span>
                </div>
                <span className="font-heading font-black text-2xl text-primary-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <Button
              size="lg"
              className="w-full shadow-lg shadow-primary-500/25"
              loading={processing}
              disabled={!selectedAddressId}
              onClick={handlePlaceOrder}
              icon={Lock}
            >
              {paymentMethod === 'COD'
                ? 'Confirm & Place Cash Order'
                : `Pay ${formatCurrency(grandTotal)} via Razorpay`}
            </Button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay 256-Bit SSL Bank Grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Add Delivery Address
                </h3>
                <p className="text-xs text-slate-400">Enter your shipping details accurately</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAddress} className="space-y-4">
              <Input
                label="Full Recipient Name"
                value={newAddress.full_name}
                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                required
                placeholder="e.g. Ramesh Kumar"
              />

              <Input
                label="Mobile Contact Number"
                type="tel"
                value={newAddress.phone_number}
                onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                required
                placeholder="10-digit Indian phone number"
              />

              <Input
                label="Street Address / House No."
                value={newAddress.street_address}
                onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                required
                placeholder="House / Flat No., Road, Landmark"
              />

              <Input
                label="Apartment, Colony or Landmark (Optional)"
                value={newAddress.apartment_suite}
                onChange={(e) => setNewAddress({ ...newAddress, apartment_suite: e.target.value })}
                placeholder="e.g. Near City Post Office"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                  placeholder="e.g. Varanasi"
                />
                <Input
                  label="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                  placeholder="e.g. Uttar Pradesh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal PIN Code"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  required
                  placeholder="6-digit PIN code"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Address Type
                  </label>
                  <select
                    value={newAddress.address_type}
                    onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={savingAddress}>
                  Save Shipping Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authentic Razorpay UI Gateway Modal */}
      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => {
          setRazorpayModalOpen(false);
          setProcessing(false);
          setCheckoutError('Payment cancelled. Your order has been saved and can be paid anytime from My Orders.');
        }}
        onSuccess={async (paymentData) => {
          setRazorpayModalOpen(false);
          setProcessing(true);
          await verifyAndFinishOrder(
            activePendingOrder.order_number,
            paymentData.razorpay_order_id,
            paymentData.razorpay_payment_id,
            paymentData.razorpay_signature
          );
        }}
        amount={activePendingOrder?.total_amount || grandTotal}
        orderNumber={activePendingOrder?.order_number}
        customerName={activePendingOrder?.shipping_full_name || user?.first_name}
        customerEmail={user?.email}
        customerPhone={activePendingOrder?.shipping_phone || user?.phone_number}
      />
    </div>
  );
};

export default CheckoutPage;
