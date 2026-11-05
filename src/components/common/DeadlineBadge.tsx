import React from 'react';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { getDeadlineStatus } from '../../utils/deadlines';
import { TaskStatus } from '../../types';

interface Props {
  deadline: string;
  status?: TaskStatus;
  showIcon?: boolean;
}

export const DeadlineBadge: React.FC<Props> = ({ deadline, status, showIcon = true }) => {
  const info = getDeadlineStatus(deadline, status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs ${info.badgeBg} ${info.badgeText}`}
      title={`Batas Waktu: ${deadline}`}
    >
      {showIcon && (
        info.isOverdue ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <Calendar className="w-3.5 h-3.5 opacity-70" />
        )
      )}
      <span>{info.label}</span>
    </span>
  );
};
