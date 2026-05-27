import React from 'react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spark-500">
      <svg className="w-20 h-20 mb-4" viewBox="0 0 120 120" fill="none">
        <path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <h1 className="text-3xl font-bold text-white tracking-tight">Spark</h1>
      <p className="text-spark-200 text-xs mt-1 font-medium">Powered by HDM</p>
    </div>
  );
}