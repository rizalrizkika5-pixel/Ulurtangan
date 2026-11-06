import React, { useState } from 'react';
import { Campaign, ProgramType, UserProfile, Task, Donation } from '../types';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { CampaignFormModal } from '../components/campaigns/CampaignFormModal';
import { CampaignDetailModal } from '../components/campaigns/CampaignDetailModal';
import { Search, Plus, HeartHandshake } from 'lucide-react';
import { deleteCampaign } from '../services/campaignService';

interface Props {
  campaigns: Campaign[];
  tasks: Task[];
  donations: Donation[];
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const CampaignsPage: React.FC<Props> = ({
  campaigns,
  tasks,
  donations,
  users,
  currentUserProfile,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);

  const handleEditCampaign = (c: Campaign) => {
    setSelectedCampaign(null);
    setCampaignToEdit(c);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const confirm = window.confirm(
      'Apakah Anda yakin ingin menghapus campaign ini? Semua data terkait di dalamnya akan dihapus.'
    );
    if (!confirm) return;

    try {
      await deleteCampaign(campaignId);
      setSelectedCampaign(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus campaign');
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.campaignId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProgram = programFilter === 'ALL' || c.programType === programFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchProgram && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#173D32]" />
            <span>Manajemen Campaign & Proyek Sosial</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola perencanaan, fundraising, pelaksanaan, dan pelaporan program sosial YIUT
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Campaign Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID campaign, nama proyek, atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Semua Program Utama</option>
            <option value="AIR_BERSIH">Air Bersih</option>
            <option value="PENDIDIKAN">Pendidikan</option>
            <option value="KESEHATAN">Kesehatan</option>
            <option value="PANGAN">Pangan</option>
            <option value="ZAKAT">Zakat</option>
            <option value="PEMBERDAYAAN">Pemberdayaan</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="RAMADHAN">Ramadhan</option>
            <option value="QURBAN">Qurban</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="FUNDRAISING">Fundraising Aktif</option>
            <option value="IMPLEMENTASI">Sedang Implementasi</option>
            <option value="PELAPORAN">Pelaporan</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>

      {/* Grid of Campaign Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-sm font-semibold text-slate-700">Tidak ada campaign yang sesuai</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={(c) => setSelectedCampaign(c)}
            />
          ))}
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          campaign={selectedCampaign}
          tasks={tasks}
          donations={donations}
          currentUserProfile={currentUserProfile}
          onRefresh={onRefresh}
          onEditCampaign={handleEditCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />
      )}

      {/* Campaign Form Modal (Create or Edit) */}
      {(showCreateModal || !!campaignToEdit) && (
        <CampaignFormModal
          isOpen={showCreateModal || !!campaignToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setCampaignToEdit(null);
          }}
          campaignToEdit={campaignToEdit}
          users={users}
          currentUserProfile={currentUserProfile}
          onSuccess={() => {
            setShowCreateModal(false);
            setCampaignToEdit(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
