import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import Spinner from '@/components/ui/Spinner';

interface GuestRouteProps { children: React.ReactNode; }

export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, needsSetup } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (needsSetup) return <Navigate to="/setup" replace />;
    return <Navigate to="/chats" replace />;
  }

  return <>{children}</>;
}