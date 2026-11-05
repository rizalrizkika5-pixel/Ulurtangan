import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  alert?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#173D32]',
  bgColor = 'bg-emerald-50',
  alert = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-xl border transition-all duration-200 ${
        alert
          ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
          : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4
            className={`text-2xl font-bold tracking-tight mt-1.5 ${
              alert ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
