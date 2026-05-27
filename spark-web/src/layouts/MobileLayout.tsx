import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';

export default function MobileLayout() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}