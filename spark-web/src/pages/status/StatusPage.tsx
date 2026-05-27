import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Image, Video, X, Crop, Scissors, Loader2, CheckCircle, AlertCircle, 
  MoreVertical, Share2, Trash2, Globe, Users, Lock, Eye, Search, Check
} from 'lucide-react';
import { useStatusFeed, useCreateStatus, useDeleteStatus } from '@/hooks/useStatus';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { useContacts } from '@/hooks/useContacts';
import { api } from '@/services/api';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Video trimmer component
const VideoTrimmer = ({ videoUrl, onTrim }: { videoUrl: string; onTrim: (trimmedBlob: Blob) => void }) => {
  const [endTime, setEndTime] = useState(30);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const dur = videoRef.current?.duration || 0;
        setDuration(dur);
        setEndTime(Math.min(30, dur));
      };
    }
  }, [videoUrl]);

  const handleTrim = () => {
    fetch(videoUrl)
      .then(res => res.blob())
      .then(blob => onTrim(blob));
  };

  return (
    <div className="space-y-3">
      <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg max-h-48" />
      {duration > 30 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Trim video (max 30 seconds)</span>
            <span>Duration: {Math.round(duration)}s → {Math.min(30, Math.round(endTime))}s</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.min(60, duration)}
            step={0.5}
            value={endTime}
            onChange={(e) => setEndTime(parseFloat(e.target.value))}
            className="w-full"
          />
          <Button size="sm" onClick={handleTrim} variant="secondary" className="w-full">Apply Trim</Button>
        </div>
      )}
    </div>
  );
};

