import React, { useState } from 'react';
import { Task, Campaign, Donation, UserProfile } from '../types';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { StaffDashboard } from '../components/dashboard/StaffDashboard';
import { LayoutDashboard, UserCheck } from 'lucide-react';

interface Props {
  userProfile: UserProfile | null;
  tasks: Task[];
  campaigns: Campaign[];
  donations: Donation[];
  users: UserProfile[];
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardPage: React.FC<Props> = ({
  userProfile,
  tasks,
  campaigns,
  donations,
  users,
  onSelectTask,
  onOpenProgressModal,
  onNavigateTab,
}) => {
  const isSupervisorRole =
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'PIMPINAN' ||
    userProfile?.role === 'KOORDINATOR_OPERASIONAL';

  // Allow supervisors to toggle between Organization Overview & My Personal Tasks
  const [viewMode, setViewMode] = useState<'admin' | 'personal'>(
    isSupervisorRole ? 'admin' : 'personal'
  );

  return (
    <div className="space-y-6">
      {/* Switcher if supervisor */}
      {isSupervisorRole && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                viewMode === 'admin'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pengawasan Pimpinan</span>
            </button>
            <button
              onClick={() => setViewMode('personal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                viewMode === 'personal'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tugas Pribadi Saya</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            Modus: {viewMode === 'admin' ? 'Pengawasan Terpadu' : 'Personal PIC'}
          </span>
        </div>
      )}

      {viewMode === 'admin' && isSupervisorRole ? (
        <AdminDashboard
          tasks={tasks}
          campaigns={campaigns}
          donations={donations}
          users={users}
          onSelectTask={onSelectTask}
          onOpenProgressModal={onOpenProgressModal}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <StaffDashboard
          userProfile={userProfile}
          tasks={tasks}
          onSelectTask={onSelectTask}
          onOpenProgressModal={onOpenProgressModal}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
