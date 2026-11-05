import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  User,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';

interface Props {
  userProfile: UserProfile | null;
  onOpenMobileMenu: () => void;
  collapsed: boolean;
  activeTitle: string;
  onOpenPasswordModal: () => void;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
  onToggleCollapse?: () => void;
}

export const Topbar: React.FC<Props> = ({
  userProfile,
  onOpenMobileMenu,
  collapsed,
  activeTitle,
  onOpenPasswordModal,
  onSelectTab,
  onLogout,
  onToggleCollapse,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'PIMPINAN':
        return 'Pimpinan Yayasan';
      case 'KOORDINATOR_OPERASIONAL':
        return 'Koordinator Operasional';
      case 'DIVISI_PROGRAM':
        return 'Divisi Program';
      case 'DIVISI_FUNDRAISING':
        return 'Divisi Fundraising';
      case 'KONTEN_KREATOR_VIDEO':
        return 'Konten Kreator';
      case 'MEDIA_SOSIAL_WEBSITE':
        return 'Media Sosial & Web';
      case 'ADMIN_CRM':
        return 'Admin CRM & Donasi';
      case 'KARYAWAN_RELAWAN':
        return 'Karyawan / Relawan';
      default:
        return 'Staf YIUT';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-200/80 transition-all duration-300 flex items-center justify-between px-3 sm:px-6 ${
        collapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      {/* Left: Mobile Toggle & Desktop Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 md:hidden transition shrink-0"
          aria-label="Buka navigasi mobile"
          title="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse/expand trigger */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            title={collapsed ? 'Perluas menu sidebar' : 'Sembunyikan menu sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="truncate">
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 capitalize tracking-tight truncate">
            {activeTitle}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
            Yayasan Indonesia Uluran Tangan &bull; {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
          </p>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-[#173D32] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{getRoleLabel(userProfile?.role)}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Buka notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifikasi Internal ({unreadCount} Baru)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada notifikasi baru saat ini.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 text-xs transition hover:bg-slate-50 cursor-pointer ${
                        !item.isRead ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                      onClick={() => {
                        markAsRead(item.id);
                        if (item.link) {
                          onSelectTab('tasks');
                        }
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-xs">{item.title}</p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-2 text-[11px]">{item.body}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onSelectTab('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  Lihat Seluruh Notifikasi &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#173D32] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {userProfile?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {userProfile?.fullName || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">@{userProfile?.username || 'user'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userProfile?.fullName}</p>
                <p className="text-[11px] text-slate-500">{userProfile?.department}</p>
                <p className="text-[10px] font-semibold text-emerald-700 mt-1 uppercase">
                  {getRoleLabel(userProfile?.role)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenPasswordModal();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Ganti Password</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sistem</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
