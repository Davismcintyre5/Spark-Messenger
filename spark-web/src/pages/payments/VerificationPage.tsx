import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, Banknote, Copy, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';

interface PlanPrice {
  plan: string;
  amount: number;
  symbol: string;
  formatted: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description: string;
  isAuto: boolean;
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const addToast = useUIStore((s) => s.addToast);

  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, PlanPrice>>({});
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Selection state
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'permanent'>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<'plans' | 'payment' | 'confirm'>('plans');

  // Manual payment inputs
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load settings from admin
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings/public');
        const settings = res.data.data;

        if (settings) {
          setCurrency(settings.planCurrency || 'USD');
          setCurrencySymbol(settings.currencySymbol || '$');

          // Build prices
          const rates = settings.exchangeRates || { USD: 1, KES: 130, EUR: 0.92, GBP: 0.79 };
          const rate = rates[settings.planCurrency] || 1;
          const sym = settings.currencySymbol || '$';

          setPrices({
            monthly: { plan: 'monthly', amount: parseFloat((settings.planMonthlyPrice * rate).toFixed(2)), symbol: sym, formatted: `${sym} ${(settings.planMonthlyPrice * rate).toFixed(2)}` },
            yearly: { plan: 'yearly', amount: parseFloat((settings.planYearlyPrice * rate).toFixed(2)), symbol: sym, formatted: `${sym} ${(settings.planYearlyPrice * rate).toFixed(2)}` },
            permanent: { plan: 'permanent', amount: parseFloat((settings.planPermanentPrice * rate).toFixed(2)), symbol: sym, formatted: `${sym} ${(settings.planPermanentPrice * rate).toFixed(2)}` },
          });

          // Build payment methods from admin settings
          const pm = settings.paymentMethods || {};
          const enabledMethods: PaymentMethod[] = [];

          if (pm.stripe) enabledMethods.push({ id: 'stripe', name: 'Credit/Debit Card', type: 'stripe', enabled: true, description: 'Pay securely with Stripe', isAuto: true });
          if (pm.mpesaStkPush) enabledMethods.push({ id: 'mpesa_stk_push', name: 'M-Pesa STK Push', type: 'mpesa_stk_push', enabled: true, description: 'Instant popup on your phone', isAuto: true });
          if (pm.mpesaSendMoney) enabledMethods.push({ id: 'mpesa_send_money', name: 'M-Pesa Send Money', type: 'mpesa_send_money', enabled: true, description: `Send to: ${settings.mpesaReceivePhone || '0712345678'}`, isAuto: false });
          if (pm.mpesaPaybill) enabledMethods.push({ id: 'mpesa_paybill', name: 'M-Pesa Paybill', type: 'mpesa_paybill', enabled: true, description: `Business: ${settings.mpesaPaybillNumber || '247247'}`, isAuto: false });
          if (pm.mpesaTill) enabledMethods.push({ id: 'mpesa_till', name: 'M-Pesa Buy Goods (Till)', type: 'mpesa_till', enabled: true, description: `Till: ${settings.mpesaTillNumber || '123456'}`, isAuto: false });
          if (pm.paypal) enabledMethods.push({ id: 'paypal', name: 'PayPal', type: 'paypal', enabled: true, description: 'Pay with PayPal', isAuto: true });

          setMethods(enabledMethods);
        }
      } catch {
        // Fallback defaults
        setPrices({
          monthly: { plan: 'monthly', amount: 1.00, symbol: '$', formatted: '$ 1.00' },
          yearly: { plan: 'yearly', amount: 9.99, symbol: '$', formatted: '$ 9.99' },
          permanent: { plan: 'permanent', amount: 24.99, symbol: '$', formatted: '$ 24.99' },
        });
        setMethods([
          { id: 'stripe', name: 'Credit/Debit Card', type: 'stripe', enabled: true, description: 'Pay securely with Stripe', isAuto: true },
          { id: 'mpesa_stk_push', name: 'M-Pesa STK Push', type: 'mpesa_stk_push', enabled: true, description: 'Instant popup on your phone', isAuto: true },
          { id: 'mpesa_send_money', name: 'M-Pesa Send Money', type: 'mpesa_send_money', enabled: true, description: 'Send to: 0712345678', isAuto: false },
          { id: 'mpesa_paybill', name: 'M-Pesa Paybill', type: 'mpesa_paybill', enabled: true, description: 'Business: 247247', isAuto: false },
          { id: 'mpesa_till', name: 'M-Pesa Buy Goods (Till)', type: 'mpesa_till', enabled: true, description: 'Till: 123456', isAuto: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Already verified
  if (user?.isHdmVerified) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => navigate('/settings')} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-lg">HDM Verified</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle className="w-16 h-16 text-spark-500 mb-4" />
          <h2 className="text-xl font-semibold">You're Verified!</h2>
          <p className="text-gray-400 mt-2">Your blue tick is active on your profile</p>
          <p className="text-sm text-gray-400 mt-1">
            Plan: {user.hdmVerifiedPlan} {user.hdmVerifiedExpiresAt ? `· Expires ${new Date(user.hdmVerifiedExpiresAt).toLocaleDateString()}` : '· Never expires'}
          </p>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (plan: 'monthly' | 'yearly' | 'permanent') => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method.isAuto) {
      // Auto methods — process immediately
      handleSubmitPayment(method);
    } else {
      // Manual methods — show input step
      setStep('confirm');
    }
  };

  const handleSubmitPayment = async (method?: PaymentMethod) => {
    const paymentMethod = method || selectedMethod;
    if (!paymentMethod) return;

    setProcessing(true);
    try {
      const payload: any = {
        plan: selectedPlan,
        paymentMethod: paymentMethod.type,
      };

      // Add phone for M-Pesa methods
      if (paymentMethod.type.startsWith('mpesa')) {
        payload.phone = mpesaPhone || user?.phone;
      }

      if (paymentMethod.type === 'mpesa_send_money' || paymentMethod.type === 'mpesa_paybill' || paymentMethod.type === 'mpesa_till') {
        payload.transactionRef = transactionRef;
      }

      const res = await api.post('/payments/initiate', payload);

      if (res.data.data?.paymentUrl) {
        // Stripe — redirect
        window.location.href = res.data.data.paymentUrl;
      } else {
        addToast({ type: 'success', message: 'Payment submitted! Awaiting approval.' });
        navigate('/settings');
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Payment failed' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <header className="h-14 flex items-center gap-3 px-4 border-b"><ArrowLeft className="w-5 h-5" /><h1 className="font-semibold text-lg">HDM Verified</h1></header>
        <div className="flex items-center justify-center flex-1"><Spinner size="lg" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => step === 'plans' ? navigate('/settings') : setStep('plans')} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold text-lg">
          {step === 'plans' ? 'Get HDM Verified' : step === 'payment' ? 'Payment Method' : 'Confirm Payment'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* PLANS STEP */}
        {step === 'plans' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Choose a plan to get the blue verification badge</p>
            {Object.values(prices).map((p) => (
              <button
                key={p.plan}
                onClick={() => handleSelectPlan(p.plan as any)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPlan === p.plan ? 'border-spark-500 bg-spark-50 dark:bg-spark-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm capitalize">{p.plan}</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.plan === 'monthly' ? 'Billed monthly' : p.plan === 'yearly' ? 'Billed annually' : 'One-time payment'}
                    </p>
                  </div>
                  <span className="text-xl font-bold">{p.formatted}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  <li className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-spark-500" /> HDM Verified Blue Tick</li>
                  <li className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-spark-500" /> Priority Support</li>
                  {p.plan === 'permanent' && <li className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-spark-500" /> Never Expires</li>}
                </ul>
              </button>
            ))}
          </div>
        )}

        {/* PAYMENT METHOD STEP */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-spark-50 dark:bg-spark-900/20 mb-2">
              <span className="text-sm font-medium capitalize">{selectedPlan}</span>
              <span className="text-xl font-bold ml-2">{prices[selectedPlan]?.formatted}</span>
            </div>
            <p className="text-sm text-gray-400">Select payment method</p>
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMethod(m)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod?.id === m.id ? 'border-spark-500 bg-spark-50 dark:bg-spark-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {m.type === 'stripe' ? <CreditCard className="w-5 h-5 text-spark-500" /> :
                   m.type === 'paypal' ? <CreditCard className="w-5 h-5 text-blue-500" /> :
                   <Smartphone className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-sm block">{m.name}</span>
                  <span className="text-xs text-gray-400">{m.description}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${m.isAuto ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {m.isAuto ? 'Auto' : 'Manual'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* CONFIRM STEP — Manual methods */}
        {step === 'confirm' && selectedMethod && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs">Complete the payment on your phone, then submit the confirmation below.</p>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              {selectedMethod.type === 'mpesa_send_money' && (
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Go to M-Pesa → Send Money</li>
                  <li>Enter phone: <strong>0712345678</strong></li>
                  <li>Enter name: <strong>HDM</strong></li>
                  <li>Amount: <strong>{prices[selectedPlan]?.formatted}</strong></li>
                  <li>Enter PIN → Send</li>
                </ol>
              )}
              {selectedMethod.type === 'mpesa_paybill' && (
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Go to M-Pesa → Lipa na M-Pesa → Paybill</li>
                  <li>Business Number: <strong>247247</strong></li>
                  <li>Account Number: <strong>{user?.phone || 'Your phone'}</strong></li>
                  <li>Amount: <strong>{prices[selectedPlan]?.formatted}</strong></li>
                  <li>Enter PIN → Send</li>
                </ol>
              )}
              {selectedMethod.type === 'mpesa_till' && (
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Go to M-Pesa → Lipa na M-Pesa → Buy Goods</li>
                  <li>Till Number: <strong>123456</strong></li>
                  <li>Amount: <strong>{prices[selectedPlan]?.formatted}</strong></li>
                  <li>Enter PIN → Send</li>
                </ol>
              )}
            </div>

            {/* Input fields */}
            <Input
              label="Your M-Pesa Phone Number"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="+254 712 345 678"
            />
            <Input
              label="Transaction Reference (optional)"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="M-Pesa confirmation code"
            />

            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-600">
              ⚠️ Submit within 2 hours or your request will be auto-rejected.
            </div>

            <Button onClick={() => handleSubmitPayment()} loading={processing} size="lg" className="w-full">
              I Have Paid — Submit for Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}