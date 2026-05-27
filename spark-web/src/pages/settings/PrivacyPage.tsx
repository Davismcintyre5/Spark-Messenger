import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Shield, Timer, MessageSquare, Mic, Trash2 } from 'lucide-react';
import PrivacyToggle from '@/components/privacy/PrivacyToggle';
import { privacyService } from '@/services/privacyService';
import { PrivacySettings } from '@/types/models';
import { useUIStore } from '@/stores/uiStore';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const defaultPrivacy: PrivacySettings = {
  lastSeen: 'everyone', profilePhoto: 'everyone', about: 'everyone', status: 'all',
  readReceipts: true, typingIndicator: true, onlineStatus: true,
  freezeLastSeen: false, hideBlueTicks: false, hideDoubleTicks: false,
  hideTyping: false, hideRecording: false, antiDeleteMessages: false,
  antiDeleteStatus: false, ghostMode: false,
};

export default function PrivacyPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacy);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    privacyService.getPrivacy()
      .then((data) => setPrivacy(data.privacy || defaultPrivacy))
      .catch((err) => {
        console.error('Failed to load privacy settings:', err);
        addToast({ type: 'error', message: 'Failed to load privacy settings' });
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle boolean toggles
  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    try {
      await privacyService.updatePrivacy({ [key]: value });
      addToast({ type: 'success', message: `${key} updated` });
    } catch (error) {
      setPrivacy(privacy);
      addToast({ type: 'error', message: 'Failed to update setting' });
    }
  };

  // Handle select dropdown changes (lastSeen, profilePhoto, about)
  const handleSelectChange = async (key: 'lastSeen' | 'profilePhoto' | 'about', value: string) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    try {
      await privacyService.updatePrivacy({ [key]: value });
      addToast({ type: 'success', message: `${key} updated` });
    } catch (error) {
      setPrivacy(privacy);
      addToast({ type: 'error', message: 'Failed to update setting' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await privacyService.deleteAccount();
      localStorage.clear();
      sessionStorage.clear();
      addToast({ type: 'success', message: 'Account deleted successfully' });
      navigate('/login');
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete account' });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold text-lg">Privacy & Security</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Ghost Mode */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Ghost Mode</h3>
          <PrivacyToggle
            label="Ghost Mode"
            description="Appear completely offline to everyone"
            enabled={privacy.ghostMode}
            onChange={(v) => handleToggle('ghostMode', v)}
          />
          <PrivacyToggle
            label="Freeze Last Seen"
            description="Your last seen timestamp stays frozen"
            enabled={privacy.freezeLastSeen}
            onChange={(v) => handleToggle('freezeLastSeen', v)}
          />
        </div>

        {/* Read Receipts & Indicators */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Read Receipts & Indicators</h3>
          <PrivacyToggle 
            label="Read Receipts" 
            enabled={privacy.readReceipts} 
            onChange={(v) => handleToggle('readReceipts', v)} 
          />
          <PrivacyToggle 
            label="Hide Blue Ticks" 
            description="Read without sender knowing" 
            enabled={privacy.hideBlueTicks} 
            onChange={(v) => handleToggle('hideBlueTicks', v)} 
          />
          <PrivacyToggle 
            label="Hide Double Ticks" 
            description="Delivery confirmation hidden" 
            enabled={privacy.hideDoubleTicks} 
            onChange={(v) => handleToggle('hideDoubleTicks', v)} 
          />
          <PrivacyToggle 
            label="Hide Typing" 
            enabled={privacy.hideTyping} 
            onChange={(v) => handleToggle('hideTyping', v)} 
          />
          <PrivacyToggle 
            label="Hide Recording" 
            enabled={privacy.hideRecording} 
            onChange={(v) => handleToggle('hideRecording', v)} 
          />
        </div>

        {/* Anti-Delete */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Anti-Delete</h3>
          <PrivacyToggle
            label="Anti-Delete Messages"
            description="Messages deleted by sender stay visible"
            enabled={privacy.antiDeleteMessages}
            onChange={(v) => handleToggle('antiDeleteMessages', v)}
          />
          <PrivacyToggle
            label="Anti-Delete Status"
            description="Statuses deleted by poster stay visible"
            enabled={privacy.antiDeleteStatus}
            onChange={(v) => handleToggle('antiDeleteStatus', v)}
          />
        </div>

        {/* Visibility */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Visibility</h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm font-medium">Last Seen</span>
              <p className="text-xs text-gray-400">Who can see your last seen</p>
            </div>
            <select
              value={privacy.lastSeen}
              onChange={(e) => handleSelectChange('lastSeen', e.target.value as 'everyone' | 'contacts' | 'nobody')}
              className="text-sm bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm font-medium">Profile Photo</span>
              <p className="text-xs text-gray-400">Who can see your profile photo</p>
            </div>
            <select
              value={privacy.profilePhoto}
              onChange={(e) => handleSelectChange('profilePhoto', e.target.value as 'everyone' | 'contacts' | 'nobody')}
              className="text-sm bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="contacts">My Contacts</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-medium text-red-500 uppercase mb-2">Danger Zone</h3>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            size="sm"
            className="w-full"
          >
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">This action cannot be undone</span>
          </div>
          <p className="text-sm text-gray-500">
            Your account, messages, contacts, and all data will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg">Delete Forever</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}