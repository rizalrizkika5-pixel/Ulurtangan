import React, { useState } from 'react';
import { Task, TaskStatus, Campaign, UserProfile } from '../types';
import { TaskKanban } from '../components/tasks/TaskKanban';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { updateTask, deleteTask } from '../services/taskService';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Calendar as CalendarIcon,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';

interface Props {
  tasks: Task[];
  campaigns: Campaign[];
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  onSelectTask: (task: Task) => void;
  onOpenProgressModal: (task: Task) => void;
  onRefresh: () => void;
}

export const TasksPage: React.FC<Props> = ({
  tasks,
  campaigns,
  users,
  currentUserProfile,
  onSelectTask,
  onOpenProgressModal,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const canManage =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  const handleMoveStatus = async (task: Task, nextStatus: TaskStatus) => {
    try {
      await updateTask(task.id, { status: nextStatus }, `Status diubah ke ${nextStatus}`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    try {
      await deleteTask(taskId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#173D32]" />
            <span>Manajemen Tugas & Prioritas Operasional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pengerjaan mandiri YIUT: Urutan otomatis Kritis &gt; Tinggi &gt; Normal &gt; Rendah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Rinci</span>
            </button>
          </div>

          {/* Create Task Button */}
          <button
            onClick={() => {
              setTaskToEdit(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <TaskKanban
          tasks={tasks}
          onSelectTask={onSelectTask}
          onOpenProgressModal={onOpenProgressModal}
          onMoveStatus={handleMoveStatus}
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onSelectTask={onSelectTask}
          onOpenProgressModal={onOpenProgressModal}
          onEditTask={(t) => {
            setTaskToEdit(t);
            setShowCreateModal(true);
          }}
          onDeleteTask={canManage ? handleDeleteTask : undefined}
          canManageTasks={canManage}
        />
      )}

      {/* Task Form Modal */}
      {showCreateModal && (
        <TaskFormModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
          campaigns={campaigns}
          users={users}
          currentUserProfile={currentUserProfile}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
