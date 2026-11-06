import React, { useState } from 'react';
import { Task, UserProfile } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateID } from '../utils/formatters';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  CheckSquare,
  TrendingUp,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  users: UserProfile[];
  tasks: Task[];
  currentUserProfile: UserProfile | null;
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
}

export const StaffSummaryPage: React.FC<Props> = ({
  users,
  tasks,
  currentUserProfile,
  onSelectTask,
  onOpenProgressModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedStaffUid, setSelectedStaffUid] = useState<string>('ALL');
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Aggregate stats per user
  const staffSummaries = users
    .filter((u) => u.isActive)
    .map((user) => {
      const userTasks = tasks.filter(
        (t) => t.picId === user.uid || (t.supportingMembers && t.supportingMembers.includes(user.uid))
      );
      const total = userTasks.length;
      const completed = userTasks.filter((t) => t.status === 'SELESAI').length;
      const inProgress = userTasks.filter((t) => t.status === 'BERJALAN').length;
      const waitingApproval = userTasks.filter((t) => t.status === 'MENUNGGU_PERSETUJUAN').length;
      const obstructed = userTasks.filter((t) => t.status === 'TERHAMBAT' || !!t.obstacles).length;
      const overdue = userTasks.filter(
        (t) => t.status !== 'SELESAI' && t.status !== 'DIBATALKAN' && t.deadline && t.deadline < todayStr
      ).length;
      const critical = userTasks.filter(
        (t) => t.priority === 'KRITIS' && t.status !== 'SELESAI'
      ).length;

      const avgProgress =
        total > 0
          ? Math.round(userTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / total)
          : 0;

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        user,
        userTasks,
        total,
        completed,
        inProgress,
        waitingApproval,
        obstructed,
        overdue,
        critical,
        avgProgress,
        completionRate,
      };
    });

  // Filtered staff list
  const filteredStaff = staffSummaries.filter((s) => {
    const matchSearch =
      s.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = departmentFilter === 'ALL' || s.user.department === departmentFilter;
    const matchStaff = selectedStaffUid === 'ALL' || s.user.uid === selectedStaffUid;

    return matchSearch && matchDept && matchStaff;
  });

  const toggleExpand = (uid: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleExportCSV = () => {
    const headers = [
      'Nama Karyawan',
      'Username',
      'Departemen',
      'Peran (Role)',
      'Total Tugas',
      'Tugas Selesai',
      'Tingkat Selesai (%)',
      'Tugas Berjalan',
      'Menunggu Approval',
      'Terhambat',
      'Terlambat',
      'Tugas Kritis',
      'Rata-Rata Progres (%)',
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.user.fullName.replace(/"/g, '""')}"`,
      s.user.username,
      s.user.department,
      s.user.role,
      s.total,
      s.completed,
      `${s.completionRate}%`,
      s.inProgress,
      s.waitingApproval,
      s.obstructed,
      s.overdue,
      s.critical,
      `${s.avgProgress}%`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_kinerja_karyawan_yiut_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Overall organization totals
  const totalStaffCount = staffSummaries.length;
  const grandTotalTasks = staffSummaries.reduce((acc, s) => acc + s.total, 0);
  const grandCompletedTasks = staffSummaries.reduce((acc, s) => acc + s.completed, 0);
  const grandOverdueTasks = staffSummaries.reduce((acc, s) => acc + s.overdue, 0);
  const overallCompletionRate =
    grandTotalTasks > 0 ? Math.round((grandCompletedTasks / grandTotalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#173D32] via-[#245D49] to-[#173D32] rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Kontrol & Evaluasi Mandiri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Rangkuman Karyawan & Kontrol Beban Kerja
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Ringkasan terpadu tugas dan tanggung jawab masing-masing staf untuk memudahkan pengawasan pimpinan, koordinasi antar divisi, dan evaluasi berkala kinerja yayasan.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Rekap Kinerja (CSV)</span>
        </button>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Staf Terdaftar
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{totalStaffCount}</span>
            <span className="text-xs text-slate-500">Orang Aktif</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Tugas PIC
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{grandTotalTasks}</span>
            <span className="text-xs text-slate-500">Penugasan</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tingkat Penyelesaian
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">{overallCompletionRate}%</span>
            <span className="text-xs text-slate-500">({grandCompletedTasks} Selesai)</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
            Perlu Perhatian
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">{grandOverdueTasks}</span>
            <span className="text-xs text-rose-500">Tugas Terlambat</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan, username, atau divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="DIVISI_PROGRAM">Divisi Program</option>
            <option value="DIVISI_FUNDRAISING">Divisi Fundraising</option>
            <option value="KONTEN_KREATOR">Konten Kreator</option>
            <option value="MEDIA_SOSIAL">Media Sosial</option>
            <option value="ADMIN_CRM">Admin CRM</option>
            <option value="KEUANGAN">Keuangan</option>
            <option value="OPERASIONAL">Operasional</option>
          </select>

          <select
            value={selectedStaffUid}
            onChange={(e) => setSelectedStaffUid(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Pilih Karyawan Khusus</option>
            {users.filter(u => u.isActive).map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.fullName} (@{u.username})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Cards with Task Breakdown */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada data karyawan yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredStaff.map((summary) => {
            const isExpanded = !!expandedUsers[summary.user.uid];
            const isMe = summary.user.uid === currentUserProfile?.uid;

            return (
              <div
                key={summary.user.uid}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  isMe ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                {/* Staff Summary Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#173D32] text-amber-300 font-black text-sm flex items-center justify-center shrink-0 shadow-xs uppercase">
                      {summary.user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{summary.user.fullName}</h3>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Saya
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">@{summary.user.username}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {summary.user.department.replace(/_/g, ' ')} &bull; {summary.user.role.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Task Metrics Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Tugas Selesai</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        {summary.completed} <span className="text-[10px] text-slate-400 font-normal">/ {summary.total}</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Sedang Berjalan</span>
                      <span className="font-bold text-amber-600 font-mono text-sm">{summary.inProgress}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Terlambat</span>
                      <span className={`font-bold font-mono text-sm ${summary.overdue > 0 ? 'text-rose-600 font-black' : 'text-slate-600'}`}>
                        {summary.overdue}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Progres Rata-rata</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{summary.avgProgress}%</span>
                    </div>
                  </div>

                  {/* Toggle Accordion Button */}
                  <button
                    onClick={() => toggleExpand(summary.user.uid)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shrink-0"
                  >
                    <span>{isExpanded ? 'Tutup Rincian' : `Lihat ${summary.total} Tugas`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Task List */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Daftar Tugas Karyawan ({summary.userTasks.length} Item)</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Klik pada tugas untuk evaluasi atau lihat detail
                      </span>
                    </h4>

                    {summary.userTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 text-center">
                        Belum ada tugas yang ditugaskan ke karyawan ini.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <thead className="bg-[#173D32] text-white text-[11px] font-bold">
                            <tr>
                              <th className="py-2.5 px-3">ID & Judul Tugas</th>
                              <th className="py-2.5 px-3">Prioritas</th>
                              <th className="py-2.5 px-3">Deadline</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Progres</th>
                              <th className="py-2.5 px-3 text-right">Tindakan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {summary.userTasks.map((t) => (
                              <tr
                                key={t.id}
                                className="hover:bg-slate-50 transition cursor-pointer"
                                onClick={() => onSelectTask(t)}
                              >
                                <td className="py-2.5 px-3">
                                  <span className="font-mono text-[10px] text-slate-400 block font-bold">
                                    {t.taskId}
                                  </span>
                                  <span className="font-bold text-slate-900 line-clamp-1">{t.title}</span>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <PriorityBadge priority={t.priority} size="sm" />
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <DeadlineBadge deadline={t.deadline} status={t.status} />
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <StatusBadge status={t.status} />
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-600 rounded-full"
                                        style={{ width: `${t.progress || 0}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[11px] text-slate-700 font-bold">
                                      {t.progress || 0}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenProgressModal(t);
                                    }}
                                    className="px-2.5 py-1 bg-[#173D32] hover:bg-[#245D49] text-white text-[10px] font-bold rounded-lg transition"
                                  >
                                    Update Progres
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
