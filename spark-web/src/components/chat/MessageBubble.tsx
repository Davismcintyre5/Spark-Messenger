import React, { useState } from 'react';
import { Message } from '@/types/models';
import { Check, CheckCheck, Clock, FileText, Download } from 'lucide-react';
import { formatFileSize } from '@/utils/format';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
  senderName?: string;
  isGroup?: boolean;
}

export default function MessageBubble({ message, isOwn, showSenderName = false, senderName, isGroup = false }: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const StatusIcon = () => {
    if (message.status === 'failed') return <Clock className="w-3 h-3 text-red-500" />;
    if (message.status === 'sent') return <Check className="w-3 h-3 text-gray-400" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />;
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-spark-400" />;
    return null;
  };

  // Text message
  if (message.messageType === 'text') {
    return (
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
        onClick={() => setShowTime(!showTime)}
      >
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className={`message-bubble-${isOwn ? 'sent' : 'received'} relative group`}>
            {message.replyTo && (
              <div className="text-xs opacity-70 border-l-2 border-current pl-2 mb-1 truncate">
                {(message.replyTo as any)?.content || 'Message'}
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {showTime && <span className="text-[10px] opacity-70">{time}</span>}
              {isOwn && <StatusIcon />}
              {message.isEdited && <span className="text-[10px] opacity-50">edited</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Image message
  if (message.messageType === 'image' && message.mediaUrl) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={message.mediaUrl}
              alt={message.fileName || 'Image'}
              className="w-full object-cover max-h-80 cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
              onClick={() => setIsImageModalOpen(true)}
            />
            {message.content && (
              <div className={`px-3 py-1.5 ${isOwn ? 'bg-spark-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
            )}
            <div className={`px-3 py-1 ${isOwn ? 'bg-spark-500/80' : 'bg-gray-100 dark:bg-gray-800'} text-right`}>
              <span className="text-[10px] opacity-70">{time}</span>
              {isOwn && <StatusIcon />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Video message
  if (message.messageType === 'video' && message.mediaUrl) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <video
              src={message.mediaUrl}
              controls
              className="w-full max-h-80"
              poster={message.thumbnailUrl}
            />
            {message.content && (
              <div className={`px-3 py-1.5 ${isOwn ? 'bg-spark-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
            )}
            <div className={`px-3 py-1 ${isOwn ? 'bg-spark-500/80' : 'bg-gray-100 dark:bg-gray-800'} text-right`}>
              <span className="text-[10px] opacity-70">{time}</span>
              {isOwn && <StatusIcon />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Document message
  if (message.messageType === 'document') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className={`message-bubble-${isOwn ? 'sent' : 'received'} flex items-center gap-3`}>
            <FileText className="w-8 h-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{message.fileName || 'Document'}</p>
              <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
            </div>
            <a href={message.mediaUrl} download className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] opacity-70">{time}</span>
            {isOwn && <StatusIcon />}
          </div>
        </div>
      </div>
    );
  }

  // Audio message
  if (message.messageType === 'audio' && message.mediaUrl) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className={`message-bubble-${isOwn ? 'sent' : 'received'} p-2`}>
            <audio src={message.mediaUrl} controls className="w-48" />
            <div className="flex items-center gap-1 mt-1 justify-end">
              <span className="text-[10px] opacity-70">{time}</span>
              {isOwn && <StatusIcon />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Location message
  if (message.messageType === 'location' && message.location) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className={`message-bubble-${isOwn ? 'sent' : 'received'} p-2`}>
            <div className="w-48 h-32 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xs">📍 Location</span>
            </div>
            <p className="text-xs mt-1">{message.location.address || `${message.location.latitude}, ${message.location.longitude}`}</p>
            <div className="flex items-center gap-1 mt-1 justify-end">
              <span className="text-[10px] opacity-70">{time}</span>
              {isOwn && <StatusIcon />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contact message
  if (message.messageType === 'contact' && message.contact) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {/* Sender name for group chats */}
          {isGroup && !isOwn && showSenderName && senderName && (
            <span className="text-xs font-medium text-spark-500 mb-0.5 ml-1">
              {senderName}
            </span>
          )}
          
          <div className={`message-bubble-${isOwn ? 'sent' : 'received'} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-spark-100 dark:bg-spark-900 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{message.contact.name}</p>
              <p className="text-xs opacity-70">{message.contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] opacity-70">{time}</span>
            {isOwn && <StatusIcon />}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`message-bubble-${isOwn ? 'sent' : 'received'}`}>
        <p className="text-sm">{message.content || message.messageType}</p>
        <div className="flex items-center gap-1 mt-0.5 justify-end">
          <span className="text-[10px] opacity-70">{time}</span>
          {isOwn && <StatusIcon />}
        </div>
      </div>
    </div>
  );
}