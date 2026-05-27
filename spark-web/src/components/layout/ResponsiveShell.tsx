import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import IncomingCallModal from '@/components/calls/IncomingCallModal';
import ChatsPage from '@/pages/chats/ChatsPage';
import GroupsPage from '@/pages/groups/GroupsPage';
import StatusPage from '@/pages/status/StatusPage';
import CallsPage from '@/pages/calls/CallsPage';
import ContactsPage from '@/pages/contacts/ContactsPage';

function SparkIcon() {
  return <svg className="w-8 h-8" viewBox="0 0 120 120" fill="none"><path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#1A73E8"/></svg>;
}
function UsersIcon() {
  return <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function StatusCircleIcon() {
  return <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
}
function ContactIcon() {
  return <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

export default function ResponsiveShell() {
  const breakpoint = useMediaQuery();
  const location = useLocation();
  const isMobile = breakpoint === 'mobile';
  const path = location.pathname;

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
        <TopBar />
        <main className="flex-1 overflow-hidden"><Outlet /></main>
        <BottomNav />
      </div>
    );
  }

  const isSplitView = path.startsWith('/chats') || path.startsWith('/groups') || path.startsWith('/status') || path.startsWith('/calls') || path.startsWith('/contacts');
  const isDetailPage = path.match(/\/chats\/[^/]+/) || path.match(/\/groups\/[^/]+/) || path.match(/\/status\/[^/]+/);

  const getListComponent = () => {
    if (path.startsWith('/chats')) return <ChatsPage />;
    if (path.startsWith('/groups')) return <GroupsPage />;
    if (path.startsWith('/status')) return <StatusPage />;
    if (path.startsWith('/calls')) return <CallsPage />;
    if (path.startsWith('/contacts')) return <ContactsPage />;
    return null;
  };

  const getEmptyContent = () => {
    if (path.startsWith('/chats')) return { title: 'Select a conversation', icon: <SparkIcon /> };
    if (path.startsWith('/groups')) return { title: 'Select a group', icon: <UsersIcon /> };
    if (path.startsWith('/status')) return { title: 'Select a status to view', icon: <StatusCircleIcon /> };
    if (path.startsWith('/calls')) return { title: 'Select a call to view details', icon: <PhoneIcon /> };
    if (path.startsWith('/contacts')) return { title: 'Select a contact', icon: <ContactIcon /> };
    return { title: 'Select a conversation', icon: <SparkIcon /> };
  };

  if (!isSplitView) {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-hidden"><Outlet /></main>
      </div>
    );
  }

  const empty = getEmptyContent();
  const list = getListComponent();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <Sidebar />
      <div className="w-[380px] border-r border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0">{list}</div>
      <main className="flex-1 overflow-hidden">
        {isDetailPage ? <Outlet /> : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-spark-100 dark:bg-spark-900 flex items-center justify-center mx-auto mb-4">{empty.icon}</div>
              <p className="text-gray-400 text-sm">{empty.title}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}