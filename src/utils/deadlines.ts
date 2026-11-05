import { TaskPriority, TaskStatus } from '../types';

export interface DeadlineStatusInfo {
  daysRemaining: number;
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isUrgent: boolean;
}

export function getDeadlineStatus(
  deadlineStr: string,
  taskStatus?: TaskStatus
): DeadlineStatusInfo {
  if (taskStatus === 'SELESAI') {
    return {
      daysRemaining: 0,
      label: 'Selesai Tepat Waktu',
      colorClass: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 border-emerald-300',
      badgeText: 'text-emerald-800',
      isOverdue: false,
      isDueToday: false,
      isUrgent: false,
    };
  }

  if (taskStatus === 'DIBATALKAN') {
    return {
      daysRemaining: 0,
      label: 'Dibatalkan',
      colorClass: 'text-slate-500',
      badgeBg: 'bg-slate-100 border-slate-300',
      badgeText: 'text-slate-700',
      isOverdue: false,
      isDueToday: false,
      isUrgent: false,
    };
  }

  if (!deadlineStr) {
    return {
      daysRemaining: 999,
      label: 'Tanpa Deadline',
      colorClass: 'text-slate-600',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-700',
      isOverdue: false,
      isDueToday: false,
      isUrgent: false,
    };
  }

  // Calculate using Jakarta midnight timezone comparison
  const now = new Date();
  // Get date in YYYY-MM-DD for current local time
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const todayDate = new Date(`${todayStr}T00:00:00+07:00`);
  const deadlineDate = new Date(`${deadlineStr}T00:00:00+07:00`);

  const diffMs = deadlineDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      daysRemaining: diffDays,
      label: `Terlambat ${overdueDays} Hari!`,
      colorClass: 'text-rose-700 font-bold',
      badgeBg: 'bg-rose-100 border-rose-400',
      badgeText: 'text-rose-800 font-semibold animate-pulse',
      isOverdue: true,
      isDueToday: false,
      isUrgent: true,
    };
  }

  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      label: 'Batas Akhir Hari Ini!',
      colorClass: 'text-rose-600 font-semibold',
      badgeBg: 'bg-rose-50 border-rose-300',
      badgeText: 'text-rose-700 font-semibold',
      isOverdue: false,
      isDueToday: true,
      isUrgent: true,
    };
  }

  if (diffDays === 1) {
    return {
      daysRemaining: 1,
      label: 'Besok (1 Hari Lagi)',
      colorClass: 'text-amber-700 font-semibold',
      badgeBg: 'bg-amber-100 border-amber-300',
      badgeText: 'text-amber-800 font-medium',
      isOverdue: false,
      isDueToday: false,
      isUrgent: true,
    };
  }

  if (diffDays === 2 || diffDays === 3) {
    return {
      daysRemaining: diffDays,
      label: `${diffDays} Hari Lagi`,
      colorClass: 'text-amber-600',
      badgeBg: 'bg-yellow-50 border-yellow-300',
      badgeText: 'text-yellow-800',
      isOverdue: false,
      isDueToday: false,
      isUrgent: false,
    };
  }

  return {
    daysRemaining: diffDays,
    label: `${diffDays} Hari Lagi`,
    colorClass: 'text-slate-600',
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-700',
    isOverdue: false,
    isDueToday: false,
    isUrgent: false,
  };
}

export function getPriorityWeight(priority: TaskPriority): number {
  switch (priority) {
    case 'KRITIS':
      return 4;
    case 'TINGGI':
      return 3;
    case 'NORMAL':
      return 2;
    case 'RENDAH':
      return 1;
    default:
      return 0;
  }
}

// Automatic sorting rule: Kritis > Tinggi > Normal > Rendah; if same priority, earliest deadline first
export function sortTasksByPriorityAndDeadline<T extends { priority: TaskPriority; deadline: string }>(
  tasks: T[]
): T[] {
  return [...tasks].sort((a, b) => {
    const weightDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (weightDiff !== 0) return weightDiff;
    return a.deadline.localeCompare(b.deadline);
  });
}
