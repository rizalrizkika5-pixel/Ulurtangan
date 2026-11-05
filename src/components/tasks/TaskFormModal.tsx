import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, Campaign, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { createTask, updateTask } from '../../services/taskService';
import { Plus, Save, Calendar, User, Layers, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  campaigns: Campaign[];
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  onSuccess: () => void;
}

export const TaskFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  taskToEdit,
  campaigns,
  users,
  currentUserProfile,
  onSuccess,
}) => {
  const isEditing = !!taskToEdit;

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [department, setDepartment] = useState(taskToEdit?.department || 'DIVISI_PROGRAM');
  const [campaignId, setCampaignId] = useState(taskToEdit?.campaignId || '');
  const [picId, setPicId] = useState(taskToEdit?.picId || currentUserProfile?.uid || '');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'NORMAL');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || 'SIAP_DIKERJAKAN');
  const [startDate, setStartDate] = useState(taskToEdit?.startDate || todayStr);
  const [deadline, setDeadline] = useState(taskToEdit?.deadline || todayStr);
  const [docLink, setDocLink] = useState('');
  const [documentLinks, setDocumentLinks] = useState<string[]>(taskToEdit?.documentLinks || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDocLink = () => {
    if (!docLink.trim()) return;
    setDocumentLinks([...documentLinks, docLink.trim()]);
    setDocLink('');
  };

  const handleRemoveDocLink = (idx: number) => {
    setDocumentLinks(documentLinks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi.');
      return;
    }
    if (!deadline) {
      setError('Deadline tugas wajib ditentukan.');
      return;
    }

    setLoading(true);
    setError(null);

    const selectedPic = users.find((u) => u.uid === picId);
    const picName = selectedPic?.fullName || (picId === currentUserProfile?.uid ? currentUserProfile?.fullName : 'PIC');
    const selectedCampaign = campaigns.find((c) => c.id === campaignId);

    try {
      if (isEditing && taskToEdit) {
        await updateTask(
          taskToEdit.id,
          {
            title: title.trim(),
            description: description.trim(),
            department,
            campaignId: campaignId || undefined,
            campaignTitle: selectedCampaign?.title || undefined,
            picId,
            picName,
            priority,
            status,
            startDate,
            deadline,
            documentLinks,
          },
          'Perubahan Data Tugas'
        );
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          department,
          campaignId: campaignId || undefined,
          campaignTitle: selectedCampaign?.title || undefined,
          picId,
          picName,
          createdById: currentUserProfile?.uid || 'ADMIN',
          createdByName: currentUserProfile?.fullName || 'Super Administrator',
          priority,
          status,
          startDate,
          deadline,
          progress: 0,
          documentLinks,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Rincian Tugas' : 'Buat Tugas Operasional Baru'}
      subtitle="Tetapkan penanggung jawab, prioritas, dan deadline yang jelas"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Judul Tugas <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Survei Lokasi Pembangunan Sumur Bor Dusun Melati"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Deskripsi & Standar Hasil (SOP)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan instruksi kerja, standar hasil yang diharapkan, serta dokumen yang harus dilengkapi..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tingkat Prioritas <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="KRITIS">KRITIS (Dampak besar jika terlambat)</option>
              <option value="TINGGI">TINGGI (Segera diselesaikan)</option>
              <option value="NORMAL">NORMAL (Reguler sesuai jadwal)</option>
              <option value="RENDAH">RENDAH (Rutin tidak mendesak)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Status Pekerjaan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="BACKLOG">BACKLOG (Belum dikerjakan)</option>
              <option value="SIAP_DIKERJAKAN">SIAP DIKERJAKAN</option>
              <option value="BERJALAN">SEDANG BERJALAN</option>
              <option value="MENUNGGU_PERSETUJUAN">MENUNGGU PERSETUJUAN</option>
              <option value="TERHAMBAT">TERHAMBAT</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          </div>
        </div>

        {/* Division & Campaign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Divisi Penanggung Jawab
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="DIVISI_PROGRAM">Divisi Program</option>
              <option value="DIVISI_FUNDRAISING">Divisi Fundraising</option>
              <option value="KONTEN_KREATOR_VIDEO">Konten Kreator Video</option>
              <option value="MEDIA_SOSIAL_WEBSITE">Media Sosial & Website</option>
              <option value="ADMIN_CRM">Admin CRM & Donasi</option>
              <option value="KOORDINATOR_OPERASIONAL">Koordinator Operasional</option>
              <option value="KARYAWAN_RELAWAN">Karyawan / Relawan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Campaign Terkait</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="">-- Tidak Terikat Campaign Spesifik --</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.programType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PIC & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              PIC Utama <span className="text-rose-500">*</span>
            </label>
            <select
              value={picId}
              onChange={(e) => setPicId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="">-- Pilih PIC --</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.fullName} ({u.department})
                </option>
              ))}
              {/* Fallback if user list is small */}
              {currentUserProfile && (
                <option value={currentUserProfile.uid}>
                  {currentUserProfile.fullName} (Saya Sendiri)
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Batas Waktu (Deadline) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
          </div>
        </div>

        {/* Google Drive / Document Links */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Link Referensi SOP / Dokumen Google Drive
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={docLink}
              onChange={(e) => setDocLink(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
            <button
              type="button"
              onClick={handleAddDocLink}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Tambah
            </button>
          </div>

          {documentLinks.length > 0 && (
            <ul className="space-y-1">
              {documentLinks.map((link, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="truncate max-w-xs text-emerald-800 font-mono text-[11px]">{link}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocLink(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
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
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Tugas'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
