import React from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { sortTasksByPriorityAndDeadline } from '../../utils/deadlines';
import { Paperclip, CheckCircle2, AlertOctagon, User, ArrowRight } from 'lucide-react';

interface Props {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onMoveStatus: (task: Task, nextStatus: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Belum Dikerjakan', color: 'border-slate-300 bg-slate-50' },
  { id: 'SIAP_DIKERJAKAN', label: 'Siap Dikerjakan', color: 'border-blue-300 bg-blue-50/40' },
  { id: 'BERJALAN', label: 'Sedang Berjalan', color: 'border-indigo-300 bg-indigo-50/40' },
  { id: 'MENUNGGU_PERSETUJUAN', label: 'Menunggu Persetujuan', color: 'border-amber-300 bg-amber-50/40' },
  { id: 'TERHAMBAT', label: 'Terhambat / Kendala', color: 'border-rose-300 bg-rose-50/40' },
  { id: 'SELESAI', label: 'Selesai Tepat Waktu', color: 'border-emerald-300 bg-emerald-50/40' },
];

export const TaskKanban: React.FC<Props> = ({
  tasks,
  onSelectTask,
  onOpenProgressModal,
  onMoveStatus,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = sortTasksByPriorityAndDeadline(
          tasks.filter((t) => t.status === col.id)
        );

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border ${col.color} p-3 min-w-[260px] h-full max-h-[78vh] overflow-hidden`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 shrink-0">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">
                {col.label}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white text-slate-700 shadow-2xs border border-slate-200">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {colTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Kosong
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group"
                    onClick={() => onSelectTask(task)}
                  >
                    <div>
                      {/* Priority and Task ID */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <PriorityBadge priority={task.priority} size="sm" />
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          {task.taskId}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#173D32] transition line-clamp-2 leading-snug">
                        {task.title}
                      </h4>

                      {/* Division & Campaign */}
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {task.department.replace(/_/g, ' ')}
                        {task.campaignTitle && ` • ${task.campaignTitle}`}
                      </p>

                      {/* Obstacle warning if exists */}
                      {task.obstacles && (
                        <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 flex items-start gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 font-medium">{task.obstacles}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progres</span>
                          <span className="font-semibold text-slate-800">{task.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              task.progress === 100
                                ? 'bg-emerald-500'
                                : task.priority === 'KRITIS'
                                ? 'bg-rose-500'
                                : 'bg-[#173D32]'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer: PIC & Deadline */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 truncate">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#173D32] font-bold text-[9px] flex items-center justify-center shrink-0">
                          {task.picName?.charAt(0) || 'P'}
                        </div>
                        <span className="truncate max-w-[90px] font-medium">{task.picName}</span>
                      </div>
                      <DeadlineBadge deadline={task.deadline} status={task.status} />
                    </div>

                    {/* Quick Action Button */}
                    <div className="mt-2 pt-1 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProgressModal(task);
                        }}
                        className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        Update Progres
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
