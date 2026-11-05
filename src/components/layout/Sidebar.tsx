import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  HeartHandshake,
  ClipboardList,
  Users,
  Coins,
  FileSpreadsheet,
  CalendarCheck,
  Video,
  Award,
  UsersRound,
  FileText,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  roles?: UserRole[];
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

interface Props {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: UserRole;
  unreadNotifications?: number;
  onLogout: () => void;
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
  unreadNotifications = 0,
  onLogout,
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isLeader = userRole === 'PIMPINAN' || isSuperAdmin;

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'OPERASIONAL UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Manajemen Tugas', icon: CheckSquare },
        { id: 'notifications', label: 'Pemberitahuan', icon: Bell, badge: unreadNotifications },
      ],
    },
    {
      groupTitle: 'PROGRAM SOSIAL',
      items: [
        { id: 'programs', label: '9 Program Utama', icon: Layers },
        { id: 'campaigns', label: 'Manajemen Campaign', icon: HeartHandshake },
        { id: 'assessments', label: 'Assessment Mustahik', icon: ClipboardList },
        { id: 'implementations', label: 'Pelaksanaan Lapangan', icon: CalendarCheck },
      ],
    },
    {
      groupTitle: 'FUNDRAISING & CRM',
      items: [
        { id: 'fundraising', label: 'Fundraising', icon: Sparkles },
        { id: 'crm', label: 'CRM Donatur', icon: Users },
        { id: 'finance', label: 'Transaksi & Keuangan', icon: Coins },
        { id: 'budget', label: 'Anggaran Belanja', icon: FileSpreadsheet },
      ],
    },
    {
      groupTitle: 'KONTEN & PENGENDALIAN',
      items: [
        { id: 'content', label: 'Kalender Konten', icon: Video },
        { id: 'meetings', label: 'Rapat & Keputusan', icon: UsersRound },
        { id: 'kpi', label: 'Evaluasi KPI Karyawan', icon: Award },
        { id: 'reports', label: 'Laporan & Ekspor', icon: FileText },
      ],
    },
    {
      groupTitle: 'SISTEM & TATA KELOLA',
      items: [
        ...(isSuperAdmin
          ? [{ id: 'users', label: 'Manajemen Pengguna', icon: Settings }]
          : []),
        { id: 'audit', label: 'Audit Log & Jejak', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <aside
      className={
        isMobileDrawer
          ? 'flex flex-col h-full w-full bg-[#173D32] text-white overflow-hidden shadow-2xl'
          : `fixed top-0 left-0 bottom-0 z-30 hidden md:flex flex-col bg-[#173D32] text-white border-r border-[#245D49] transition-all duration-300 ease-in-out ${
              collapsed ? 'w-20' : 'w-64'
            }`
      }
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-900 text-lg shadow-md shrink-0">
            🤝
          </div>
          {(!collapsed || isMobileDrawer) && (
            <div className="truncate">
              <h1 className="text-sm font-black tracking-wider text-white">ULURTANGAN OS</h1>
              <p className="text-[10px] text-emerald-300/80 truncate">Yayasan Indonesia Uluran Tangan</p>
            </div>
          )}
        </div>

        {/* Mobile Drawer Close Button */}
        {isMobileDrawer ? (
          <button
            onClick={onCloseDrawer}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup menu navigasi"
            title="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white transition hidden md:flex items-center justify-center"
            aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {(!collapsed || isMobileDrawer) && (
              <p className="px-3 text-[10px] font-semibold text-emerald-300/50 uppercase tracking-wider">
                {group.groupTitle}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isMobileDrawer && onCloseDrawer) {
                      onCloseDrawer();
                    }
                  }}
                  title={collapsed && !isMobileDrawer ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/40 text-amber-300 shadow-xs font-semibold'
                      : 'text-emerald-100/80 hover:bg-white/5 hover:text-white'
                  } ${collapsed && !isMobileDrawer ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-amber-400' : 'text-emerald-300'
                    }`}
                  />
                  {(!collapsed || isMobileDrawer) && <span className="truncate">{item.label}</span>}
                  {(!collapsed || isMobileDrawer) && item.badge && item.badge > 0 ? (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={() => {
            if (isMobileDrawer && onCloseDrawer) {
              onCloseDrawer();
            }
            onLogout();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition ${
            collapsed && !isMobileDrawer ? 'justify-center' : ''
          }`}
          title="Keluar dari Akun"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobileDrawer) && <span>Keluar Sistem</span>}
        </button>
      </div>
    </aside>
  );
};
