import React, { useState } from 'react';
import { Campaign, Task, Donation, UserProfile, CampaignStatus } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { formatIDR, formatDateID } from '../../utils/formatters';
import { updateCampaign } from '../../services/campaignService';
import {
  Info,
  ClipboardList,
  FileText,
  Sparkles,
  Video,
  CheckCircle2,
  DollarSign,
  Image,
  Award,
  Layers,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Edit2,
  Save,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  tasks: Task[];
  donations: Donation[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const CampaignDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  campaign,
  tasks,
  donations,
  currentUserProfile,
  onRefresh,
}) => {
  if (!campaign) return null;

  const [activeTab, setActiveTab] = useState<number>(1);
  const [newStatus, setNewStatus] = useState<CampaignStatus>(campaign.status);
  const [evaluationNotes, setEvaluationNotes] = useState(campaign.evaluationNotes || '');
  const [loading, setLoading] = useState(false);

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  const campaignTasks = tasks.filter((t) => t.campaignId === campaign.id);
  const campaignDonations = donations.filter((d) => d.campaignId === campaign.id);

  const percent =
    campaign.targetAmount > 0
      ? Math.min(100, Math.round((campaign.collectedAmount / campaign.targetAmount) * 100))
      : 0;

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await updateCampaign(campaign.id, {
        status: newStatus,
        evaluationNotes: evaluationNotes || undefined,
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 1, label: 'Overview', icon: Info },
    { id: 2, label: 'Assessment', icon: ClipboardList },
    { id: 3, label: 'Proposal', icon: FileText },
    { id: 4, label: 'Fundraising', icon: Sparkles },
    { id: 5, label: 'Konten', icon: Video },
    { id: 6, label: 'Implementasi', icon: CheckCircle2 },
    { id: 7, label: 'Anggaran', icon: DollarSign },
    { id: 8, label: 'Dokumentasi', icon: Image },
    { id: 9, label: 'Laporan', icon: Layers },
    { id: 10, label: 'Evaluasi', icon: Award },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign.title}
      subtitle={`ID Campaign: ${campaign.campaignId} • Program: ${campaign.programType.replace(/_/g, ' ')}`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Top Campaign Status & Financial Snapshot */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#173D32] text-xs font-bold uppercase">
                {campaign.programType.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={campaign.status} type="campaign" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{campaign.location}</span>
              <span>&bull;</span>
              <span>Target: {campaign.targetBeneficiaries} Penerima Manfaat</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Terkumpul / Target:</span>
            <div className="text-base font-black text-emerald-800">
              {formatIDR(campaign.collectedAmount)}{' '}
              <span className="text-xs font-normal text-slate-500">
                / {formatIDR(campaign.targetAmount)} ({percent}%)
              </span>
            </div>
            <div className="w-48 bg-slate-200 rounded-full h-2 overflow-hidden mt-1 ml-auto">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* 10 Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#173D32] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-tight mb-1">
                Latar Belakang & Urgensi Program
              </h4>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {campaign.background || campaign.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">PIC Program</span>
                <p className="font-bold text-slate-800">{campaign.picProgramName || 'Divisi Program'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">PIC Fundraising</span>
                <p className="font-bold text-slate-800">{campaign.picFundraisingName || 'Divisi Fundraising'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Periode Pelaksanaan</span>
                <p className="font-semibold text-slate-800">
                  {formatDateID(campaign.startDate)} s.d. {formatDateID(campaign.deadline)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Anggaran Disetujui (RAB)</span>
                <p className="font-bold text-emerald-800 font-mono">
                  {formatIDR(campaign.budgetApproved || campaign.targetAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Assessment */}
        {activeTab === 2 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">
              Kriteria Kelayakan & Data Mustahik
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 font-semibold block">Profil Calon Penerima Manfaat:</span>
              <p className="text-slate-700 leading-relaxed">
                {campaign.targetBeneficiaryDescription || 'Mustahik dhuafa, janda lansia, dan keluarga pra-sejahtera binaan Yayasan.'}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span>Target Mustahik Terverifikasi:</span>
                <span className="font-bold text-slate-900">{campaign.targetBeneficiaries} Orang / KK</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Proposal */}
        {activeTab === 3 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Dokumen Proposal Resmi</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Proposal Program YIUT - {campaign.title}</p>
                <p className="text-[11px] text-slate-500">Google Docs / PDF resmi yang telah disetujui pimpinan</p>
              </div>
              {campaign.proposalUrl ? (
                <a
                  href={campaign.proposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Proposal</span>
                </a>
              ) : (
                <span className="text-slate-400 italic">Tersimpan dalam arsip YIUT</span>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Fundraising */}
        {activeTab === 4 && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-tight">
                Riwayat Donasi Masuk ({campaignDonations.length} Transaksi)
              </h4>
            </div>
            {campaignDonations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                Belum ada transaksi donasi yang terhubung dengan campaign ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto bg-slate-50 rounded-xl border border-slate-200">
                {campaignDonations.map((don) => (
                  <div key={don.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{don.donorName}</p>
                      <p className="text-[11px] text-slate-500">{formatDateID(don.date)} &bull; {don.fundType}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-emerald-800">{formatIDR(don.amount)}</span>
                      <div className="text-[10px]">
                        <StatusBadge status={don.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Konten */}
        {activeTab === 5 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Kanal Promosi & Materi Publikasi</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-slate-700">
                Materi konten video promosi, reels, poster grafis, dan narasi pesan WhatsApp dikelola secara terpusat di Kalender Konten.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-800 font-semibold">Instagram</span>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-semibold">YouTube</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-semibold">TikTok</span>
                <span className="px-2.5 py-1 rounded-lg bg-green-100 text-green-800 font-semibold">WhatsApp Blast</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Implementasi */}
        {activeTab === 6 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Tugas Operasional Terkait</h4>
            {campaignTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                Belum ada tugas operasional spesifik untuk campaign ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {campaignTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500">PIC: {t.picName} &bull; Batas: {formatDateID(t.deadline)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800">{t.progress}%</span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Anggaran */}
        {activeTab === 7 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Rencana Anggaran Biaya (RAB)</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Total Anggaran Disetujui:</span>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {formatIDR(campaign.budgetApproved || campaign.targetAmount)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Total Dana Dihimpun:</span>
                <p className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                  {formatIDR(campaign.collectedAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Dokumentasi */}
        {activeTab === 8 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Dokumentasi Foto & Video Lapangan</h4>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
              <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>Folder dokumentasi tersinkronisasi dengan Google Drive Yayasan Indonesia Uluran Tangan.</p>
            </div>
          </div>
        )}

        {/* Tab 9: Laporan */}
        {activeTab === 9 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Laporan Pertanggungjawaban (LPJ)</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span>Status Penyusunan LPJ:</span>
                <span className="font-bold text-amber-700">
                  {campaign.status === 'SELESAI' || campaign.status === 'PELAPORAN' ? 'Tahap Finalisasi' : 'Belum Dimulai (Program Masih Berjalan)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: Evaluasi */}
        {activeTab === 10 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight">Evaluasi Kinerja & Catatan Pimpinan</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              {isLeaderOrAdmin ? (
                <>
                  <label className="block text-xs font-bold text-slate-800">
                    Ubah Status Campaign / Catatan Strategis Pimpinan:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CampaignStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                  >
                    <option value="IDE">IDE</option>
                    <option value="ASSESSMENT">ASSESSMENT</option>
                    <option value="PERSETUJUAN">PERSETUJUAN</option>
                    <option value="PERSIAPAN_FUNDRAISING">PERSIAPAN FUNDRAISING</option>
                    <option value="FUNDRAISING">FUNDRAISING</option>
                    <option value="SIAP_IMPLEMENTASI">SIAP IMPLEMENTASI</option>
                    <option value="IMPLEMENTASI">IMPLEMENTASI</option>
                    <option value="PELAPORAN">PELAPORAN</option>
                    <option value="EVALUASI">EVALUASI</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>

                  <textarea
                    rows={3}
                    value={evaluationNotes}
                    onChange={(e) => setEvaluationNotes(e.target.value)}
                    placeholder="Tuliskan catatan evaluasi dampak sosial, efisiensi anggaran, dan rekomendasi perbaikan..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Evaluasi & Perbarui Status'}</span>
                  </button>
                </>
              ) : (
                <p className="text-slate-600 leading-relaxed italic">
                  {campaign.evaluationNotes || 'Belum ada catatan evaluasi dari pimpinan.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
