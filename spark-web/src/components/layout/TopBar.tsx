import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Avatar from '@/components/ui/Avatar';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot = location.pathname === '/chats';
  const showBack = !isRoot && (
    location.pathname.startsWith('/chats/') ||
    location.pathname.startsWith('/groups/') ||
    location.pathname.startsWith('/settings/') ||
    location.pathname.startsWith('/payments')
  );

  const pageTitles: Record<string, string> = {
    '/chats': 'Chats',
    '/groups': 'Groups',
    '/status': 'Status',
    '/calls': 'Calls',
    '/contacts': 'Contacts',
    '/ai': 'HDM AI',
    '/settings': 'Settings',
  };

  const title = pageTitles[location.pathname] || 'Spark';

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-spark-500 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 120 120" fill="none">
                <path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>
        )}
        <span className="font-semibold text-lg">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2">
          <Search className="w-5 h-5 text-gray-500" />
        </button>
        <Avatar src={user?.avatar} name={user?.displayName || 'User'} size="xs" />
      </div>
    </header>
  );
}