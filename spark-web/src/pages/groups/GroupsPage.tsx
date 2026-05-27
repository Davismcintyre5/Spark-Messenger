import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Users, Link, QrCode, 
  Filter, Grid3x3, List, Crown, Copy, Check,
  Settings, LogOut, MessageCircle, Clock
} from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { api } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import GroupListItem from '@/components/chat/GroupListItem';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import QRCode from 'qrcode.react';

type ViewMode = 'list' | 'grid';
type SortBy = 'recent' | 'name' | 'members' | 'active';
type FilterType = 'all' | 'admin' | 'member';

// Group Grid Card Component
const GroupGridCard = ({ group, onClick }: { group: any; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all text-left w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-spark-400 to-spark-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
          {group.icon ? (
            <img src={group.icon} alt={group.name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            group.name?.charAt(0).toUpperCase() || 'G'
          )}
        </div>
        {group.isAdmin && (
          <span className="px-2 py-0.5 bg-spark-100 dark:bg-spark-900/50 text-spark-600 text-xs rounded-full">
            Admin
          </span>
        )}
      </div>
      <h3 className="font-semibold text-base truncate">{group.name || 'Unnamed Group'}</h3>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{group.description || 'No description'}</p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users className="w-3 h-3" />
          <span>{group.memberCount || 0} members</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{group.updatedAt ? new Date(group.updatedAt).toLocaleDateString() : 'New'}</span>
        </div>
      </div>
    </button>
  );
};

export default function GroupsPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const { data: groups, isLoading, refetch } = useGroups();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  const myGroups = groups || [];

  // Calculate stats correctly
  const adminGroups = myGroups.filter(g => g.isAdmin === true);
  const memberGroups = myGroups.filter(g => g.isAdmin !== true);
  const totalMembersCount = myGroups.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  const stats = {
    total: myGroups.length,
    admin: adminGroups.length,
    member: memberGroups.length,
    totalMembers: totalMembersCount,
  };

  const filteredGroups = myGroups
    .filter((g) => {
      const matchesSearch = !search || (g.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'all' 
        ? true 
        : filterType === 'admin' 
          ? g.isAdmin === true
          : g.isAdmin !== true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'members') return (b.memberCount || 0) - (a.memberCount || 0);
      if (sortBy === 'active') return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleGenerateInviteLink = async () => {
    try {
      const response = await api.post('/groups/invite-link/generate');
      setInviteLink(response.data.data.link);
      addToast({ type: 'success', message: 'Invite link generated!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to generate invite link' });
    }
  };

  const handleCopyInvite = () => {
    if (!inviteLink) {
      handleGenerateInviteLink();
      setTimeout(() => {
        navigator.clipboard.writeText(inviteLink);
        setInviteCopied(true);
        addToast({ type: 'success', message: 'Invite link copied!' });
        setTimeout(() => setInviteCopied(false), 2000);
      }, 500);
    } else {
      navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      addToast({ type: 'success', message: 'Invite link copied!' });
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  const handleJoinViaInvite = async () => {
    if (!inviteCode.trim()) return;
    try {
      const code = inviteCode.includes('/join/') 
        ? inviteCode.split('/join/').pop() 
        : inviteCode;
      await api.post(`/groups/join/${code}`);
      addToast({ type: 'success', message: 'Joined group!' });
      setShowJoinModal(false);
      setInviteCode('');
      refetch();
    } catch {
      addToast({ type: 'error', message: 'Invalid or expired invite link' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Groups</h1>
              <p className="text-sm text-gray-400 mt-0.5">Connect and collaborate</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/groups/create')} 
                className="flex items-center gap-2 px-4 py-2 bg-spark-500 text-white rounded-xl hover:bg-spark-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Group</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                    <button 
                      onClick={() => { navigate('/groups/create'); setMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" /> Create Group
                    </button>
                    <button 
                      onClick={() => { setShowJoinModal(true); setMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Link className="w-4 h-4" /> Join via Invite
                    </button>
                    <button 
                      onClick={() => { setShowQRScanner(true); setMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <QrCode className="w-4 h-4" /> Scan QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input 
                placeholder="Search groups..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                leftIcon={<Search className="w-4 h-4" />} 
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                    <button 
                      onClick={() => { setFilterType('all'); setShowFilter(false); }} 
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${filterType === 'all' ? 'text-spark-500' : ''}`}
                    >
                      All Groups
                    </button>
                    <button 
                      onClick={() => { setFilterType('admin'); setShowFilter(false); }} 
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${filterType === 'admin' ? 'text-spark-500' : ''}`}
                    >
                      <Crown className="w-3 h-3 inline mr-2" /> Admin
                    </button>
                    <button 
                      onClick={() => { setFilterType('member'); setShowFilter(false); }} 
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${filterType === 'member' ? 'text-spark-500' : ''}`}
                    >
                      Member
                    </button>
                  </div>
                )}
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                <option value="recent">Recent</option>
                <option value="name">Name A-Z</option>
                <option value="members">Most Members</option>
                <option value="active">Most Active</option>
              </select>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-spark-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-spark-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar - Fixed Math */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-gray-500">
                Total: <strong className="text-gray-900 dark:text-white">{stats.total}</strong>
              </span>
              <span className="text-gray-500">
                Admin: <strong className="text-spark-600">{stats.admin}</strong>
              </span>
              <span className="text-gray-500">
                Member: <strong className="text-gray-600 dark:text-gray-400">{stats.member}</strong>
              </span>
            </div>
            <span className="text-gray-400 text-xs">
              {stats.totalMembers} total members across {stats.total} {stats.total === 1 ? 'group' : 'groups'}
            </span>
          </div>
        </div>
      </div>

      {/* Groups Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredGroups.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.map((group) => (
                <GroupGridCard key={group._id} group={group} onClick={() => navigate(`/groups/${group._id}`)} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredGroups.map((group) => (
                <GroupListItem key={group._id} group={group} onClick={() => navigate(`/groups/${group._id}`)} />
              ))}
            </div>
          )
        ) : (
          <EmptyState 
            title="No groups found" 
            description={search ? "Try a different search" : "Create or join a group to get started"}
            action={
              <button onClick={() => navigate('/groups/create')} className="text-spark-500 font-medium text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create Group
              </button>
            }
          />
        )}
      </div>

      {/* Join via Invite Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Group via Invite" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter the invite code or paste the full invite link</p>
          <Input 
            label="Invite Code / Link" 
            value={inviteCode} 
            onChange={(e) => setInviteCode(e.target.value)} 
            placeholder="https://chat.spark.hdm.com/groups/join/xxxxx or xxxxx" 
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-sm text-gray-500 rounded-lg border border-gray-200">Cancel</button>
            <button onClick={handleJoinViaInvite} className="px-4 py-2 bg-spark-500 text-white text-sm rounded-lg">Join Group</button>
          </div>
        </div>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} title="Scan QR Code" size="sm">
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">Scan a group QR code to join</p>
          <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Use your camera to scan a QR code from another device
          </p>
          <button 
            onClick={() => setShowQRScanner(false)}
            className="mt-4 px-4 py-2 bg-spark-500 text-white rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}