import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';

export default function OtpVerifyPage() {
  const location = useLocation();
  const phone = (location.state as any)?.phone || '';
  const { login } = useAuth();
  const addToast = useUIStore((s) => s.addToast);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d)) handleVerify(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const result = await authService.verifyOtp({
        phone,
        otp: code,
        deviceInfo: { deviceType: 'web', os: navigator.platform },
      });
      if (result.data) {
        login(result.data.accessToken, result.data.refreshToken, result.data.user as any);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Invalid OTP' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    try {
      await authService.sendOtp({ phone });
      addToast({ type: 'success', message: 'OTP resent' });
    } catch {
      addToast({ type: 'error', message: 'Failed to resend OTP' });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verify OTP</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We sent a code to {phone}</p>
      </div>

      <div className="flex gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-spark-500"
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerify(otp.join(''))}
        loading={loading}
        disabled={otp.some((d) => !d)}
        size="lg"
        className="w-full"
      >
        Verify
      </Button>

      <p className="text-sm text-gray-500">
        {timer > 0 ? (
          <>Resend code in {timer}s</>
        ) : (
          <button onClick={handleResend} className="text-spark-500 font-medium">Resend OTP</button>
        )}
      </p>
    </div>
  );
}