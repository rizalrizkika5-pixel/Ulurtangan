import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateID } from '../../utils/formatters';
import { Search, Filter, ArrowUpDown, Eye, Edit3, Trash2 } from 'lucide-react';
import { sortTasksByPriorityAndDeadline } from '../../utils/deadlines';

interface Props {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  canManageTasks: boolean;
}

export const TaskTable: React.FC<Props> = ({
  tasks,
  onSelectTask,
  onOpenProgressModal,
  onEditTask,
  onDeleteTask,
  canManageTasks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const filteredTasks = sortTasksByPriorityAndDeadline(
    tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.picName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.campaignTitle && t.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchDepartment = departmentFilter === 'ALL' || t.department === departmentFilter;

      return matchSearch && matchPriority && matchStatus && matchDepartment;
    })
  );

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID tugas, judul, atau PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32] focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="KRITIS">KRITIS</option>
            <option value="TINGGI">TINGGI</option>
            <option value="NORMAL">NORMAL</option>
            <option value="RENDAH">RENDAH</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          >
            <option value="ALL">Semua Status</option>
            <option value="BACKLOG">Belum Dikerjakan</option>
            <option value="SIAP_DIKERJAKAN">Siap Dikerjakan</option>
            <option value="BERJALAN">Sedang Berjalan</option>
            <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
            <option value="TERHAMBAT">Terhambat</option>
            <option value="SELESAI">Selesai</option>
          </select>

          {/* Division Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="DIVISI_PROGRAM">Divisi Program</option>
            <option value="DIVISI_FUNDRAISING">Divisi Fundraising</option>
            <option value="KONTEN_KREATOR_VIDEO">Konten Kreator</option>
            <option value="MEDIA_SOSIAL_WEBSITE">Medsos & Web</option>
            <option value="ADMIN_CRM">Admin CRM</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F4F7F5] border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID & Judul Tugas</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">PIC Utama</th>
                <th className="py-3.5 px-4">Batas Waktu (Deadline)</th>
                <th className="py-3.5 px-4">Progres</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada tugas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectTask(task)}
                  >
                    {/* ID & Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono text-[10px] text-slate-400 font-bold block">
                        {task.taskId}
                      </span>
                      <span className="font-bold text-slate-900 line-clamp-1 text-xs">
                        {task.title}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {task.department.replace(/_/g, ' ')}
                        {task.campaignTitle && ` • ${task.campaignTitle}`}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>

                    {/* PIC */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#173D32] font-bold text-[10px] flex items-center justify-center">
                          {task.picName?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-slate-800">{task.picName}</span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <DeadlineBadge deadline={task.deadline} status={task.status} />
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatDateID(task.deadline)}
                        </span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-4 min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            task.progress === 100
                              ? 'bg-emerald-500'
                              : task.priority === 'KRITIS'
                              ? 'bg-rose-500'
                              : 'bg-[#173D32]'
                          }`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenProgressModal(task)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#173D32] hover:bg-[#245D49] rounded-lg transition"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageTasks && onDeleteTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
