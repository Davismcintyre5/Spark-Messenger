import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageCircle, Phone, Star, UserPlus } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { contactService } from '@/services/contactService';
import { chatService } from '@/services/chatService';
import { callService } from '@/services/callService';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ContactsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const { data, isLoading, refetch } = useContacts();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const contacts = data?.contacts || [];
  const filtered = search
    ? contacts.filter((c) =>
        c.contactName.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPhone.includes(search),
      )
    : contacts;

  const handleSelectContact = (contact: any) => {
    navigate(`/contacts/${contact._id}`, { state: { contact } });
  };

  const handleMessage = async (e: React.MouseEvent, contact: any) => {
    e.stopPropagation();
    if (!contact.contactUserId?._id) return;
    try {
      const chat = await chatService.createDirectChat(contact.contactUserId._id);
      navigate(`/chats/${chat._id}`);
    } catch { addToast({ type: 'error', message: 'Cannot start chat' }); }
  };

  const handleCall = async (e: React.MouseEvent, contact: any) => {
    e.stopPropagation();
    if (!contact.contactUserId?._id) return;
    try {
      await callService.initiate(contact.contactUserId._id, 'voice');
      addToast({ type: 'success', message: 'Calling...' });
    } catch { addToast({ type: 'error', message: 'Call failed' }); }
  };

  const handleAddContact = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    try {
      await contactService.syncContacts([{ name: newName, phone: newPhone }]);
      addToast({ type: 'success', message: 'Contact added' });
      setShowAddModal(false);
      setNewName(''); setNewPhone('');
      refetch();
    } catch { addToast({ type: 'error', message: 'Failed to add contact' }); }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Contacts</h2>
          <button onClick={() => setShowAddModal(true)} className="p-2 rounded-lg bg-spark-500 text-white hover:bg-spark-600">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : filtered.length > 0 ? (
          filtered.map((contact) => (
            // FIXED: Changed from button to div to prevent nested button warning
            <div
              key={contact._id}
              onClick={() => handleSelectContact(contact)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 group cursor-pointer"
            >
              <Avatar src={contact.contactUserId?.avatar} name={contact.contactName} size="md" status={contact.contactUserId?.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm truncate">{contact.contactName}</span>
                  {contact.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>
                <span className="text-xs text-gray-400">{contact.contactPhone}{contact.isOnSpark && ' · on Spark'}</span>
              </div>
              {contact.isOnSpark && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleCall(e, contact)} 
                    className="p-2 rounded-full hover:bg-spark-50 text-spark-500"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleMessage(e, contact)} 
                    className="p-2 rounded-full hover:bg-spark-50 text-spark-500"
                    title="Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState title="No contacts" description="Add contacts to start chatting"
            action={<button onClick={() => setShowAddModal(true)} className="text-spark-500 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Contact</button>}
          />
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Contact">
        <div className="space-y-4">
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contact name" />
          <Input label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+254 712 345 678" />
          <Button onClick={handleAddContact} size="lg" className="w-full">Add Contact</Button>
        </div>
      </Modal>
    </div>
  );
}