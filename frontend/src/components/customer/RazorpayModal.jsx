import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  QrCode,
  Check,
  AlertCircle,
} from 'lucide-react';

export const RazorpayModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  orderNumber,
  customerName = 'Customer',
  customerEmail = '',
  customerPhone = '',
}) => {
  const [activeTab, setActiveTab] = useState('UPI'); // UPI | CARDS | NETBANKING | WALLETS
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [showQr, setShowQr] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('786');
  const [cardName, setCardName] = useState(customerName || 'Shaikh Amaan');

  // Animation states: 'IDLE' | 'PROCESSING' | 'SUCCESS'
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

  useEffect(() => {
    if (isOpen) {
      setPaymentState('IDLE');
      setProcessingStep(0);
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      setGeneratedPaymentId(`pay_${randomSuffix}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    setPaymentState('PROCESSING');
    setProcessingStep(1);

    // Simulated authentic processing steps
    setTimeout(() => {
      setProcessingStep(2);
    }, 1000);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1800);

    setTimeout(() => {
      setPaymentState('SUCCESS');
    }, 2600);

    // After success animation, invoke callback
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          razorpay_payment_id: generatedPaymentId,
          razorpay_order_id: `order_${orderNumber || 'MOCK'}`,
          razorpay_signature: 'mock_signature_valid',
        });
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      {/* Razorpay Shell Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* ================= 1. RAZORPAY HEADER ================= */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between relative select-none">
          {/* Merchant & Order info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/20">
              IB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Indian Bazar
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Order #{orderNumber || 'IB-DIRECT'}
              </p>
            </div>
          </div>

          {/* Amount and Razorpay Brand */}
          <div className="text-right">
            <div className="text-xs text-slate-300">Amount Due</div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {formatCurrency(amount)}
            </div>
          </div>

          {/* Close button (only when IDLE) */}
          {paymentState === 'IDLE' && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cancel payment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Razorpay Subheader Bar */}
        <div className="bg-[#07172b] px-4 py-1.5 text-[11px] text-slate-300 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>Razorpay Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" /> 256-bit SSL Encrypted
          </div>
        </div>

        {/* ================= 2. BODY CONTENT ================= */}
        {paymentState === 'IDLE' && (
          <div className="flex-1 overflow-y-auto">
            {/* Tabs for payment modes */}
            <div className="grid grid-cols-4 bg-slate-100/90 p-1 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
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
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
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
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
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
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'WALLETS'
                    ? 'bg-white text-[#0c83fd] shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallets</span>
              </button>
            </div>

            {/* Tab 1: UPI Options */}
            {activeTab === 'UPI' && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Instant UPI Apps
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="text-xs text-[#0c83fd] hover:underline font-semibold flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQr ? 'Hide QR' : 'Show UPI QR'}
                  </button>
                </div>

                {showQr ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              (i % 2 === 0 || i % 7 === 0) ? 'bg-white' : 'bg-slate-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'gpay', name: 'Google Pay', badge: 'Fastest', color: 'border-blue-300 bg-blue-50/50' },
                      { id: 'phonepe', name: 'PhonePe', badge: 'Popular', color: 'border-purple-300 bg-purple-50/50' },
                      { id: 'paytm', name: 'Paytm UPI', badge: '', color: 'border-cyan-300 bg-cyan-50/50' },
                      { id: 'bhim', name: 'BHIM UPI', badge: '', color: 'border-emerald-300 bg-emerald-50/50' },
                    ].map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedUpiApp === app.id
                            ? 'border-[#0c83fd] bg-blue-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
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
                          <div className="w-4 h-4 rounded-full bg-[#0c83fd] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual UPI ID */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Or Enter UPI ID / VPA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-[#0c83fd] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Test Mode: Clicking <strong>"Pay {formatCurrency(amount)}"</strong> will directly simulate payment approval without requesting UPI PIN.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Cards */}
            {activeTab === 'CARDS' && (
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="relative rounded-2xl p-4 bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>TEST CARD</span>
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
                      <div className="text-slate-400 text-[8px]">EXPIRES</div>
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
                      className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0c83fd] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Netbanking */}
            {activeTab === 'NETBANKING' && (
              <div className="p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Popular Indian Banks
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'HDFC', name: 'HDFC Bank' },
                    { id: 'SBI', name: 'State Bank of India' },
                    { id: 'ICICI', name: 'ICICI Bank' },
                    { id: 'AXIS', name: 'Axis Bank' },
                    { id: 'KOTAK', name: 'Kotak Mahindra' },
                    { id: 'PNB', name: 'Punjab National Bank' },
                  ].map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
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

            {/* Tab 4: Wallets */}
            {activeTab === 'WALLETS' && (
              <div className="p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Wallet
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet' },
                    { id: 'phonepe', name: 'PhonePe Wallet' },
                    { id: 'mobikwik', name: 'MobiKwik' },
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
          </div>
        )}

        {/* ================= 3. PROCESSING ANIMATION SCREEN ================= */}
        {paymentState === 'PROCESSING' && (
          <div className="p-8 sm:p-12 text-center space-y-6 flex-1 flex flex-col items-center justify-center animate-fadeIn">
            {/* Spinning Shield Logo */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#0c83fd]/20 border-t-[#0c83fd] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#0c83fd] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                {processingStep === 1 && 'Connecting to Razorpay Gateway...'}
                {processingStep === 2 && 'Authorizing with Banking Server...'}
                {processingStep >= 3 && 'Approving Transaction...'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Securing payment of {formatCurrency(amount)}
              </p>
            </div>

            {/* Step progress pills */}
            <div className="w-full max-w-xs space-y-2 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-700">
                <span>1. Merchant Validation</span>
                <span className="text-emerald-600 font-bold">✓ Approved</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>2. 256-bit Token Handshake</span>
                <span className={processingStep >= 2 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {processingStep >= 2 ? '✓ Secure' : 'Waiting...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>3. Bank Clearance</span>
                <span className={processingStep >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {processingStep >= 3 ? '✓ Complete' : 'Waiting...'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 animate-pulse">
              Please do not press back or refresh this window...
            </p>
          </div>
        )}

        {/* ================= 4. AUTHENTIC RAZORPAY SUCCESS SCREEN ================= */}
        {paymentState === 'SUCCESS' && (
          <div className="p-8 sm:p-10 text-center space-y-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/50 to-white animate-scaleUp">
            {/* Pulsing Green Checkmark Ring */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-100/80 animate-ping absolute inset-0"></div>
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
                Paid <strong className="text-slate-900 font-extrabold">{formatCurrency(amount)}</strong> to Indian Bazar
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-50 border border-slate-200/80 p-4 font-mono text-xs text-left space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <strong className="text-slate-900">{generatedPaymentId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Order Ref:</span>
                <strong className="text-slate-900">#{orderNumber}</strong>
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

            {/* Automatic redirection countdown animation */}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                Redirecting back to Indian Bazar confirmation...
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. FOOTER BUTTON (ONLY ON IDLE) ================= */}
        {paymentState === 'IDLE' && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-2">
            <button
              type="button"
              onClick={handlePay}
              className="w-full py-3.5 px-4 rounded-xl font-heading font-bold text-sm sm:text-base text-white bg-[#0c83fd] hover:bg-[#0b74e0] active:scale-[0.99] transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Pay {formatCurrency(amount)}</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span>Secured by</span>
              <strong className="text-slate-600 font-bold tracking-tight">Razorpay</strong>
              <span>• PCI-DSS Compliant</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
