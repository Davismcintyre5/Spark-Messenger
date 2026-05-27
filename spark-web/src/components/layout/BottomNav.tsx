import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle, Users, CircleDashed, Phone, Settings } from 'lucide-react';

const navItems = [
  { to: '/chats', icon: MessageCircle, label: 'Chats' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/status', icon: CircleDashed, label: 'Status' },
  { to: '/calls', icon: Phone, label: 'Calls' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-around h-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-spark-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}