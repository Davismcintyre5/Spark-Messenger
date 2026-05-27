import React from 'react';
import { Contact } from '@/types/models';
import Avatar from '@/components/ui/Avatar';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContactListItemProps {
  contact: Contact;
}

export default function ContactListItem({ contact }: ContactListItemProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <Avatar
        src={contact.contactUserId?.avatar}
        name={contact.contactName}
        size="md"
        status={contact.contactUserId?.status}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block">{contact.contactName}</span>
        <span className="text-xs text-gray-400">{contact.contactPhone}</span>
      </div>
      {contact.isOnSpark && (
        <button
          onClick={() => navigate(`/chats/${contact.contactUserId?._id}`)}
          className="p-2 rounded-full hover:bg-spark-50 dark:hover:bg-spark-900 text-spark-500"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}