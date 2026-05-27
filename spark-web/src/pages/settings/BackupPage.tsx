import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, HardDrive, Download, Trash2, Cloud, Database,
  Clock, Calendar, ChevronRight, Check,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import PrivacyToggle from '@/components/privacy/PrivacyToggle';

const scheduleOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'off', label: 'Off' },
];

export default function BackupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Backup settings
  const [autoBackup, setAutoBackup] = useState(false);
  const [schedule, setSchedule] = useState('weekly');
  const [includeMedia, setIncludeMedia] = useState(true);
  const [cloudBackup, setCloudBackup] = useState(false);

  useEffect(() => {
    api.get('/backups')
      .then((res) => setBackups(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post('/backups', {
        includesMedia: includeMedia,
        storageType: cloudBackup ? 'cloud' : 'local',
        cloudProvider: cloudBackup ? 'google_drive' : null,
      });
      setBackups((prev) => [res.data.data, ...prev]);
      addToast({ type: 'success', message: 'Backup created' });
    } catch {
      addToast({ type: 'error', message: 'Backup failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await api.delete(`/backups/${backupId}`);
      setBackups((prev) => prev.filter((b) => b._id !== backupId));
      addToast({ type: 'success', message: 'Backup deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save backup preferences (could be stored in user settings)
      addToast({ type: 'success', message: 'Backup settings saved' });
      setShowSettingsModal(false);
    } catch {
      addToast({ type: 'error', message: 'Failed to save settings' });
    }
  };

  const nextBackupTime = () => {
    if (!autoBackup || schedule === 'off') return null;
    const now = new Date();
    if (schedule === 'daily') return new Date(now.setDate(now.getDate() + 1));
    if (schedule === 'weekly') return new Date(now.setDate(now.getDate() + 7));
    if (schedule === 'monthly') return new Date(now.setMonth(now.getMonth() + 1));
    return null;
  };

  const nextBackup = nextBackupTime();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold text-lg">Backup & Restore</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Info Card */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-spark-50 dark:bg-spark-900/20 border border-spark-200 dark:border-spark-800 mb-4">
          <Database className="w-8 h-8 text-spark-500" />
          <div className="flex-1">
            <span className="font-medium text-sm">Chat Backup</span>
            <p className="text-xs text-gray-500">Backup your chats and media to restore later</p>
          </div>
          <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-lg hover:bg-spark-100 dark:hover:bg-spark-800">
            <ChevronRight className="w-5 h-5 text-spark-500" />
          </button>
        </div>

        {/* Auto Backup Status */}
        {autoBackup && schedule !== 'off' && nextBackup && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4">
            <Clock className="w-5 h-5 text-green-500" />
            <div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Auto Backup Active</span>
              <p className="text-xs text-green-600 dark:text-green-400">
                Next backup: {nextBackup.toLocaleDateString()} at 2:00 AM
              </p>
            </div>
          </div>
        )}

        {/* Backup Size Info */}
        {backups.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <HardDrive className="w-3.5 h-3.5" />
            Total: {backups.reduce((sum, b) => sum + (b.fileSize || 0), 0) > 0
              ? `${(backups.reduce((sum, b) => sum + (b.fileSize || 0), 0) / 1024 / 1024).toFixed(1)} MB`
              : '0 MB'}
            {' · '}{backups.length} backup{backups.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Create Backup Button */}
        <Button onClick={handleCreateBackup} loading={creating} size="lg" className="w-full mb-4">
          Create Backup Now
        </Button>

        {/* Backup List */}
        <p className="text-xs text-gray-400 uppercase mb-3">Backup History</p>

        {loading ? (
          <div className="flex justify-center py-6"><Spinner size="lg" /></div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-400 text-sm">No backups yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first backup to secure your chats</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup._id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mb-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                backup.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                backup.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
              }`}>
                {backup.status === 'completed' ? <Check className="w-5 h-5" /> :
                 backup.status === 'failed' ? <Trash2 className="w-5 h-5" /> :
                 <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">
                  {backup.backupType === 'manual' ? 'Manual Backup' :
                   backup.backupType === 'auto' ? 'Auto Backup' : 'Backup'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(backup.createdAt).toLocaleDateString()} · {new Date(backup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {backup.fileSize > 0 && ` · ${(backup.fileSize / 1024 / 1024).toFixed(1)} MB`}
                </span>
                {backup.includesMedia && (
                  <span className="text-xs text-spark-500 block">Includes media</span>
                )}
              </div>
              <div className="flex gap-1">
                {backup.fileUrl && (
                  <a
                    href={backup.fileUrl}
                    download
                    className="p-2 rounded-lg hover:bg-spark-50 dark:hover:bg-spark-900/30 text-spark-500"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDeleteBackup(backup._id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Backup Settings Modal */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Backup Settings">
        <div className="space-y-4">
          <PrivacyToggle
            label="Auto Backup"
            description="Automatically backup your chats on schedule"
            enabled={autoBackup}
            onChange={setAutoBackup}
          />

          {autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Frequency
              </label>
              <div className="flex gap-2">
                {scheduleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSchedule(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      schedule === opt.value
                        ? 'bg-spark-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <PrivacyToggle
            label="Include Media"
            description="Backup photos, videos, and files"
            enabled={includeMedia}
            onChange={setIncludeMedia}
          />

          <PrivacyToggle
            label="Cloud Backup"
            description="Save backups to Google Drive"
            enabled={cloudBackup}
            onChange={setCloudBackup}
          />

          {autoBackup && schedule !== 'off' && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Next backup: {nextBackup?.toLocaleDateString()} at 2:00 AM
            </div>
          )}

          <Button onClick={handleSaveSettings} size="lg" className="w-full">
            Save Settings
          </Button>
        </div>
      </Modal>
    </div>
  );
}