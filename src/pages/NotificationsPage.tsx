import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDateTimeID } from '../utils/formatters';
import { Bell, CheckCheck, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

interface Props {
  onNavigateTask: () => void;
}

export const NotificationsPage: React.FC<Props> = ({ onNavigateTask }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#173D32]" />
            <span>Pusat Notifikasi & Pengingat Internal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan tugas baru, pengingat deadline, dan notifikasi persetujuan pimpinan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-[#173D32] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-[#173D32] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada notifikasi yang sesuai.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) markAsRead(item.id);
                if (item.link) onNavigateTask();
              }}
              className={`p-4 transition hover:bg-slate-50 cursor-pointer flex items-start justify-between gap-4 ${
                !item.isRead ? 'bg-emerald-50/30' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.body}</p>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  {formatDateTimeID(item.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Tandai dibaca"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {item.link && (
                  <button
                    onClick={() => {
                      markAsRead(item.id);
                      onNavigateTask();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-[#173D32] hover:bg-[#245D49] rounded-lg transition flex items-center gap-1"
                  >
                    <span>Buka Tugas</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
