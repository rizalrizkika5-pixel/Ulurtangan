import React from 'react';
import { TaskStatus, CampaignStatus, DonationStatus } from '../../types';

interface Props {
  status: TaskStatus | CampaignStatus | DonationStatus | string;
  type?: 'task' | 'campaign' | 'donation' | 'generic';
}

export const StatusBadge: React.FC<Props> = ({ status, type = 'generic' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Task Statuses
      case 'BACKLOG':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SIAP_DIKERJAKAN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'BERJALAN':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'MENUNGGU_PERSETUJUAN':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      case 'TERHAMBAT':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
      case 'SELESAI':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DIBATALKAN':
        return 'bg-zinc-100 text-zinc-600 border-zinc-300 line-through';

      // Campaign Statuses
      case 'IDE':
      case 'ASSESSMENT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'PERSETUJUAN':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FUNDRAISING':
      case 'PERSIAPAN_FUNDRAISING':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      case 'IMPLEMENTASI':
      case 'SIAP_IMPLEMENTASI':
        return 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
      case 'PELAPORAN':
      case 'EVALUASI':
        return 'bg-sky-50 text-sky-800 border-sky-200';

      // Donation Statuses
      case 'TERVERIFIKASI':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
      case 'MENUNGGU_VERIFIKASI':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DITOLAK':
        return 'bg-rose-100 text-rose-800 border-rose-300';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
};
