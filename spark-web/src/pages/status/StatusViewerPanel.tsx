import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, Trash2, Share2, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { useStatusFeed, useDeleteStatus, useViewStatus } from '@/hooks/useStatus';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function StatusViewerPanel() {
  const { statusId } = useParams<{ statusId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const { data: feeds, refetch } = useStatusFeed();
  const deleteStatus = useDeleteStatus();
  const viewStatus = useViewStatus();
  
  const [viewIndex, setViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersList, setViewersList] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldNavigate = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const feed = feeds?.find((f) => f.user._id === statusId);
  const statuses = feed?.statuses || [];
  const currentStatus = statuses[viewIndex];
  const isMyStatus = feed?.user._id === user?._id;

  // Mark as viewed when status changes
  useEffect(() => {
    if (currentStatus?._id && !isMyStatus) {
      viewStatus.mutate(currentStatus._id, {
        onSuccess: (data) => {
          if (data?.data?.viewerCount !== undefined) {
            setViewerCount(data.data.viewerCount);
          }
        }
      });
    }
  }, [currentStatus?._id, viewIndex]);

  // Fetch viewers when modal opens
  const handleShowViewers = async () => {
    if (!currentStatus?._id) return;
    try {
      const response = await fetch(`/api/v1/status/${currentStatus._id}/viewers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spark_access_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setViewersList(data.data.viewers || []);
        setViewerCount(data.data.viewerCount || data.data.viewers?.length || 0);
        setShowViewersModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch viewers:', error);
    }
  };

  // ... (rest of your existing code: handlePrev, handleNext, handleDeleteCurrentStatus, etc.)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate in useEffect, not during render
  useEffect(() => {
    if (shouldNavigate.current) {
      shouldNavigate.current = false;
      navigate('/status');
    }
  }, [navigate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Progress timer
  useEffect(() => {
    if (!currentStatus) return;
    
    const duration = currentStatus.mediaUrl ? 10000 : 5000;
    const startTime = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (viewIndex < statuses.length - 1) {
          setViewIndex((prev) => prev + 1);
          setProgress(0);
        } else {
          shouldNavigate.current = true;
          setProgress(0);
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewIndex, currentStatus, statuses.length]);

  const handlePrev = useCallback(() => {
    if (viewIndex > 0) {
      setViewIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [viewIndex]);

  const handleNext = useCallback(() => {
    if (viewIndex < statuses.length - 1) {
      setViewIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      shouldNavigate.current = true;
      setProgress(100);
    }
  }, [viewIndex, statuses.length]);

  const handleDeleteCurrentStatus = async () => {
    if (!currentStatus?._id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteStatus.mutateAsync(currentStatus._id);
      addToast({ type: 'success', message: 'Status deleted' });
      setShowDeleteConfirm(false);
      setShowMenu(false);
      
      await refetch();
      
      const updatedFeed = feeds?.find((f) => f.user._id === statusId);
      const updatedStatuses = updatedFeed?.statuses || [];
      
      if (updatedStatuses.length === 0) {
        navigate('/status');
      } else if (viewIndex >= updatedStatuses.length) {
        setViewIndex(updatedStatuses.length - 1);
      }
      setProgress(0);
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete status' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareStatus = () => {
    if (currentStatus?._id) {
      const shareUrl = `${window.location.origin}/status/${feed?.user._id}`;
      navigator.clipboard.writeText(shareUrl);
      addToast({ type: 'success', message: 'Status link copied to clipboard' });
      setShowMenu(false);
    }
  };

  if (!feed || statuses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-spark-100 dark:bg-spark-900 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-spark-500" />
          </div>
          <p className="text-gray-400 text-sm">Select a status to view</p>
        </div>
      </div>
    );
  }

  const bg = currentStatus?.mediaUrl ? '#000' : currentStatus?.backgroundColor || '#1A73E8';

  return (
    <div 
      className="flex-1 flex flex-col h-full relative"
      style={{ backgroundColor: bg }}
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-2 pt-2">
        {statuses.map((_: any, i: number) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/30">
            <div
              className="h-full bg-white/90 transition-all duration-100"
              style={{ width: i < viewIndex ? '100%' : i === viewIndex ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar src={feed.user.avatar} name={feed.user.displayName} size="sm" />
          <div>
            <span className="text-white font-medium text-sm block">{feed.user.displayName}</span>
            <span className="text-white/60 text-xs">
              {new Date(currentStatus?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 3-dots menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                <button
                  onClick={handleShareStatus}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Share2 className="w-4 h-4" />
                  Share Status
                </button>
                {isMyStatus && (
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Status
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/status')}
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Click areas for prev/next */}
      <div className="flex-1 flex relative">
        <div className="w-1/2 h-full cursor-pointer z-10" onClick={handlePrev} />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          {currentStatus?.mediaUrl ? (
            currentStatus.mediaUrl.match(/\.(mp4|mov|webm)/i) ? (
              <video 
                src={currentStatus.mediaUrl} 
                className="max-w-full max-h-full object-contain pointer-events-auto" 
                autoPlay 
                loop 
                muted 
              />
            ) : (
              <img 
                src={currentStatus.mediaUrl} 
                alt="" 
                className="max-w-full max-h-full object-contain pointer-events-auto" 
              />
            )
          ) : (
            <p className="text-white text-2xl font-medium text-center px-8 pointer-events-auto">
              {currentStatus?.content}
            </p>
          )}
        </div>
        <div className="w-1/2 h-full cursor-pointer ml-auto z-10" onClick={handleNext} />
      </div>

      {/* Caption */}
      {currentStatus?.mediaUrl && currentStatus?.caption && (
        <div className="px-4 py-2 text-center">
          <p className="text-white text-sm">{currentStatus.caption}</p>
        </div>
      )}

      {/* Footer - Clickable views */}
      <div className="flex items-center justify-between px-4 py-4">
        <button 
          onClick={handleShowViewers}
          className="flex items-center gap-2 text-white/60 text-xs hover:text-white/80 transition-colors"
        >
          <Eye className="w-4 h-4" /> 
          {viewerCount > 0 ? viewerCount : currentStatus?.viewers?.length || 0} views
        </button>
        <span className="text-white/60 text-xs">{viewIndex + 1} of {statuses.length}</span>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this status? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button 
              onClick={handleDeleteCurrentStatus} 
              variant="danger" 
              className="flex-1"
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Viewers Modal */}
      <Modal isOpen={showViewersModal} onClose={() => setShowViewersModal(false)} title="Viewers" size="sm">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {viewersList.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No one has viewed this status yet</p>
          ) : (
            viewersList.map((viewer: any) => (
              <div key={viewer._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar src={viewer.avatar} name={viewer.displayName} size="sm" />
                <div>
                  <p className="text-sm font-medium">{viewer.displayName}</p>
                  <p className="text-xs text-gray-400">{viewer.phone}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}