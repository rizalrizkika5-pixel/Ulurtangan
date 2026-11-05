import React, { useState } from 'react';
import { Task } from '../../types';
import { Modal } from '../common/Modal';
import { PriorityBadge } from '../common/PriorityBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { updateTaskProgress } from '../../services/taskService';
import { CheckCircle2, AlertOctagon, Link2, Send, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess: () => void;
}

export const TaskProgressModal: React.FC<Props> = ({ isOpen, onClose, task, onSuccess }) => {
  if (!task) return null;

  const [progress, setProgress] = useState<number>(task.progress || 0);
  const [notes, setNotes] = useState<string>(task.notes || '');
  const [obstacles, setObstacles] = useState<string>(task.obstacles || '');
  const [proofInput, setProofInput] = useState<string>('');
  const [proofLinks, setProofLinks] = useState<string[]>(task.proofLinks || []);
  const [requestApproval, setRequestApproval] = useState<boolean>(progress === 100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProofLink = () => {
    if (!proofInput.trim()) return;
    setProofLinks([...proofLinks, proofInput.trim()]);
    setProofInput('');
  };

  const handleRemoveProofLink = (index: number) => {
    setProofLinks(proofLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateTaskProgress(
        task.id,
        progress,
        notes,
        proofLinks,
        obstacles,
        requestApproval || progress === 100
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui progres tugas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perbarui Progres & Bukti Pekerjaan"
      subtitle={`ID Tugas: ${task.taskId}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Guiding banner: 3 Operational Questions */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
          <div className="flex items-center gap-2 mb-1 text-emerald-950 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>Prinsip Kerja Mandiri Uluran Tangan:</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            1. Kerjakan tugas sesuai standar &bull; 2. Perbarui progres secara berkala &bull; 3. Unggah link bukti dokumen/foto agar pimpinan dapat memantau secara mandiri.
          </p>
        </div>

        {/* Task Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <PriorityBadge priority={task.priority} size="sm" />
            <DeadlineBadge deadline={task.deadline} status={task.status} />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              Persentase Progres Capaian
            </label>
            <span className="text-sm font-black text-[#173D32] px-2.5 py-0.5 rounded-md bg-emerald-100">
              {progress}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => {
              const val = Number(e.target.value);
              setProgress(val);
              if (val === 100) setRequestApproval(true);
            }}
            className="w-full accent-[#173D32] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0% (Mulai)</span>
            <span>50% (Sedang Jalan)</span>
            <span>100% (Selesai Penuh)</span>
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Catatan Perkembangan / Output yang Telah Dicapai
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Sudah selesai survei lapangan, koordinasi dengan kepala dusun telah selesai, menunggu pengiriman material."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32] focus:bg-white"
          />
        </div>

        {/* Proof of Work Links (Google Drive, Docs, etc.) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Link Bukti Pekerjaan (Google Drive / Docs / Foto Lapangan)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
            <button
              type="button"
              onClick={handleAddProofLink}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
            >
              Tambah
            </button>
          </div>

          {proofLinks.length > 0 && (
            <ul className="space-y-1.5 max-h-24 overflow-y-auto">
              {proofLinks.map((link, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <span className="truncate max-w-xs text-emerald-800 underline font-mono text-[11px]">
                    {link}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProofLink(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold ml-2"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Obstacles (Kendala Lapangan) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Kendala / Hambatan Operasional (Jika Ada)</span>
          </label>
          <textarea
            rows={2}
            value={obstacles}
            onChange={(e) => setObstacles(e.target.value)}
            placeholder="Tuliskan jika ada hambatan yang membutuhkan intervensi koordinator atau pimpinan..."
            className="w-full px-3 py-2 border border-rose-200 bg-rose-50/20 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Mengisi kendala akan otomatis menandai status tugas sebagai "TERHAMBAT" agar pimpinan segera mengetahuinya.
          </p>
        </div>

        {/* Request Approval Checkbox */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="reqApp"
            checked={requestApproval || progress === 100}
            onChange={(e) => setRequestApproval(e.target.checked)}
            className="mt-0.5 accent-[#173D32] rounded"
          />
          <label htmlFor="reqApp" className="text-xs text-amber-950 font-medium cursor-pointer">
            Ajukan Persetujuan Selesai ke Pimpinan / Pembuat Tugas
            <span className="block text-[11px] text-amber-800 font-normal mt-0.5">
              Pimpinan akan menerima notifikasi untuk memverifikasi kelengkapan bukti sebelum tugas dinyatakan rampung.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-[#173D32] hover:bg-[#245D49] rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Update Progres'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
