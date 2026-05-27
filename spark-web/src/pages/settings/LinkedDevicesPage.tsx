import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Laptop, Smartphone, Tablet, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import Spinner from '@/components/ui/Spinner';

export default function LinkedDevicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/sessions')
      .then((res) => setSessions(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogoutSession = async (sessionId: string) => {
    try {
      await api.delete(`/users/me/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      addToast({ type: 'success', message: 'Device logged out' });
    } catch {
      addToast({ type: 'error', message: 'Failed' });
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out from all other devices?')) return;
    try {
      await api.post('/auth/logout-all');
      setSessions([]);
      addToast({ type: 'success', message: 'All devices logged out' });
    } catch {
      addToast({ type: 'error', message: 'Failed' });
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type?.includes('mobile') || type?.includes('phone')) return <Smartphone className="w-5 h-5" />;
    if (type?.includes('tablet') || type?.includes('ipad')) return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold text-lg">Linked Devices</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active sessions</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-400 mb-2">
              These devices are currently logged into your account. Log out any you don't recognize.
            </p>
            {sessions.map((session) => (
              <div
                key={session._id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  {getDeviceIcon(session.deviceInfo?.deviceType)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block">
                    {session.deviceInfo?.deviceName || 'Unknown Device'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session.deviceInfo?.browser || 'Unknown'} · {session.deviceInfo?.os || ''}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    Last active: {new Date(session.lastActivity).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleLogoutSession(session._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={handleLogoutAll}
              className="w-full mt-4 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Log Out All Devices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}