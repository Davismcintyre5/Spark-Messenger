import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function TabletLayout() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <Outlet />
        </div>
        <div className="flex-1" id="tablet-detail">
          {/* Detail pane rendered by nested routes */}
        </div>
      </main>
    </div>
  );
}