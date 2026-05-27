import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function DesktopLayout() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <Outlet />
    </div>
  );
}