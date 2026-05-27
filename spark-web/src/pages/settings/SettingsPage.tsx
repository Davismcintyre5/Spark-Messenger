import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Palette, Smartphone, HardDrive, CreditCard,
  FileText, LogOut, ChevronRight, Bot, Camera,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/services/api';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const menuItems = [
  { icon: Shield, label: 'Privacy & Security', to: '/settings/privacy' },
  { icon: Palette, label: 'Themes', to: '/settings/themes' },
  { icon: Smartphone, label: 'Linked Devices', to: '/settings/devices' },
  { icon: HardDrive, label: 'Backup & Restore', to: '/settings/backup' },
  { icon: CreditCard, label: 'HDM Verified', to: '/payments' },
  { icon: Bot, label: 'HDM AI', to: '/ai' },
  { icon: FileText, label: 'Terms & Privacy', to: '/settings/legal/terms' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showProfileModal) {
      setDisplayName(user?.displayName || '');
      setBio(user?.bio || '');
      setEmail(user?.email || '');
      setUsername(user?.username || '');
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [showProfileModal, user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Only images allowed' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = user?.avatar || '';
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data.success) {
          avatarUrl = uploadRes.data.data.url;
        }
      }
      const response = await api.patch('/users/me', {
        displayName, bio, email, username, avatar: avatarUrl,
      });
      updateUser(response.data.data);
      addToast({ type: 'success', message: 'Profile saved!' });
      setShowProfileModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      addToast({ type: 'error', message: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Card */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        >
          <Avatar src={user?.avatar} name={user?.displayName || 'User'} size="lg" status={user?.status} />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base">{user?.displayName}</span>
              {user?.isHdmVerified && (
                <svg className="w-4 h-4 text-spark-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-400">{user?.phone}</span>
            {user?.bio && <p className="text-sm text-gray-500 mt-0.5 truncate">{user.bio}</p>}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Menu */}
        {menuItems.map(({ icon: Icon, label, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800/50"
          >
            <Icon className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-left text-sm">{label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Log Out</span>
        </button>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Spark Messenger v1.0.0</p>
          <p className="text-xs text-gray-400 mt-0.5">Powered by HDM</p>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile" size="md">
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center relative">
            <Avatar
              src={avatarPreview || user?.avatar}
              name={displayName || 'User'}
              size="xl"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-1/3 w-8 h-8 rounded-full bg-spark-500 text-white flex items-center justify-center shadow-lg hover:bg-spark-600"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="About you" />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
          <Button onClick={handleSaveProfile} loading={saving} size="lg" className="w-full">Save Profile</Button>
        </div>
      </Modal>
    </div>
  );
}