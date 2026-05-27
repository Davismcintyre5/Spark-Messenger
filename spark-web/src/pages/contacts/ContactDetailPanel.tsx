import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Star, Ban, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Contact } from '@/types/models';
import { chatService } from '@/services/chatService';
import { callService } from '@/services/callService';
import { contactService } from '@/services/contactService';
import { useUIStore } from '@/stores/uiStore';

export default function ContactDetailPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const contact = location.state?.contact as Contact | undefined;

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
        <p className="text-gray-400 text-sm">Contact not found</p>
      </div>
    );
  }

  const handleMessage = async () => {
    if (!contact.contactUserId?._id) return;
    try {
      const chat = await chatService.createDirectChat(contact.contactUserId._id);
      navigate(`/chats/${chat._id}`);
    } catch { addToast({ type: 'error', message: 'Cannot start chat' }); }
  };

  const handleCall = async () => {
    if (!contact.contactUserId?._id) return;
    try {
      await callService.initiate(contact.contactUserId._id, 'voice');
      addToast({ type: 'success', message: 'Calling...' });
    } catch { addToast({ type: 'error', message: 'Call failed' }); }
  };

  const handleToggleFavorite = async () => {
    try {
      if (contact.isFavorite) {
        await contactService.unfavoriteContact(contact._id);
        addToast({ type: 'success', message: 'Removed from favorites' });
      } else {
        await contactService.favoriteContact(contact._id);
        addToast({ type: 'success', message: 'Added to favorites' });
      }
    } catch { addToast({ type: 'error', message: 'Failed' }); }
  };

  const handleBlock = async () => {
    if (!window.confirm(`Block ${contact.contactName}?`)) return;
    try {
      await contactService.blockContact(contact._id);
      addToast({ type: 'success', message: 'Contact blocked' });
    } catch { addToast({ type: 'error', message: 'Failed' }); }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 h-full p-6 text-center relative">
      <button onClick={() => navigate('/contacts')} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400">
        <X className="w-5 h-5" />
      </button>

      <Avatar src={contact.contactUserId?.avatar} name={contact.contactName} size="xl" />
      <h2 className="text-xl font-semibold mt-4">{contact.contactName}</h2>
      <p className="text-gray-400 text-sm mt-1">{contact.contactPhone}</p>

      {contact.contactUserId?.bio && (
        <p className="text-gray-500 text-sm mt-2 max-w-xs">{contact.contactUserId.bio}</p>
      )}

      {contact.contactUserId?.isHdmVerified && (
        <div className="flex items-center gap-1 mt-2 text-spark-500 text-xs">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          HDM Verified
        </div>
      )}

      {contact.isOnSpark && (
        <div className="flex gap-3 mt-6">
          <Button onClick={handleMessage} size="sm">
            <MessageCircle className="w-4 h-4 mr-2" /> Message
          </Button>
          <Button onClick={handleCall} size="sm" variant="secondary">
            <Phone className="w-4 h-4 mr-2" /> Call
          </Button>
        </div>
      )}

      <div className="mt-6 w-full max-w-xs space-y-1">
        <button onClick={handleToggleFavorite} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
          <Star className={`w-4 h-4 inline mr-2 ${contact.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
          {contact.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
        <button onClick={handleBlock} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-500">
          <Ban className="w-4 h-4 inline mr-2" /> Block Contact
        </button>
      </div>
    </div>
  );
}