// Image cropper component
const ImageCropper = ({ imageUrl, onCrop }: { imageUrl: string; onCrop: (croppedBlob: Blob) => void }) => {
  const [cropRatio, setCropRatio] = useState<'1:1' | '16:9' | '4:3' | 'free'>('1:1');

  const handleCrop = () => {
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => onCrop(blob));
  };

  return (
    <div className="space-y-3">
      <img src={imageUrl} alt="Preview" className="w-full rounded-lg max-h-64 object-contain bg-black" />
      <div className="flex gap-2 flex-wrap">
        {(['1:1', '16:9', '4:3', 'free'] as const).map((ratio) => (
          <button
            key={ratio}
            onClick={() => setCropRatio(ratio)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              cropRatio === ratio
                ? 'bg-spark-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>
      <Button size="sm" onClick={handleCrop} variant="secondary" className="w-full">Apply Crop</Button>
    </div>
  );
};

// Status Card with 3-dots menu
const StatusCardWithMenu = ({ feed, onClick, onDelete, onShare }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusId = feed.statuses?.[0]?._id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (statusId) {
      await onDelete(statusId);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  const handleShare = () => {
    onShare(feed);
    setShowMenu(false);
  };

  const latestStatus = feed.statuses?.[0];
  const statusCount = feed.statuses?.length || 0;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
      >
        <div className="relative">
          <Avatar src={feed.user.avatar} name={feed.user.displayName} size="md" status={feed.user.status} />
          <div className="absolute inset-0 rounded-full border-2 border-spark-500 scale-[1.15]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{feed.user.displayName}</span>
            {latestStatus && (
              <span className="text-xs text-gray-400 shrink-0 ml-2">
                {new Date(latestStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{feed.user.displayName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{statusCount} update{statusCount !== 1 ? 's' : ''}</p>
        </div>
      </button>

      <div ref={menuRef} className="absolute right-3 top-1/2 -translate-y-1/2">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Share2 className="w-4 h-4" />
              Share Status
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Delete Status
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this status? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={handleDelete} variant="danger" className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Contact selection component for privacy
const ContactSelectionModal = ({ 
  isOpen, 
  onClose, 
  contacts, 
  selectedContacts, 
  onToggleContact,
  onConfirm 
}: any) => {
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((contact: any) =>
    contact.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Contacts to Hide From" size="lg">
      <div className="space-y-4">
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        
        <div className="max-h-96 overflow-y-auto space-y-1">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No contacts found</p>
          ) : (
            filteredContacts.map((contact: any) => (
              <button
                key={contact._id}
                onClick={() => onToggleContact(contact.contactUserId?._id || contact._id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar 
                  src={contact.contactUserId?.avatar} 
                  name={contact.contactName} 
                  size="sm" 
                />
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium">{contact.contactName}</span>
                  <p className="text-xs text-gray-400">{contact.contactPhone}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedContacts.includes(contact.contactUserId?._id || contact._id)
                    ? 'bg-spark-500 border-spark-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedContacts.includes(contact.contactUserId?._id || contact._id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary" className="flex-1">Cancel</Button>
          <Button onClick={onConfirm} className="flex-1">Apply</Button>
        </div>
      </div>
    </Modal>
  );
};

export default function StatusPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const { data: feeds, isLoading, refetch } = useStatusFeed();
  const { data: contactsData } = useContacts();
  const createStatus = useCreateStatus();
  const deleteStatus = useDeleteStatus();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusBg, setStatusBg] = useState('#1A73E8');
  const [statusPrivacy, setStatusPrivacy] = useState<'all' | 'selected' | 'except'>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [exceptContacts, setExceptContacts] = useState<string[]>([]);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const colors = ['#1A73E8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const contacts = contactsData?.contacts || [];

  const privacyOptions = [
    { value: 'all', label: 'Everyone', icon: Globe, description: 'All Spark users can view' },
    { value: 'selected', label: 'Selected Contacts', icon: Users, description: 'Only specific contacts can view' },
    { value: 'except', label: 'Hide From', icon: Lock, description: 'Hide from specific contacts' },
  ];

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxSize = 1080;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const validateAndSetFile = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      addToast({ type: 'error', message: 'Only images and videos allowed' });
      return false;
    }
    
    if (isVideo && file.size > 60 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Video must be under 60MB' });
      return false;
    }
    
    if (isImage && file.size > 10 * 1024 * 1024) {
      addToast({ type: 'warning', message: 'Image is large, compressing...' });
      const compressed = await compressImage(file);
      setMediaFile(compressed);
      setMediaPreview(URL.createObjectURL(compressed));
      setMediaType('image');
      setShowCropper(true);
      return true;
    }
    
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(isImage ? 'image' : 'video');
    
    if (isVideo) {
      setShowTrimmer(true);
    } else if (isImage) {
      setShowCropper(true);
    }
    
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'cropped_image.jpg', { type: 'image/jpeg' });
    setMediaFile(croppedFile);
    setMediaPreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    addToast({ type: 'success', message: 'Image cropped successfully' });
  };

  const handleTrimComplete = (trimmedBlob: Blob) => {
    const trimmedFile = new File([trimmedBlob], 'trimmed_video.mp4', { type: 'video/mp4' });
    setMediaFile(trimmedFile);
    setMediaPreview(URL.createObjectURL(trimmedBlob));
    setShowTrimmer(false);
    addToast({ type: 'success', message: 'Video trimmed successfully' });
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setShowTrimmer(false);
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      await deleteStatus.mutateAsync(statusId);
      addToast({ type: 'success', message: 'Status deleted' });
      refetch();
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete status' });
    }
  };

  const handleShareStatus = (feed: any) => {
    const shareUrl = `${window.location.origin}/status/${feed.user._id}`;
    navigator.clipboard.writeText(shareUrl);
    addToast({ type: 'success', message: 'Status link copied to clipboard' });
  };

  const handleToggleContact = (contactId: string) => {
    if (statusPrivacy === 'selected') {
      setSelectedContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    } else if (statusPrivacy === 'except') {
      setExceptContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    }
  };

  const handleOpenContactSelector = () => {
    setShowContactSelector(true);
  };

  const handleConfirmContacts = () => {
    setShowContactSelector(false);
  };

  const handleCreateStatus = async () => {
    if (!statusText.trim() && !mediaFile) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      let mediaUrl = '';
      let mediaName = '';
      
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        });
        
        setUploadProgress(100);
        setUploadStatus('processing');
        
        if (response.data.success) {
          mediaUrl = response.data.data.url;
          mediaName = mediaFile.name;
        }
      }
      
      setUploadStatus('processing');
      
      await createStatus.mutateAsync({
        content: statusText,
        media: mediaName,
        mediaUrl,
        caption: statusText,
        backgroundColor: statusBg,
        privacy: statusPrivacy,
        selectedContacts: statusPrivacy === 'selected' ? selectedContacts : undefined,
        exceptContacts: statusPrivacy === 'except' ? exceptContacts : undefined,
      });
      
      setUploadStatus('complete');
      addToast({ type: 'success', message: 'Status posted!' });
      setShowCreateModal(false);
      setStatusText('');
      setStatusBg('#1A73E8');
      setStatusPrivacy('all');
      setSelectedContacts([]);
      setExceptContacts([]);
      clearMedia();
      refetch();
    } catch (error: any) {
      setUploadStatus('error');
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to post status' });
    }
  };

  const renderUploadProgress = () => {
    if (uploadStatus === 'uploading') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uploading media...</span>
            <span className="text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-spark-500 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      );
    }
    
    if (uploadStatus === 'processing') {
      return (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 className="w-4 h-4 text-spark-500 animate-spin" />
          <span className="text-sm text-gray-500">Processing...</span>
        </div>
      );
    }
    
    if (uploadStatus === 'complete') {
      return (
        <div className="flex items-center justify-center gap-2 py-2 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Ready!</span>
        </div>
      );
    }
    
    if (uploadStatus === 'error') {
      return (
        <div className="flex items-center justify-center gap-2 py-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Upload failed. Please try again.</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Header - Fixed */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h2 className="text-lg font-semibold">Status</h2>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* My Status Button */}
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors"
        >
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.displayName || 'Me'} size="md" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-spark-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-950">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-medium text-sm block">My Status</span>
            <span className="text-xs text-gray-400">Tap to add status update</span>
          </div>
        </button>

        {/* Recent Updates Section */}
        <div className="py-1 pb-20">
          <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-gray-950 z-10">
            Recent Updates
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : feeds && feeds.length > 0 ? (
            feeds.map((feed) => (
              <StatusCardWithMenu 
                key={feed.user._id} 
                feed={feed} 
                onClick={() => navigate(`/status/${feed.user._id}`)}
                onDelete={handleDeleteStatus}
                onShare={handleShareStatus}
              />
            ))
          ) : (
            <div className="py-12">
              <EmptyState 
                title="No status updates" 
                description="Statuses from your contacts will appear here" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Status Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); clearMedia(); }} title="Create Status" size="lg">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Media Preview with Crop/Trim options */}
          {mediaPreview && showCropper && !showTrimmer && (
            <ImageCropper imageUrl={mediaPreview} onCrop={handleCropComplete} />
          )}
          
          {mediaPreview && showTrimmer && !showCropper && (
            <VideoTrimmer videoUrl={mediaPreview} onTrim={handleTrimComplete} />
          )}
          
          {mediaPreview && !showCropper && !showTrimmer && (
            <div className="relative rounded-xl overflow-hidden bg-black">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-64" />
              )}
              <button 
                onClick={clearMedia} 
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {mediaType === 'image' && (
                <button 
                  onClick={() => setShowCropper(true)} 
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  title="Crop image"
                >
                  <Crop className="w-4 h-4" />
                </button>
              )}
              {mediaType === 'video' && (
                <button 
                  onClick={() => setShowTrimmer(true)} 
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  title="Trim video"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* File selection buttons */}
          {!mediaPreview && (
            <div className="flex gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-spark-500 transition-colors"
              >
                <Image className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Add Image</span>
                <span className="text-xs text-gray-400">Max 10MB</span>
              </button>
              <button 
                onClick={() => videoInputRef.current?.click()} 
                className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-spark-500 transition-colors"
              >
                <Video className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Add Video</span>
                <span className="text-xs text-gray-400">Max 60MB, 30s</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            </div>
          )}

          {/* Caption input */}
          <Input 
            value={statusText} 
            onChange={(e) => setStatusText(e.target.value)} 
            placeholder={mediaPreview ? "Add a caption..." : "What's on your mind?"} 
          />

          {/* Privacy Selector */}
          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Who can see this status?
            </p>
            <div className="space-y-2">
              {privacyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusPrivacy(option.value as any);
                      if (option.value === 'selected' || option.value === 'except') {
                        handleOpenContactSelector();
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      statusPrivacy === option.value
                        ? 'border-spark-500 bg-spark-50 dark:bg-spark-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${statusPrivacy === option.value ? 'text-spark-500' : 'text-gray-400'}`} />
                    <div className="flex-1 text-left">
                      <span className={`text-sm font-medium ${statusPrivacy === option.value ? 'text-spark-600 dark:text-spark-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {option.label}
                      </span>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                    {statusPrivacy === option.value && (
                      <div className="w-2 h-2 rounded-full bg-spark-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show selected contacts summary */}
          {(statusPrivacy === 'selected' && selectedContacts.length > 0) && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Selected Contacts ({selectedContacts.length})</p>
              <div className="flex flex-wrap gap-1">
                {selectedContacts.slice(0, 5).map((id) => {
                  const contact = contacts.find(c => (c.contactUserId?._id || c._id) === id);
                  return (
                    <span key={id} className="px-2 py-1 bg-spark-100 dark:bg-spark-900/50 text-spark-600 text-xs rounded-full">
                      {contact?.contactName || 'Contact'}
                    </span>
                  );
                })}
                {selectedContacts.length > 5 && (
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
                    +{selectedContacts.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {(statusPrivacy === 'except' && exceptContacts.length > 0) && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Hidden From ({exceptContacts.length})</p>
              <div className="flex flex-wrap gap-1">
                {exceptContacts.slice(0, 5).map((id) => {
                  const contact = contacts.find(c => (c.contactUserId?._id || c._id) === id);
                  return (
                    <span key={id} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs rounded-full">
                      {contact?.contactName || 'Contact'}
                    </span>
                  );
                })}
                {exceptContacts.length > 5 && (
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
                    +{exceptContacts.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Background color picker (only for text-only status) */}
          {!mediaPreview && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Background Color</p>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStatusBg(color)}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{ 
                      backgroundColor: color, 
                      borderColor: statusBg === color ? '#fff' : color, 
                      boxShadow: statusBg === color ? `0 0 0 2px ${color}` : 'none' 
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {renderUploadProgress()}

          {/* Submit button */}
          <Button 
            onClick={handleCreateStatus} 
            loading={createStatus.isPending || uploadStatus === 'uploading' || uploadStatus === 'processing'} 
            disabled={(!statusText.trim() && !mediaFile) || uploadStatus === 'uploading'}
            size="lg" 
            className="w-full"
          >
            {uploadStatus === 'complete' ? 'Posted!' : 'Post Status'}
          </Button>
        </div>
      </Modal>

      {/* Contact Selection Modal */}
      <ContactSelectionModal
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        contacts={contacts}
        selectedContacts={statusPrivacy === 'selected' ? selectedContacts : exceptContacts}
        onToggleContact={handleToggleContact}
        onConfirm={handleConfirmContacts}
      />
    </div>
  );
}