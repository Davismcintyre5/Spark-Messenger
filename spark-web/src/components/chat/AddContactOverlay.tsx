import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { contactService } from '@/services/contactService';
import { useUIStore } from '@/stores/uiStore';

interface AddContactOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  name: string;
}

export default function AddContactOverlay({ isOpen, onClose, phone, name }: AddContactOverlayProps) {
  const [contactName, setContactName] = useState(name || '');
  const [loading, setLoading] = useState(false);
  const addToast = useUIStore((s) => s.addToast);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!contactName.trim()) return;
    setLoading(true);
    try {
      await contactService.syncContacts([{ name: contactName.trim(), phone }]);
      addToast({ type: 'success', message: 'Contact added!' });
      onClose();
    } catch {
      addToast({ type: 'error', message: 'Failed to add contact' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-spark-500" />
            <h3 className="text-lg font-semibold">Add to Contacts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Phone</label>
            <p className="text-sm font-medium">{phone}</p>
          </div>
          <Input
            label="Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact name"
          />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-500 rounded-xl border border-gray-200 dark:border-gray-700">
              Cancel
            </button>
            <Button onClick={handleAdd} loading={loading} className="flex-1">
              Add Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}