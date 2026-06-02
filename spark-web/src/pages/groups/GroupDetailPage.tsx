import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, MoreVertical, Search, Bell, BellOff,
  Share2, LogOut, MessageCircle, Settings, Shield, 
  Camera, Image, Video, FileText, Pin, Star, 
  Clock, Lock, Globe, Link, QrCode, Trash2, Edit3,
  CheckCircle, AlertCircle, Download, Upload, Filter, Copy
} from 'lucide-react';
import { useGroup } from '@/hooks/useGroups';
import { chatService } from '@/services/chatService';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/services/api';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import GroupSettingsModal from '@/components/group/GroupSettingsModal';
import QRCode from 'qrcode.react';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const { data: group, isLoading, refetch } = useGroup(groupId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [mediaTab, setMediaTab] = useState<'images' | 'videos' | 'docs'>('images');

  useEffect(() => {
    if (showInviteModal) {
      generateInviteLink();
    }
  }, [showInviteModal]);

  const generateInviteLink = async () => {
    try {
      const response = await api.post(`/groups/${groupId}/invite-link`);
      setInviteLink(response.data.data.inviteLink);
    } catch {
      setInviteLink(`${window.location.origin}/groups/join/${groupId}`);
    }
  };

  const handleMute = async () => {
    try {
      await api.patch(`/groups/${groupId}/mute`, { mute: !isMuted });
      setIsMuted(!isMuted);
      addToast({ type: 'success', message: isMuted ? 'Unmuted' : 'Muted' });
    } catch { addToast({ type: 'error', message: 'Action failed' }); }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) await generateInviteLink();
    navigator.clipboard.writeText(inviteLink || `${window.location.origin}/groups/join/${groupId}`);
    setInviteCopied(true);
    addToast({ type: 'success', message: 'Invite link copied!' });
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleLeaveGroup = async () => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      addToast({ type: 'success', message: 'Left group' });
      navigate('/groups');
    } catch { addToast({ type: 'error', message: 'Failed to leave' }); }
  };

  const handleMessageMember = async (member: any) => {
    const memberId = typeof member === 'string' ? member : member._id;
    try {
      const chat = await chatService.createDirectChat(memberId);
      navigate(`/chats/${chat._id}`);
    } catch {
      addToast({ type: 'error', message: 'Cannot start chat' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }

  if (!group) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-lg">Group</h1>
        </header>
        <EmptyState title="Group not found" />
      </div>
    );
  }

  const members = group.members || [];
  const admins = (group.admins || []).map((a: any) => typeof a === 'string' ? a : a._id);
  const ownerId = typeof group.ownerId === 'string' ? group.ownerId : (group.ownerId as any)?._id;
  // FIXED: Add type assertion for currentUserRole
  const isAdmin = admins.includes((group as any).currentUserRole === 'owner' || (group as any).currentUserRole === 'admin');

  const filteredMembers = searchMembers
    ? members.filter((m: any) => m.displayName?.toLowerCase().includes(searchMembers.toLowerCase()))
    : members;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-lg">Group Info</h1>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
              <button
                onClick={() => { setShowSettingsModal(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" /> Group Settings
              </button>
              <button
                onClick={() => { setShowMediaModal(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Image className="w-4 h-4" /> Media & Files
              </button>
              <button
                onClick={() => { setShowMembersModal(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Users className="w-4 h-4" /> All Members
              </button>
              <button
                onClick={() => { handleMute(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Mute'} Notifications
              </button>
              <button
                onClick={() => { setShowInviteModal(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4" /> Invite via Link
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={() => { setShowLeaveModal(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" /> Leave Group
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Group Info Card */}
        <div className="flex flex-col items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="relative">
            <Avatar src={group.icon} name={group.name} size="xl" className="w-24 h-24 text-3xl shadow-xl" />
            {isAdmin && (
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-spark-500 text-white flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-3">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-gray-500 mt-1 text-center max-w-md">{group.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
              <Users className="w-3 h-3" /> {group.memberCount} members
            </span>
            {/* FIXED: privacy comparison - changed to 'closed' */}
            {group.privacy === 'closed' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                <Lock className="w-3 h-3" /> Closed
              </span>
            )}
            {/* FIXED: privacy comparison - changed to 'open' */}
            {group.privacy === 'open' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                <Globe className="w-3 h-3" /> Open
              </span>
            )}
            {group.createdAt && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                <Clock className="w-3 h-3" /> Created {new Date(group.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {/* FIXED: inGroup with type assertion */}
          {!(group as any).inGroup && (
            <button className="mt-4 px-6 py-2 bg-spark-500 text-white rounded-full text-sm font-medium">
              Join Group
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => navigate(`/chats/${(group.chatId as any)?._id || group.chatId}`)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-spark-100 dark:bg-spark-900/30 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-spark-500" />
            </div>
            <span className="text-xs text-gray-500">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500">Members</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500">Media</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Pin className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500">Pinned</span>
          </button>
        </div>

        {/* Members Preview */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Members</h3>
            <button 
              onClick={() => setShowMembersModal(true)}
              className="text-xs text-spark-500"
            >
              See All ({members.length})
            </button>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member: any) => (
              <Avatar 
                key={member._id} 
                src={member.avatar} 
                name={member.displayName} 
                size="sm" 
                className="border-2 border-white dark:border-gray-900"
              />
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-900">
                +{members.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Admins Section */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4 text-spark-500" />
            Administrators
          </h3>
          <div className="space-y-2">
            {members.filter((m: any) => admins.includes(m._id)).slice(0, 3).map((admin: any) => (
              <div key={admin._id} className="flex items-center gap-3">
                <Avatar src={admin.avatar} name={admin.displayName} size="sm" />
                <div>
                  <p className="text-sm font-medium">{admin.displayName}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </div>
            ))}
            {admins.length > 3 && (
              <button className="text-xs text-spark-500 mt-1">+{admins.length - 3} more admins</button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* FIXED: Changed name to groupName */}
      <GroupSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        groupId={groupId!}
        groupName={group.name}
        description={group.description || ''}
        icon={group.icon}
        members={members}
        admins={admins}
        ownerId={ownerId}
        onSaved={() => refetch()}
      />

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite to Group" size="md">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <QRCode value={inviteLink || `${window.location.origin}/groups/join/${groupId}`} size={160} />
          </div>
          <p className="text-sm text-gray-500">Scan QR code or share link below</p>
          <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <code className="flex-1 text-xs break-all">
              {inviteLink || `${window.location.origin}/groups/join/${groupId}`}
            </code>
            <button onClick={handleCopyInvite} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0">
              {inviteCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Leave Group" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Are you sure?</span>
          </div>
          <p className="text-sm text-gray-500">
            You will lose access to all group messages and content.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowLeaveModal(false)} className="flex-1 px-4 py-2 text-sm text-gray-500 rounded-lg border border-gray-200">Cancel</button>
            <button onClick={handleLeaveGroup} className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg">Leave Group</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMembersModal} onClose={() => setShowMembersModal(false)} title={`Members (${members.length})`} size="lg">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <Input placeholder="Search members..." value={searchMembers} onChange={(e) => setSearchMembers(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
          <div className="space-y-2">
            {filteredMembers.map((member: any) => {
              const isAdmin = admins.includes(member._id);
              const isOwner = member._id === ownerId;
              return (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Avatar src={member.avatar} name={member.displayName} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.displayName}</p>
                    <p className="text-xs text-gray-400">{member.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && <span className="text-xs text-spark-500 font-medium">Owner</span>}
                    {isAdmin && !isOwner && <span className="text-xs text-gray-400">Admin</span>}
                    <button onClick={() => handleMessageMember(member)} className="p-2 rounded-lg text-gray-400 hover:text-spark-500">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} title="Media & Files" size="lg">
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
            {(['images', 'videos', 'docs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMediaTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mediaTab === tab
                    ? 'text-spark-500 border-b-2 border-spark-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'images' && <Image className="w-4 h-4 inline mr-1" />}
                {tab === 'videos' && <Video className="w-4 h-4 inline mr-1" />}
                {tab === 'docs' && <FileText className="w-4 h-4 inline mr-1" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="min-h-[300px] flex items-center justify-center text-gray-400">
            <p className="text-sm">No media yet</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}