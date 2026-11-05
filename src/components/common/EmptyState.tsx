import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 my-4">
      <div className="p-4 rounded-2xl bg-[#F4F7F5] text-[#173D32] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#173D32] text-white text-sm font-semibold rounded-xl hover:bg-[#245D49] transition shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
