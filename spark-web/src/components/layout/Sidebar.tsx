import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Users,
  CircleDashed,
  Phone,
  UserRound,
  Bot,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Avatar from '@/components/ui/Avatar';

const navItems = [
  { to: '/chats', icon: MessageCircle, label: 'Chats' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/status', icon: CircleDashed, label: 'Status' },
  { to: '/calls', icon: Phone, label: 'Calls' },
  { to: '/contacts', icon: UserRound, label: 'Contacts' },
  { to: '/ai', icon: Bot, label: 'HDM AI' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-16 lg:w-20 flex flex-col items-center py-4 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
      {/* Spark Logo */}
      <NavLink to="/chats" className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-spark-500 flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 120 120" fill="none">
            <path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#FFFFFF"/>
          </svg>
        </div>
      </NavLink>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'bg-spark-100 dark:bg-spark-900 text-spark-600 dark:text-spark-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          );
        })}
      </nav>

      {/* User Avatar */}
      <NavLink to="/settings" className="mt-auto">
        <Avatar
          src={user?.avatar}
          name={user?.displayName || 'User'}
          size="sm"
          status={user?.status}
        />
      </NavLink>
    </aside>
  );
}