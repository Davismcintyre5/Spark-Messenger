import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/authService';
import { COUNTRY_CODES } from '@/config/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${countryCode.dialCode}${phone.replace(/^0+/, '')}`;
    if (phone.length < 9) {
      addToast({ type: 'error', message: 'Please enter a valid phone number' });
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp({ phone: fullPhone });
      navigate('/verify-otp', { state: { phone: fullPhone } });
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">Sign In</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your phone number to continue</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
        <button
          type="button"
          onClick={() => setShowCountries(!showCountries)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        >
          <span>{countryCode.flag}</span>
          <span>{countryCode.name}</span>
          <span className="text-gray-400">({countryCode.dialCode})</span>
          <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
        </button>
        {showCountries && (
          <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCountryCode(c); setShowCountries(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="text-gray-400 ml-auto">{c.dialCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        label="Phone Number"
        placeholder="712 345 678"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        leftIcon={<Phone className="w-4 h-4" />}
        type="tel"
      />

      <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
        Send OTP
      </Button>
    </form>
  );
}