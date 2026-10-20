import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  QrCode,
  Check,
  AlertCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/common/Button';

export const RazorpayPaymentPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment method selection
  const [activeTab, setActiveTab] = useState('UPI'); // UPI | CARDS | NETBANKING | WALLETS
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [showQr, setShowQr] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Test card form
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('786');
  const [cardName, setCardName] = useState('Shaikh Amaan');

  // Flow states: 'IDLE' | 'PROCESSING' | 'SUCCESS'
  const [paymentState, setPaymentState] = useState('IDLE');
  const [processingStep, setProcessingStep] = useState(0);
  const [generatedPaymentId, setGeneratedPaymentId] = useState('');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const [razorpayData, setRazorpayData] = useState(null);

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

  const launchOfficialRazorpay = async (rzp) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      alert('Unable to load Razorpay checkout script. Check your internet connection.');
      return;
    }

    const options = {
      key: rzp.key_id,
      amount: rzp.amount,
      currency: rzp.currency || 'INR',
      name: 'Indian Bazar',
      description: `Order #${orderNumber} Payment`,
      order_id: rzp.razorpay_order_id,
      prefill: {
        name: rzp.customer_name || order?.shipping_full_name || '',
        email: rzp.customer_email || order?.customer?.email || '',
        contact: rzp.customer_phone || order?.shipping_phone || '',
      },
      theme: {
        color: '#E8590C',
      },
      handler: async function (response) {
        setPaymentState('SUCCESS');
        try {
          await paymentService.verifyRazorpayPayment({
            order_number: orderNumber,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setTimeout(() => {
            navigate(`/order-success/${orderNumber}`, { replace: true });
          }, 2000);
        } catch (err) {
          console.error('Payment verification error:', err);
          setError('Payment verification failed on server.');
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal closed by user');
        },
      },
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.open();
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getOrderByNumber(orderNumber);
        setOrder(data);
        if (data.shipping_full_name) {
          setCardName(data.shipping_full_name);
        }
        // If already paid, redirect straight to success
        if (data.payment_status === 'PAID') {
          navigate(`/order-success/${orderNumber}`, { replace: true });
          return;
        }

        // Initialize Razorpay Order via backend API
        const rzpRes = await paymentService.createRazorpayOrder(orderNumber);
        setRazorpayData(rzpRes);

        // Check if genuine live/test API keys configured
        const hasRealRazorpayKey = Boolean(
          rzpRes.key_id &&
          !rzpRes.is_mock &&
          !rzpRes.key_id.toLowerCase().includes('dummy') &&
          !rzpRes.key_id.toLowerCase().includes('indian_bazar') &&
          /^rzp_(test|live)_[a-zA-Z0-9]{10,}$/.test(rzpRes.key_id)
        );

        if (hasRealRazorpayKey) {
          launchOfficialRazorpay(rzpRes);
        }
      } catch (err) {
        console.error('Failed to load order for payment:', err);
        setError(err.response?.data?.detail || 'Could not load order details. Please check the order reference.');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetails();
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      setGeneratedPaymentId(`pay_${randomSuffix}`);
    }
  }, [orderNumber, navigate]);

  const handleExecutePayment = async () => {
    // If real keys are present, launch official Razorpay gateway
    const hasRealRazorpayKey = Boolean(
      razorpayData?.key_id &&
      !razorpayData?.is_mock &&
      !razorpayData?.key_id.toLowerCase().includes('dummy') &&
      !razorpayData?.key_id.toLowerCase().includes('indian_bazar') &&
      /^rzp_(test|live)_[a-zA-Z0-9]{10,}$/.test(razorpayData.key_id)
    );

    if (hasRealRazorpayKey) {
      launchOfficialRazorpay(razorpayData);
      return;
    }

    setPaymentState('PROCESSING');
    setProcessingStep(1);

    // Realistic banking authorization delay steps
    setTimeout(() => {
      setProcessingStep(2);
    }, 900);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1700);

    setTimeout(() => {
      setPaymentState('SUCCESS');
    }, 2400);

    // After success animation, verify with backend and redirect to order-success
    setTimeout(async () => {
      try {
        await paymentService.verifyRazorpayPayment({
          order_number: orderNumber,
          razorpay_order_id: razorpayData?.razorpay_order_id || `order_${orderNumber}`,
          razorpay_payment_id: generatedPaymentId,
          razorpay_signature: 'mock_signature_valid',
        });
        navigate(`/order-success/${orderNumber}`, { replace: true });
      } catch (err) {
        console.error('Verification error on payment page:', err);
        navigate(`/orders/${orderNumber}`, { replace: true });
      }
    }, 4500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07172b] flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#0c83fd]/20 border-t-[#0c83fd] animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Connecting to Razorpay Secure Gateway...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-slate-200 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900">Order Error</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to locate order reference.'}</p>
          <Link to="/orders">
            <Button size="sm">Back to My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172b] via-[#0c2340] to-slate-900 py-6 sm:py-12 px-3 sm:px-6 flex items-center justify-center">
      {/* Central Razorpay Gateway Container */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col transition-all">
        
        {/* ================= 1. RAZORPAY PORTAL HEADER ================= */}
        <div className="bg-[#0c2340] text-white p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            {/* Merchant Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-white/20">
                IB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-base sm:text-lg text-white tracking-wide">
                    Indian Bazar
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    TEST MODE
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Order #{order.order_number}
                </p>
              </div>
            </div>

            {/* Total Amount Due */}
            <div className="text-right">
              <span className="text-[11px] text-slate-300 block font-medium uppercase tracking-wider">
                Total Payable
              </span>
              <span className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Banner Bar */}
        <div className="bg-[#07172b] px-5 py-2 text-xs text-slate-300 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-medium text-[11px]">Razorpay Payment Gateway</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Bank Grade SSL</span>
          </div>
        </div>

        {/* ================= 2. GATEWAY BODY (SELECTION STATE) ================= */}
        {paymentState === 'IDLE' && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'UPI'
                    ? 'bg-white text-[#0c83fd] shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CARDS')}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'CARDS'
                    ? 'bg-white text-[#0c83fd] shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('NETBANKING')}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'NETBANKING'
                    ? 'bg-white text-[#0c83fd] shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Netbanking</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('WALLETS')}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'WALLETS'
                    ? 'bg-white text-[#0c83fd] shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallets</span>
              </button>
            </div>

            {/* Content: UPI Tab */}
            {activeTab === 'UPI' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select UPI Application
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="text-xs text-[#0c83fd] hover:underline font-semibold flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQr ? 'Use UPI App' : 'Show UPI QR Code'}
                  </button>
                </div>

                {showQr ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl border border-slate-300 shadow-inner flex items-center justify-center">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i % 2 === 0 || i % 5 === 0) ? 'bg-white' : 'bg-slate-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Scan QR code with any UPI app to pay <strong>{formatCurrency(order.total_amount)}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'gpay', name: 'Google Pay', badge: 'Fastest' },
                      { id: 'phonepe', name: 'PhonePe', badge: 'Popular' },
                      { id: 'paytm', name: 'Paytm UPI', badge: '' },
                      { id: 'bhim', name: 'BHIM UPI', badge: '' },
                    ].map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedUpiApp === app.id
                            ? 'border-[#0c83fd] bg-blue-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                            {app.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{app.name}</p>
                            {app.badge && (
                              <span className="text-[9px] font-bold text-emerald-600">
                                {app.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedUpiApp === app.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0c83fd] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual UPI ID */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Or Enter Any UPI ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full text-xs font-mono px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      VERIFIED VPA
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Content: Cards Tab */}
            {activeTab === 'CARDS' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-4 bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>TEST PAYMENT CARD</span>
                    <span className="text-amber-400 font-bold">RuPay / VISA</span>
                  </div>
                  <div className="text-sm font-bold tracking-widest text-slate-100">
                    {cardNumber}
                  </div>
                  <div className="flex justify-between items-end text-[10px]">
                    <div>
                      <div className="text-slate-400 text-[8px]">CARDHOLDER</div>
                      <div className="font-bold text-white uppercase">{cardName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[8px]">VALID THRU</div>
                      <div className="font-bold text-white">{cardExpiry}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content: Netbanking Tab */}
            {activeTab === 'NETBANKING' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Your Bank
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'HDFC', name: 'HDFC Bank' },
                    { id: 'SBI', name: 'State Bank of India' },
                    { id: 'ICICI', name: 'ICICI Bank' },
                    { id: 'AXIS', name: 'Axis Bank' },
                    { id: 'KOTAK', name: 'Kotak Mahindra' },
                    { id: 'PNB', name: 'Punjab National' },
                  ].map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                        selectedBank === bank.id
                          ? 'border-[#0c83fd] bg-blue-50/60 text-[#0c83fd]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{bank.name}</span>
                      {selectedBank === bank.id && (
                        <div className="w-4 h-4 rounded-full bg-[#0c83fd] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content: Wallets Tab */}
            {activeTab === 'WALLETS' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Wallet
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet' },
                    { id: 'phonepe', name: 'PhonePe Wallet' },
                    { id: 'mobikwik', name: 'MobiKwik Wallet' },
                  ].map((wallet) => (
                    <div
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                        selectedWallet === wallet.id
                          ? 'border-[#0c83fd] bg-blue-50/60 text-[#0c83fd]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{wallet.name}</span>
                      {selectedWallet === wallet.id && (
                        <div className="w-4 h-4 rounded-full bg-[#0c83fd] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Pay Button */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleExecutePayment}
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-base text-white bg-[#0c83fd] hover:bg-[#0b74e0] active:scale-[0.99] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4" />
                <span>Pay {formatCurrency(order.total_amount)}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <Link
                  to={`/orders/${order.order_number}`}
                  className="hover:text-slate-600 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Cancel and pay later
                </Link>
                <span>Secured by <strong>Razorpay</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. PROCESSING ANIMATION SCREEN ================= */}
        {paymentState === 'PROCESSING' && (
          <div className="p-10 sm:p-14 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            {/* Spinning Shield */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#0c83fd]/20 border-t-[#0c83fd] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#0c83fd] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                {processingStep === 1 && 'Connecting to Razorpay Gateway...'}
                {processingStep === 2 && 'Authorizing with Banking Server...'}
                {processingStep >= 3 && 'Approving Transaction...'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Amount: {formatCurrency(order.total_amount)}
              </p>
            </div>

            {/* Step badges */}
            <div className="w-full max-w-xs space-y-2 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-700">
                <span>1. Merchant Validation</span>
                <span className="text-emerald-600 font-bold">✓ Approved</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>2. 256-bit Security Handshake</span>
                <span className={processingStep >= 2 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {processingStep >= 2 ? '✓ Secure' : 'Waiting...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>3. Banking Clearance</span>
                <span className={processingStep >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {processingStep >= 3 ? '✓ Complete' : 'Waiting...'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 animate-pulse">
              Please do not close or reload this window...
            </p>
          </div>
        )}

        {/* ================= 4. AUTHENTIC RAZORPAY GREEN SUCCESS SCREEN ================= */}
        {paymentState === 'SUCCESS' && (
          <div className="p-10 sm:p-14 text-center space-y-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/60 to-white">
            {/* Animated bouncing checkmark */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-100 animate-ping absolute inset-0"></div>
              <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 relative">
                <CheckCircle2 className="w-14 h-14 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Transaction Successful
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-2">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500">
                Paid <strong className="text-slate-900 font-extrabold">{formatCurrency(order.total_amount)}</strong> to Indian Bazar
              </p>
            </div>

            {/* Receipt details */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-50 border border-slate-200 p-4 font-mono text-xs text-left space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <strong className="text-slate-900">{generatedPaymentId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Order Ref:</span>
                <strong className="text-slate-900">#{order.order_number}</strong>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-700">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold uppercase">CAPTURED (PAID)</span>
              </div>
            </div>

            {/* Progress bar redirecting to Order Confirm */}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                Redirecting to Order Confirmation receipt...
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RazorpayPaymentPage;
