import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Trash2, UserX, Shield, Users, Lock, Globe, 
  AlertTriangle, Image, Video, FileText, Mic, Link, 
  QrCode, Clock, Ban, CheckCircle, Plus, X, Settings,
  Bell, BellOff, Eye, EyeOff, Download, Upload, ChevronLeft,
  MessageCircle, Pin, Copy, Check, RefreshCw
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useGroup, useGroupSettings, useUpdateGroup, useUpdateGroupPrivacy, useUpdateGroupPermissions, useUpdateGroupSecurity, useToggleGroupMute, useGenerateInviteLink, useUploadGroupIcon, useAddGroupMembers, useRemoveGroupMember, useToggleAdmin } from '@/hooks/useGroups';
import { useAuth } from '@/providers/AuthProvider';
import QRCode from 'qrcode.react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSaved: () => void;
}

type SettingsTab = 'general' | 'privacy' | 'permissions' | 'members' | 'admins' | 'media' | 'security';

export default function GroupSettingsModal({ isOpen, onClose, groupId, onSaved }: GroupSettingsModalProps) {
  const { user } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const { data: group, refetch: refetchGroup } = useGroup(groupId);
  const { data: settings, refetch: refetchSettings } = useGroupSettings(groupId);
  const updateGroup = useUpdateGroup();
  const updatePrivacy = useUpdateGroupPrivacy();
  const updatePermissions = useUpdateGroupPermissions();
  const updateSecurity = useUpdateGroupSecurity();
  const generateInviteLink = useGenerateInviteLink();
  const uploadIcon = useUploadGroupIcon();
  const removeMember = useRemoveGroupMember();
  const toggleAdmin = useToggleAdmin();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchMembers, setSearchMembers] = useState('');
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [inviteGenerated, setInviteGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Privacy settings
  const [groupPrivacy, setGroupPrivacy] = useState<'public' | 'private' | 'invite-only' | 'closed'>('private');
  const [joinApproval, setJoinApproval] = useState<'auto' | 'admin'>('admin');
  const [memberVisibility, setMemberVisibility] = useState<'all' | 'admins-only' | 'members-only'>('all');

  // Permission settings
  const [permissions, setPermissions] = useState({
    sendMessages: true,
    sendMedia: true,
    sendLinks: true,
    addMembers: true,
    changeGroupInfo: false,
    pinMessages: false,
    deleteMessages: false,
  });

  // Media settings
  const [mediaSettings, setMediaSettings] = useState({
    allowImages: true,
    allowVideos: true,
    allowDocuments: true,
    allowVoice: true,
    maxImageSize: 10,
    maxVideoSize: 100,
  });

  // Security settings
  const [security, setSecurity] = useState({
    disappearingMessages: false,
    disappearAfter: 86400,
    chatHistory: true,
    restrictForwarding: false,
    encryptMessages: true,
  });

  // Load group data when modal opens (NO auto-generate invite)
  useEffect(() => {
    if (isOpen && group) {
      setName(group.name);
      setDescription(group.description || '');
      setGroupPrivacy(group.privacy || 'private');
      setMemberVisibility(group.memberVisibility || 'all');
      setJoinApproval(group.joinApproval || 'admin');
    }
    if (isOpen && settings) {
      setPermissions(settings.restrictions || permissions);
      setSecurity(settings.security || security);
      setMediaSettings(settings.permissions || mediaSettings);
      if (settings.inviteLink) {
        setInviteLink(settings.inviteLink);
        setInviteGenerated(true);
      }
    }
  }, [isOpen, group, settings]);

  // Reset flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInviteGenerated(false);
      setInviteLink('');
      setShowQR(false);
    }
  }, [isOpen]);

  const handleGenerateInviteLink = async () => {
    try {
      const result = await generateInviteLink.mutateAsync(groupId);
      setInviteLink(result.inviteLink);
      setInviteGenerated(true);
      addToast({ type: 'success', message: 'Invite link generated!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to generate invite link' });
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    addToast({ type: 'success', message: 'Invite link copied!' });
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleSaveGeneral = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateGroup.mutateAsync({ groupId, updates: { name, description } });
      addToast({ type: 'success', message: 'Group settings saved' });
      onSaved();
      refetchGroup();
    } catch {
      addToast({ type: 'error', message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await updatePrivacy.mutateAsync({ groupId, data: { privacy: groupPrivacy, joinApproval, memberVisibility } });
      onSaved();
    } catch {
      addToast({ type: 'error', message: 'Failed to save privacy settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await updatePermissions.mutateAsync({ groupId, permissions });
      onSaved();
    } catch {
      addToast({ type: 'error', message: 'Failed to save permissions' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      await updateSecurity.mutateAsync({ groupId, security });
      onSaved();
    } catch {
      addToast({ type: 'error', message: 'Failed to save security settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadIcon.mutateAsync({ groupId, file });
      refetchGroup();
      addToast({ type: 'success', message: 'Group icon updated!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to upload icon' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeMember.mutateAsync({ groupId, memberId });
      refetchGroup();
    } catch {
      addToast({ type: 'error', message: 'Failed to remove member' });
    }
  };

  const handleToggleAdmin = async (memberId: string) => {
    try {
      await toggleAdmin.mutateAsync({ groupId, memberId });
      refetchGroup();
    } catch {
      addToast({ type: 'error', message: 'Failed to change admin status' });
    }
  };

  const members = group?.members || [];
  const admins = group?.admins?.map((a: any) => typeof a === 'string' ? a : a._id) || [];
  const ownerId = typeof group?.ownerId === 'string' ? group.ownerId : group?.ownerId?._id;
  const isOwner = ownerId === user?._id;

  const filteredMembers = searchMembers
    ? members.filter((m: any) => m.displayName?.toLowerCase().includes(searchMembers.toLowerCase()))
    : members;

  const tabs: Array<{ key: SettingsTab; label: string; icon: React.ReactNode }> = [
    { key: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { key: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> },
    { key: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
    { key: 'members', label: `Members (${members.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'admins', label: 'Admins', icon: <Shield className="w-4 h-4" /> },
    { key: 'media', label: 'Media', icon: <Image className="w-4 h-4" /> },
    { key: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Settings" size="lg">
      <div className="flex flex-col" style={{ height: '550px', maxHeight: '80vh' }}>
        {/* Tabs - Sticky */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto sticky top-0 bg-white dark:bg-gray-900 z-10 shrink-0">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-spark-100 dark:bg-spark-900 text-spark-600 dark:text-spark-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable Content - Always visible scrollbar */}
        <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar src={group?.icon} name={name} size="xl" className="w-24 h-24" />
                  {isOwner && (
                    <>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-spark-500 text-white flex items-center justify-center shadow-lg hover:bg-spark-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadIcon} className="hidden" />
                    </>
                  )}
                </div>
              </div>
              <Input label="Group Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter group name" />
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" />
              
              {/* Invite Link Section - Manual generation only */}
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">Invite Link</p>
                {!inviteLink ? (
                  <button 
                    onClick={handleGenerateInviteLink}
                    className="w-full py-2 bg-spark-500 text-white rounded-lg text-sm hover:bg-spark-600 transition-colors"
                  >
                    Generate Invite Link
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <code className="flex-1 text-xs truncate">{inviteLink}</code>
                        <button onClick={handleCopyInvite} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                          {inviteCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowQR(!showQR)}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleGenerateInviteLink}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    {showQR && inviteLink && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg flex justify-center">
                        <QRCode value={inviteLink} size={120} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button onClick={handleSaveGeneral} loading={saving} className="w-full">
                Save Changes
              </Button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Group Privacy</p>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can find and join' },
                    { value: 'private', label: 'Private', icon: Lock, desc: 'Only invited members can join' },
                    { value: 'invite-only', label: 'Invite Only', icon: Link, desc: 'Only via invite link' },
                    { value: 'closed', label: 'Closed', icon: Ban, desc: 'No new members can join' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGroupPrivacy(option.value as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        groupPrivacy === option.value
                          ? 'border-spark-500 bg-spark-50 dark:bg-spark-950/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 ${groupPrivacy === option.value ? 'text-spark-500' : 'text-gray-400'}`} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${groupPrivacy === option.value ? 'text-spark-600' : 'text-gray-700'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-400">{option.desc}</p>
                      </div>
                      {groupPrivacy === option.value && <CheckCircle className="w-5 h-5 text-spark-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Join Approval</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setJoinApproval('auto')}
                    className={`flex-1 p-3 rounded-xl border transition-all ${
                      joinApproval === 'auto'
                        ? 'border-spark-500 bg-spark-50 dark:bg-spark-950/30 text-spark-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600'
                    }`}
                  >
                    Auto Approval
                  </button>
                  <button
                    onClick={() => setJoinApproval('admin')}
                    className={`flex-1 p-3 rounded-xl border transition-all ${
                      joinApproval === 'admin'
                        ? 'border-spark-500 bg-spark-50 dark:bg-spark-950/30 text-spark-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600'
                    }`}
                  >
                    Admin Approval
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Member Visibility</p>
                <select
                  value={memberVisibility}
                  onChange={(e) => setMemberVisibility(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="all">All members visible</option>
                  <option value="admins-only">Only admins visible</option>
                  <option value="members-only">Only members can see each other</option>
                </select>
              </div>

              <Button onClick={handleSavePrivacy} loading={saving} className="w-full">
                Save Privacy Settings
              </Button>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-2">What members can do</p>
              {[
                { key: 'sendMessages', label: 'Send Messages', icon: MessageCircle },
                { key: 'sendMedia', label: 'Send Media', icon: Image },
                { key: 'sendLinks', label: 'Send Links', icon: Link },
                { key: 'addMembers', label: 'Add Members', icon: Users },
                { key: 'changeGroupInfo', label: 'Change Group Info', icon: Settings },
                { key: 'pinMessages', label: 'Pin Messages', icon: Pin },
                { key: 'deleteMessages', label: 'Delete Messages', icon: Trash2 },
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <button
                    onClick={() => setPermissions({ ...permissions, [key]: !permissions[key as keyof typeof permissions] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      permissions[key as keyof typeof permissions] ? 'bg-spark-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      permissions[key as keyof typeof permissions] ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              ))}
              <Button onClick={handleSavePermissions} loading={saving} className="w-full mt-4">
                Save Permissions
              </Button>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <Input
                placeholder="Search members..."
                value={searchMembers}
                onChange={(e) => setSearchMembers(e.target.value)}
                leftIcon={<Users className="w-4 h-4" />}
              />
              <div className="space-y-1">
                {filteredMembers.map((member: any) => {
                  const memberId = member._id;
                  const isOwnerFlag = memberId === ownerId;
                  const isAdminFlag = admins.includes(memberId);
                  const canModify = isOwner && !isOwnerFlag;
                  return (
                    <div key={memberId} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Avatar src={member.avatar} name={member.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {member.displayName}
                          {isOwnerFlag && ' 👑 Owner'}
                          {isAdminFlag && !isOwnerFlag && ' ⭐ Admin'}
                        </span>
                        <span className="text-xs text-gray-400">{member.phone || ''}</span>
                      </div>
                      {canModify && !isOwnerFlag && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove member"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-2">Manage group administrators</p>
              <div className="space-y-1">
                {members.map((member: any) => {
                  const memberId = member._id;
                  const isOwnerFlag = memberId === ownerId;
                  const isAdminFlag = admins.includes(memberId);
                  const canModify = isOwner && !isOwnerFlag;
                  return (
                    <div key={memberId} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Avatar src={member.avatar} name={member.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {member.displayName}
                          {isOwnerFlag && ' (Owner)'}
                        </span>
                      </div>
                      {canModify && !isOwnerFlag && (
                        <button
                          onClick={() => handleToggleAdmin(memberId)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isAdminFlag
                              ? 'bg-spark-100 dark:bg-spark-900 text-spark-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {isAdminFlag ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-2">Media Permissions</p>
              {[
                { key: 'allowImages', label: 'Allow Images', icon: Image },
                { key: 'allowVideos', label: 'Allow Videos', icon: Video },
                { key: 'allowDocuments', label: 'Allow Documents', icon: FileText },
                { key: 'allowVoice', label: 'Allow Voice Messages', icon: Mic },
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <button
                    onClick={() => setMediaSettings({ ...mediaSettings, [key]: !mediaSettings[key as keyof typeof mediaSettings] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      mediaSettings[key as keyof typeof mediaSettings] ? 'bg-spark-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      mediaSettings[key as keyof typeof mediaSettings] ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              ))}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">File Size Limits</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Max Image (MB)</label>
                    <input
                      type="number"
                      value={mediaSettings.maxImageSize}
                      onChange={(e) => setMediaSettings({ ...mediaSettings, maxImageSize: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Max Video (MB)</label>
                    <input
                      type="number"
                      value={mediaSettings.maxVideoSize}
                      onChange={(e) => setMediaSettings({ ...mediaSettings, maxVideoSize: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleSavePermissions} loading={saving} className="w-full mt-4">
                Save Media Settings
              </Button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Disappearing Messages</span>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, disappearingMessages: !security.disappearingMessages })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    security.disappearingMessages ? 'bg-spark-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    security.disappearingMessages ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </label>

              {security.disappearingMessages && (
                <select
                  value={security.disappearAfter}
                  onChange={(e) => setSecurity({ ...security, disappearAfter: parseInt(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value={86400}>24 hours</option>
                  <option value={604800}>7 days</option>
                  <option value={2592000}>30 days</option>
                  <option value={7776000}>90 days</option>
                </select>
              )}

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Restrict Message Forwarding</span>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, restrictForwarding: !security.restrictForwarding })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    security.restrictForwarding ? 'bg-spark-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    security.restrictForwarding ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">End-to-End Encryption</span>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, encryptMessages: !security.encryptMessages })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    security.encryptMessages ? 'bg-spark-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    security.encryptMessages ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </label>

              <Button onClick={handleSaveSecurity} loading={saving} className="w-full mt-4">
                Save Security Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}