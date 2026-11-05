import React from 'react';
import { AlertCircle, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { TaskPriority } from '../../types';

interface Props {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'md' }) => {
  switch (priority) {
    case 'KRITIS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-300 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Flame className={size === 'sm' ? 'w-3 h-3 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />
          KRITIS
        </span>
      );
    case 'TINGGI':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-amber-100 text-amber-900 border border-amber-300 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <AlertCircle className={size === 'sm' ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          TINGGI
        </span>
      );
    case 'NORMAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-sky-100 text-sky-800 border border-sky-200 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className={size === 'sm' ? 'w-3 h-3 text-sky-600' : 'w-3.5 h-3.5 text-sky-600'} />
          NORMAL
        </span>
      );
    case 'RENDAH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
          RENDAH
        </span>
      );
    default:
      return null;
  }
};
