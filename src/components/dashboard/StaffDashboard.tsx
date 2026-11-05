import React from 'react';
import { Task, UserProfile } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateID } from '../../utils/formatters';
import { sortTasksByPriorityAndDeadline } from '../../utils/deadlines';
import {
  CheckSquare,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  Calendar,
} from 'lucide-react';

interface Props {
  userProfile: UserProfile | null;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onNavigateTab: (tabId: string) => void;
}

export const StaffDashboard: React.FC<Props> = ({
  userProfile,
  tasks,
  onSelectTask,
  onOpenProgressModal,
  onNavigateTab,
}) => {
  const currentUid = userProfile?.uid;

  // Filter tasks assigned to this user
  const myTasks = tasks.filter(
    (t) => t.picId === currentUid || (t.supportingMembers && t.supportingMembers.includes(currentUid || ''))
  );

  const sortedMyTasks = sortTasksByPriorityAndDeadline(myTasks);

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const overdueTasks = myTasks.filter(
    (t) => t.status !== 'SELESAI' && t.status !== 'DIBATALKAN' && t.deadline && t.deadline < todayStr
  );

  const dueTodayTasks = myTasks.filter(
    (t) => t.status !== 'SELESAI' && t.status !== 'DIBATALKAN' && t.deadline === todayStr
  );

  const inProgressTasks = myTasks.filter((t) => t.status === 'BERJALAN');
  const waitingApprovalTasks = myTasks.filter((t) => t.status === 'MENUNGGU_PERSETUJUAN');
  const completedTasks = myTasks.filter((t) => t.status === 'SELESAI');

  return (
    <div className="space-y-6">
      {/* Personal Greeting & Operational Creed */}
      <div className="p-6 bg-gradient-to-r from-[#173D32] via-[#245D49] to-[#173D32] rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Assalamu'alaikum Warahmatullahi Wabarakatuh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Selamat Bertugas, {userProfile?.fullName || 'Karyawan YIUT'}!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            "JANGAN MENUNGGU DIPERINTAH. LIHAT TUGAS, KERJAKAN, UPDATE, DAN LAPORKAN."
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 font-medium">
              Divisi: {userProfile?.department.replace(/_/g, ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 font-medium">
              {myTasks.length} Total Tugas Anda
            </span>
          </div>
        </div>
      </div>

      {/* Quick Status Cards for Employee */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Hari Ini</span>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">{dueTodayTasks.length}</h4>
          <span className="text-[10px] text-slate-400">Jatuh tempo sekarang</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs ${
          overdueTasks.length > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-tight ${
            overdueTasks.length > 0 ? 'text-rose-700' : 'text-slate-500'
          }`}>
            Terlambat
          </span>
          <h4 className={`text-2xl font-bold mt-1 ${
            overdueTasks.length > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}>
            {overdueTasks.length}
          </h4>
          <span className="text-[10px] text-slate-400">Perlu tindakan kilat</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Menunggu Verifikasi</span>
          <h4 className="text-2xl font-bold text-amber-700 mt-1">{waitingApprovalTasks.length}</h4>
          <span className="text-[10px] text-slate-400">Proses pimpinan</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Tugas Selesai</span>
          <h4 className="text-2xl font-bold text-emerald-700 mt-1">{completedTasks.length}</h4>
          <span className="text-[10px] text-slate-400">Terverifikasi</span>
        </div>
      </div>

      {/* TOP PRIORITY & NEAREST DEADLINE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Pekerjaan Paling Prioritas & Deadline Terdekat</span>
            </h3>
            <p className="text-xs text-slate-500">
              Disusun otomatis agar Anda selalu mengetahui apa yang paling mendesak untuk dikerjakan sekarang
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            Lihat Semua Tugas &rarr;
          </button>
        </div>

        {sortedMyTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <CheckSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Belum Ada Tugas Aktif</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Saat ini belum ada tugas yang ditugaskan kepada Anda. Silakan hubungi Koordinator Operasional atau buat inisiatif tugas baru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMyTasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <PriorityBadge priority={task.priority} size="sm" />
                    <DeadlineBadge deadline={task.deadline} status={task.status} />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {task.campaignTitle && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-medium">
                      Campaign: {task.campaignTitle}
                    </span>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progres Saat Ini</span>
                      <span className="font-bold text-slate-800">{task.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          task.progress === 100
                            ? 'bg-emerald-500'
                            : task.priority === 'KRITIS'
                            ? 'bg-rose-500'
                            : 'bg-[#173D32]'
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <StatusBadge status={task.status} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProgressModal(task);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#173D32] hover:bg-[#245D49] rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Update Progres & Bukti</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
