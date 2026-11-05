import React, { useState } from 'react';
import { Task, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateID, formatDateTimeID } from '../../utils/formatters';
import { approveOrRejectTask } from '../../services/taskService';
import {
  ExternalLink,
  History,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUserProfile: UserProfile | null;
  onOpenProgressModal: (task: Task) => void;
  onRefresh: () => void;
}

export const TaskDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  task,
  currentUserProfile,
  onOpenProgressModal,
  onRefresh,
}) => {
  if (!task) return null;

  const [approvalNote, setApprovalNote] = useState('');
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL' ||
    task.createdById === currentUserProfile?.uid;

  const handleApproveReject = async (approved: boolean) => {
    setLoadingApproval(true);
    try {
      await approveOrRejectTask(
        task.id,
        approved,
        approvalNote.trim() || (approved ? 'Telah diverifikasi dan disetujui.' : 'Perlu revisi.')
      );
      onRefresh();
      setShowApprovalForm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApproval(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`Kode Tugas: ${task.taskId} • Dibuat oleh: ${task.createdByName || 'Admin'}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Status & Priority Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-2">
            <DeadlineBadge deadline={task.deadline} status={task.status} />
            <span className="text-xs font-mono text-slate-500">
              {formatDateID(task.deadline)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-800">Capaian Progres</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">{task.progress || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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

        {/* Detail Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Penanggung Jawab (PIC)</span>
              <p className="font-bold text-slate-900 mt-0.5">{task.picName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Divisi Terkait</span>
              <p className="font-semibold text-slate-700 mt-0.5">{task.department.replace(/_/g, ' ')}</p>
            </div>
            {task.campaignTitle && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Campaign Program</span>
                <p className="font-semibold text-emerald-800 mt-0.5">{task.campaignTitle}</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Tanggal Mulai</span>
              <p className="font-medium text-slate-700 mt-0.5">{formatDateID(task.startDate) || '-'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Batas Akhir (Deadline)</span>
              <p className="font-medium text-slate-700 mt-0.5">{formatDateID(task.deadline)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Status Persetujuan</span>
              <p className="font-medium text-slate-700 mt-0.5">
                {task.approvalStatus || 'Belum diajukan'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-1.5">
            Deskripsi Instruksi Tugas
          </h4>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.description || 'Tidak ada deskripsi rinci.'}
          </div>
        </div>

        {/* Latest Notes & Proof Links */}
        {(task.notes || (task.proofLinks && task.proofLinks.length > 0)) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Catatan Progres & Bukti Lapangan
            </h4>
            {task.notes && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold block mb-1">Catatan Pengerjaan:</span>
                <p className="leading-relaxed whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}

            {task.proofLinks && task.proofLinks.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">Lampiran Link Bukti:</span>
                <div className="space-y-1">
                  {task.proofLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-emerald-800 font-medium transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Obstacles warning */}
        {task.obstacles && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Kendala yang Dihadapi:</span>
              <p className="leading-relaxed">{task.obstacles}</p>
            </div>
          </div>
        )}

        {/* Timeline History */}
        {task.history && task.history.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Riwayat Perubahan & Audit Trail</span>
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto divide-y divide-slate-200 text-xs">
              {task.history.map((h, i) => (
                <div key={i} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-700">{h.userName}</span>
                    <span>{formatDateTimeID(h.timestamp)}</span>
                  </div>
                  <p className="font-semibold text-slate-900">{h.action}</p>
                  {h.note && <p className="text-slate-600 mt-0.5 italic">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Form for Pimpinan / Koordinator */}
        {isLeaderOrAdmin && (task.status === 'MENUNGGU_PERSETUJUAN' || showApprovalForm) && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-tight">
                Verifikasi & Keputusan Pimpinan
              </h4>
              <span className="text-[11px] text-amber-800 font-medium">Kewenangan Delegasi</span>
            </div>
            <textarea
              rows={2}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Tuliskan catatan verifikasi hasil kerja atau arahan tindak lanjut..."
              className="w-full px-3 py-2 border border-amber-300 bg-white rounded-xl text-xs text-slate-800"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={loadingApproval}
                onClick={() => handleApproveReject(false)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tolak / Minta Revisi</span>
              </button>
              <button
                type="button"
                disabled={loadingApproval}
                onClick={() => handleApproveReject(true)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Setujui (Selesai Tepat Waktu)</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {isLeaderOrAdmin && task.status !== 'MENUNGGU_PERSETUJUAN' && !showApprovalForm && (
              <button
                type="button"
                onClick={() => setShowApprovalForm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
              >
                Evaluasi & Persetujuan
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProgressModal(task);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#173D32] hover:bg-[#245D49] rounded-xl transition shadow-xs"
            >
              Update Progres Tugas
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
