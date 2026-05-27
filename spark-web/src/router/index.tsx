import React from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import { useIsMobile } from '@/hooks/useMediaQuery';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

import WelcomePage from '@/pages/auth/WelcomePage';
import LoginPage from '@/pages/auth/LoginPage';
import OtpVerifyPage from '@/pages/auth/OtpVerifyPage';
import ProfileSetupPage from '@/pages/auth/ProfileSetupPage';
import ChatsPage from '@/pages/chats/ChatsPage';
import ChatDetailPage from '@/pages/chats/ChatDetailPage';
import GroupsPage from '@/pages/groups/GroupsPage';
import CreateGroupPage from '@/pages/groups/CreateGroupPage';
import GroupDetailPage from '@/pages/groups/GroupDetailPage';
import StatusPage from '@/pages/status/StatusPage';
import StatusViewerPanel from '@/pages/status/StatusViewerPanel';
import CallsPage from '@/pages/calls/CallsPage';
import CallDetailPage from '@/pages/calls/CallDetailPage';
import ContactsPage from '@/pages/contacts/ContactsPage';
import ContactDetailPanel from '@/pages/contacts/ContactDetailPanel';
import AiChatPage from '@/pages/ai/AiChatPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import PrivacyPage from '@/pages/settings/PrivacyPage';
import ThemesPage from '@/pages/settings/ThemesPage';
import LegalPage from '@/pages/settings/LegalPage';
import LinkedDevicesPage from '@/pages/settings/LinkedDevicesPage';
import BackupPage from '@/pages/settings/BackupPage';
import VerificationPage from '@/pages/payments/VerificationPage';

function EmptyContent() {
  const location = useLocation();
  const path = location.pathname;

  const configs: Record<string, { title: string; icon: React.ReactNode }> = {
    chats: {
      title: 'Select a conversation',
      icon: <svg className="w-8 h-8" viewBox="0 0 120 120" fill="none"><path d="M65 10L30 65H55L50 110L90 50H62L68 10H65Z" fill="#1A73E8"/></svg>,
    },
    groups: {
      title: 'Select a group',
      icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    status: {
      title: 'Select a status to view',
      icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
    },
    calls: {
      title: 'Select a call to view details',
      icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    },
    contacts: {
      title: 'Select a contact',
      icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  };

  const segment = path.split('/')[1] || 'chats';
  const config = configs[segment] || configs.chats;

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-spark-100 dark:bg-spark-900 flex items-center justify-center mx-auto mb-4">{config.icon}</div>
        <p className="text-gray-400 text-sm">{config.title}</p>
      </div>
    </div>
  );
}

function MobileWrapper() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
        <TopBar />
        <main className="flex-1 overflow-hidden"><Outlet /></main>
        <BottomNav />
      </div>
    );
  }
  return <Outlet />;
}

function SplitLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  if (isMobile) return <>{children}</>;
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-[380px] border-r border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0">{children}</div>
      <div className="flex-1 overflow-hidden"><Outlet /></div>
    </div>
  );
}

function FullLayout() {
  const isMobile = useIsMobile();
  if (isMobile) return <Outlet />;
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden"><Outlet /></div>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    { path: '/', element: <GuestRoute><AuthLayout><WelcomePage /></AuthLayout></GuestRoute> },
    { path: '/login', element: <GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute> },
    { path: '/verify-otp', element: <GuestRoute><AuthLayout><OtpVerifyPage /></AuthLayout></GuestRoute> },
    { path: '/setup', element: <ProtectedRoute allowSetup><AuthLayout><ProfileSetupPage /></AuthLayout></ProtectedRoute> },

    {
      element: <ProtectedRoute><MobileWrapper /></ProtectedRoute>,
      children: [
        {
          path: 'chats',
          element: <SplitLayout><ChatsPage /></SplitLayout>,
          children: [
            { index: true, element: <EmptyContent /> },
            { path: ':chatId', element: <ChatDetailPage /> },
          ],
        },
        {
          path: 'groups',
          element: <SplitLayout><GroupsPage /></SplitLayout>,
          children: [
            { index: true, element: <EmptyContent /> },
            { path: ':groupId', element: <GroupDetailPage /> },
          ],
        },
        {
          path: 'status',
          element: <SplitLayout><StatusPage /></SplitLayout>,
          children: [
            { index: true, element: <EmptyContent /> },
            { path: ':statusId', element: <StatusViewerPanel /> },
          ],
        },
        {
          path: 'calls',
          element: <SplitLayout><CallsPage /></SplitLayout>,
          children: [
            { index: true, element: <EmptyContent /> },
            { path: ':callId', element: <CallDetailPage /> },
          ],
        },
        {
          path: 'contacts',
          element: <SplitLayout><ContactsPage /></SplitLayout>,
          children: [
            { index: true, element: <EmptyContent /> },
            { path: ':contactId', element: <ContactDetailPanel /> },
          ],
        },
        {
          element: <FullLayout />,
          children: [
            { path: 'groups/create', element: <CreateGroupPage /> },
            { path: 'ai', element: <AiChatPage /> },
            { path: 'settings', element: <SettingsPage /> },
            { path: 'settings/privacy', element: <PrivacyPage /> },
            { path: 'settings/themes', element: <ThemesPage /> },
            { path: 'settings/devices', element: <LinkedDevicesPage /> },
            { path: 'settings/backup', element: <BackupPage /> },
            { path: 'settings/legal', element: <LegalPage /> },
            { path: 'settings/legal/:type', element: <LegalPage /> },
            { path: 'payments', element: <VerificationPage /> },
          ],
        },
      ],
    },

    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { future: { v7_startTransition: true } },
);