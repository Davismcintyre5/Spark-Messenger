import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import LegalOverlay from '@/components/ui/LegalOverlay';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [legalOverlay, setLegalOverlay] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="w-20 h-20 rounded-2xl bg-spark-500 flex items-center justify-center mb-6">
        <svg className="w-10 h-10" viewBox="0 0 120 120" fill="none">
          <path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spark</h1>
      <p className="text-gray-400 text-sm mt-1 mb-10">Powered by HDM</p>

      <Button onClick={() => navigate('/login')} size="lg" className="w-full">
        Get Started
      </Button>

      <p className="text-xs text-gray-400 mt-4">
        By continuing, you agree to our{' '}
        <button onClick={() => setLegalOverlay('terms')} className="text-spark-500 underline">Terms</button>
        {' '}and{' '}
        <button onClick={() => setLegalOverlay('privacy')} className="text-spark-500 underline">Privacy Policy</button>
      </p>

      <LegalOverlay type="terms" isOpen={legalOverlay === 'terms'} onClose={() => setLegalOverlay(null)} />
      <LegalOverlay type="privacy" isOpen={legalOverlay === 'privacy'} onClose={() => setLegalOverlay(null)} />
    </div>
  );
}