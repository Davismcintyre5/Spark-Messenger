import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, X, ChevronRight } from 'lucide-react';
import Picker from 'emoji-picker-react';
import { MessageType } from '@/types/models';

interface MessageInputProps {
  onSend: (content: string, type?: MessageType, mediaUrl?: string, fileName?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onAttach?: () => void;
  onVoice?: () => void;
  isRecording?: boolean;
  isBlocked?: boolean;
}

const QUICK_EMOJIS = ['😂', '❤️', '👍', '🔥', '😍', '🙏', '💯', '🎉', '😢', '😡', '✨', '🥺', '😎', '🤣', '😭'];

export default function MessageInput({
  onSend, onTyping, onAttach, onVoice, isRecording, isBlocked = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!message.trim() || isBlocked) return;
    onSend(message.trim(), 'text');
    setMessage('');
    if (onTyping) onTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleQuickEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  if (isBlocked) {
    return (
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You cannot send messages to this user.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Full Emoji Picker */}
      {showEmojiPicker && (
        <div 
          ref={pickerRef}
          className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden"
        >
          <Picker 
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            previewConfig={{ showPreview: false }}
            searchPlaceholder="Search emojis..."
          />
        </div>
      )}

      {/* Quick emoji bar */}
      <div className="px-4 pt-2 pb-1 overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="w-8 h-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors shrink-0"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-8 h-8 text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            showEmojiPicker ? 'text-spark-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-400'
          }`}
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          onClick={onAttach}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 transition-all focus-within:ring-2 focus-within:ring-spark-500">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 py-2.5 bg-transparent text-sm outline-none placeholder-gray-400"
          />
          {message && (
            <button
              onClick={() => setMessage('')}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {message.trim() ? (
          <button 
            onClick={handleSend} 
            className="p-2 rounded-full bg-spark-500 text-white hover:bg-spark-600 transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onVoice}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}