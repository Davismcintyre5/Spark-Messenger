import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/services/api';

export default function ProfileSetupPage() {
  const { user, updateUser, finishSetup } = useAuth();
  const addToast = useUIStore((s) => s.addToast);

  const [displayName, setDisplayName] = useState(
    user?.displayName && !/^User\d+$/.test(user.displayName) ? user.displayName : '',
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      const response = await api.patch('/users/me', { displayName, bio });
      updateUser(response.data.data);
      finishSetup();
      addToast({ type: 'success', message: 'Profile saved!' });
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Set Up Your Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This is how others will see you on Spark
        </p>
      </div>

      <div className="relative">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-spark-100 dark:bg-spark-900 flex items-center justify-center">
            <User className="w-10 h-10 text-spark-500" />
          </div>
        )}
        <button
          type="button"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-spark-500 text-white flex items-center justify-center shadow-lg"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full space-y-4">
        <Input
          label="Display Name"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label="Bio (optional)"
          placeholder="About you..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Continue to Spark
      </Button>

      <button type="button" onClick={finishSetup} className="text-sm text-gray-400">
        Skip for now
      </button>
    </form>
  );
}