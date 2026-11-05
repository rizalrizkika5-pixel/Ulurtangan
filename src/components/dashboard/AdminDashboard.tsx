import React from 'react';
import {
  Task,
  Campaign,
  Donation,
  UserProfile,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatIDR, formatDateID } from '../../utils/formatters';
import { sortTasksByPriorityAndDeadline } from '../../utils/deadlines';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Users,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  FileCheck,
  Building,
} from 'lucide-react';

interface Props {
  tasks: Task[];
  campaigns: Campaign[];
  donations: Donation[];
  users: UserProfile[];
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  tasks,
  campaigns,
  donations,
  users,
  onSelectTask,
  onOpenProgressModal,
  onNavigateTab,
}) => {
  // Compute key stats
  const activeStaffCount = users.filter((u) => u.isActive).length;
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'BERJALAN');
  const completedTasks = tasks.filter((t) => t.status === 'SELESAI');
  const waitingApprovalTasks = tasks.filter((t) => t.status === 'MENUNGGU_PERSETUJUAN');
  const obstructedTasks = tasks.filter((t) => t.status === 'TERHAMBAT' || !!t.obstacles);

  // Today string for comparison
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'SELESAI' && t.status !== 'DIBATALKAN' && t.deadline && t.deadline < todayStr
  );

  const criticalTasks = tasks.filter(
    (t) => t.status !== 'SELESAI' && t.status !== 'DIBATALKAN' && (t.priority === 'KRITIS' || t.priority === 'TINGGI')
  );

  const activeCampaigns = campaigns.filter(
    (c) => c.status !== 'SELESAI' && c.status !== 'DIBATALKAN'
  );

  const totalFundraisingTarget = campaigns.reduce((acc, c) => acc + (c.targetAmount || 0), 0);
  const totalFundraisingCollected = campaigns.reduce((acc, c) => acc + (c.collectedAmount || 0), 0);
  const totalBeneficiaries = campaigns.reduce((acc, c) => acc + (c.targetBeneficiaries || 0), 0);

  const pendingVerificationDonations = donations.filter((d) => d.status === 'MENUNGGU_VERIFIKASI');

  // Need Leadership Action items
  const leadershipActionTasks = sortTasksByPriorityAndDeadline([
    ...overdueTasks,
    ...tasks.filter((t) => t.status === 'MENUNGGU_PERSETUJUAN'),
    ...obstructedTasks,
  ]).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Organization Banner */}
      <div className="p-6 bg-gradient-to-r from-[#173D32] via-[#245D49] to-[#173D32] rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3">
            <span>Yayasan Indonesia Uluran Tangan</span>
            <span>&bull;</span>
            <span className="text-amber-300">Pusat Kendali Eksekutif</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            "Bergerak dengan Sistem, Melayani dengan Amanah."
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Sistem pengawasan terpusat YIUT memastikan pekerjaan yayasan berjalan mandiri, disiplin deadline, serta transparan bagi seluruh pemangku kepentingan umat.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Building className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* SPECIAL SECTION: PERLU TINDAKAN PIMPINAN */}
      <div className="p-4 sm:p-5 bg-rose-50/70 border border-rose-200 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-tight">
                PERLU TINDAKAN PIMPINAN & KOORDINATOR
              </h3>
              <p className="text-xs text-rose-800">
                Item kritis, pekerjaan terhambat, deadline terlampaui, dan persetujuan yang menunggu keputusan Anda
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-rose-200/80 text-rose-900 font-bold text-xs rounded-full whitespace-nowrap">
            {overdueTasks.length + waitingApprovalTasks.length + pendingVerificationDonations.length} Butuh Respon
          </span>
        </div>

        {/* Action Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* Overdue Tasks Card */}
          <div
            onClick={() => onNavigateTab('tasks')}
            className="p-3.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Tugas Terlambat</span>
              <span className="font-bold text-sm text-rose-600 font-mono">{overdueTasks.length}</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              {overdueTasks.length > 0
                ? `${overdueTasks[0].title} (${overdueTasks[0].picName})`
                : 'Alhamdulillah, tidak ada pekerjaan yang terlambat saat ini.'}
            </p>
            <span className="text-[10px] text-rose-700 font-semibold mt-2 inline-flex items-center gap-1">
              Buka Manajemen Tugas &rarr;
            </span>
          </div>

          {/* Pending Task Approvals */}
          <div
            onClick={() => onNavigateTab('tasks')}
            className="p-3.5 bg-white rounded-2xl border border-amber-200 hover:border-amber-400 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Persetujuan Tugas Selesai</span>
              <span className="font-bold text-sm text-amber-700 font-mono">{waitingApprovalTasks.length}</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              {waitingApprovalTasks.length > 0
                ? `${waitingApprovalTasks[0].title} diajukan oleh ${waitingApprovalTasks[0].picName}`
                : 'Tidak ada tugas yang menunggu verifikasi pimpinan.'}
            </p>
            <span className="text-[10px] text-amber-800 font-semibold mt-2 inline-flex items-center gap-1">
              Periksa Bukti Pekerjaan &rarr;
            </span>
          </div>

          {/* Pending Donations Verification */}
          <div
            onClick={() => onNavigateTab('finance')}
            className="p-3.5 bg-white rounded-2xl border border-blue-200 hover:border-blue-400 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase">Verifikasi Transaksi Donasi</span>
              <span className="font-bold text-sm text-blue-700 font-mono">{pendingVerificationDonations.length}</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              {pendingVerificationDonations.length > 0
                ? `Donasi ${formatIDR(pendingVerificationDonations[0].amount)} dari ${pendingVerificationDonations[0].donorName}`
                : 'Semua transaksi donasi telah diverifikasi.'}
            </p>
            <span className="text-[10px] text-blue-800 font-semibold mt-2 inline-flex items-center gap-1">
              Verifikasi Mutasi Bank &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Staf Aktif"
          value={activeStaffCount}
          subtitle="Personel Yayasan"
          icon={Users}
          onClick={() => onNavigateTab('users')}
        />
        <StatCard
          title="Total Tugas"
          value={totalTasks}
          subtitle={`${inProgressTasks.length} berjalan`}
          icon={Clock}
          onClick={() => onNavigateTab('tasks')}
        />
        <StatCard
          title="Tugas Terlambat"
          value={overdueTasks.length}
          subtitle="Melewati batas"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          bgColor="bg-rose-50"
          alert={overdueTasks.length > 0}
          onClick={() => onNavigateTab('tasks')}
        />
        <StatCard
          title="Prioritas Tinggi/Kritis"
          value={criticalTasks.length}
          subtitle="Pekerjaan penting"
          icon={Flame}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => onNavigateTab('tasks')}
        />
        <StatCard
          title="Campaign Aktif"
          value={activeCampaigns.length}
          subtitle="Dari 9 program"
          icon={HeartHandshake}
          onClick={() => onNavigateTab('campaigns')}
        />
        <StatCard
          title="Penerima Manfaat"
          value={totalBeneficiaries.toLocaleString('id-ID')}
          subtitle="Jiwa / Mustahik"
          icon={CheckCircle2}
          onClick={() => onNavigateTab('programs')}
        />
      </div>

      {/* Fundraising Progress Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Kinerja Penghimpunan Dana (Fundraising)
            </h3>
            <p className="text-xs text-slate-500">
              Total capaian dana sosial dari seluruh campaign aktif
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('fundraising')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            Rincian Fundraising &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Terkumpul</span>
            <h4 className="text-xl font-bold text-emerald-800 mt-1">
              {formatIDR(totalFundraisingCollected)}
            </h4>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Target Seluruh Program</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1">
              {formatIDR(totalFundraisingTarget)}
            </h4>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Persentase Capaian</span>
            <h4 className="text-xl font-bold text-amber-600 mt-1">
              {totalFundraisingTarget > 0
                ? `${Math.round((totalFundraisingCollected / totalFundraisingTarget) * 100)}%`
                : '0%'}
            </h4>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
            style={{
              width: `${
                totalFundraisingTarget > 0
                  ? Math.min(100, Math.round((totalFundraisingCollected / totalFundraisingTarget) * 100))
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Critical Tasks Requiring Attention */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Tugas Kritis & Mendekati Batas Waktu
            </h3>
            <p className="text-xs text-slate-500">
              Disortir otomatis: Kritis &gt; Tinggi &gt; Normal, deadline terdekat di paling atas
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            Lihat Semua ({tasks.length}) &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {leadershipActionTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada tugas yang memerlukan tindakan darurat.
            </div>
          ) : (
            leadershipActionTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} size="sm" />
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{t.taskId}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    PIC: <span className="font-medium text-slate-800">{t.picName}</span> &bull; {t.department.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <DeadlineBadge deadline={t.deadline} status={t.status} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProgressModal(t);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#245D49] rounded-lg transition"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
