import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Users, Plus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { useCreateGroup } from '@/hooks/useGroups';
import { useContacts } from '@/hooks/useContacts';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/providers/AuthProvider';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const createGroup = useCreateGroup();
  const { data: contactsData } = useContacts();
  const contacts = contactsData?.contacts || [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchMembers, setSearchMembers] = useState('');

  const filteredContacts = contacts.filter((c) =>
    c.isOnSpark &&
    (!searchMembers ||
      c.contactName.toLowerCase().includes(searchMembers.toLowerCase())),
  );

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', message: 'Group name is required' });
      return;
    }
    // selectedIds should contain other members (creator will be added automatically by backend)
    if (selectedIds.length < 1) {
      addToast({ type: 'error', message: 'Select at least 1 member' });
      return;
    }
    try {
      // Send selected user IDs as participants (backend will add creator automatically)
      await createGroup.mutateAsync({ 
        name: name.trim(), 
        description, 
        participants: selectedIds 
      });
      addToast({ type: 'success', message: 'Group created!' });
      navigate('/groups');
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to create group' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">New Group</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Group Info */}
        <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-spark-100 dark:bg-spark-900 flex items-center justify-center">
                <Camera className="w-8 h-8 text-spark-500" />
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-spark-500 text-white flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <Input
            label="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this group about?"
          />
        </div>

        {/* Selected Members */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">
              {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const contact = contacts.find((c) => c.contactUserId?._id === id);
                return (
                  <div key={id} className="flex items-center gap-1.5 bg-spark-50 dark:bg-spark-900/30 rounded-full pl-1.5 pr-2.5 py-1">
                    <Avatar
                      src={contact?.contactUserId?.avatar}
                      name={contact?.contactName || 'User'}
                      size="xs"
                    />
                    <span className="text-xs font-medium">{contact?.contactName || 'User'}</span>
                    <button onClick={() => toggleMember(id)} className="ml-0.5">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className="p-4">
          <Input
            placeholder="Search contacts..."
            value={searchMembers}
            onChange={(e) => setSearchMembers(e.target.value)}
            leftIcon={<Users className="w-4 h-4" />}
            className="mb-3"
          />
          <div className="space-y-1">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No contacts found</p>
            ) : (
              filteredContacts.map((contact) => {
                const userId = contact.contactUserId?._id;
                if (!userId) return null;
                const isSelected = selectedIds.includes(userId);
                return (
                  <button
                    key={contact._id}
                    onClick={() => toggleMember(userId)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-spark-500 border-spark-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <Avatar src={contact.contactUserId?.avatar} name={contact.contactName} size="sm" />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium block">{contact.contactName}</span>
                      <span className="text-xs text-gray-400">{contact.contactPhone}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          onClick={handleCreate}
          loading={createGroup.isPending}
          disabled={!name.trim() || selectedIds.length < 1}
          size="lg"
          className="w-full"
        >
          Create Group ({selectedIds.length + 1} members including you)
        </Button>
      </div>
    </div>
  );
}