import React, { useState } from 'react';
import { Campaign, ProgramType, CampaignStatus, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { createCampaign, updateCampaign } from '../../services/campaignService';
import { Plus, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: Campaign | null;
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  defaultProgramType?: ProgramType;
  onSuccess: () => void;
}

export const CampaignFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  campaignToEdit,
  users,
  currentUserProfile,
  defaultProgramType,
  onSuccess,
}) => {
  const isEditing = !!campaignToEdit;

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [title, setTitle] = useState(campaignToEdit?.title || '');
  const [programType, setProgramType] = useState<ProgramType>(
    campaignToEdit?.programType || defaultProgramType || 'AIR_BERSIH'
  );
  const [description, setDescription] = useState(campaignToEdit?.description || '');
  const [background, setBackground] = useState(campaignToEdit?.background || '');
  const [location, setLocation] = useState(campaignToEdit?.location || '');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState<number>(
    campaignToEdit?.targetBeneficiaries || 100
  );
  const [targetBeneficiaryDescription, setTargetBeneficiaryDescription] = useState(
    campaignToEdit?.targetBeneficiaryDescription || ''
  );
  const [targetAmount, setTargetAmount] = useState<number>(campaignToEdit?.targetAmount || 50000000);
  const [startDate, setStartDate] = useState(campaignToEdit?.startDate || todayStr);
  const [deadline, setDeadline] = useState(campaignToEdit?.deadline || todayStr);
  const [status, setStatus] = useState<CampaignStatus>(
    campaignToEdit?.status || 'PERSIAPAN_FUNDRAISING'
  );

  const [picProgramId, setPicProgramId] = useState(campaignToEdit?.picProgramId || '');
  const [picFundraisingId, setPicFundraisingId] = useState(campaignToEdit?.picFundraisingId || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama campaign wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    const programPicUser = users.find((u) => u.uid === picProgramId);
    const fundPicUser = users.find((u) => u.uid === picFundraisingId);

    try {
      if (isEditing && campaignToEdit) {
        await updateCampaign(campaignToEdit.id, {
          title: title.trim(),
          programType,
          description: description.trim(),
          background: background.trim(),
          location: location.trim(),
          targetBeneficiaries: Number(targetBeneficiaries),
          targetBeneficiaryDescription,
          targetAmount: Number(targetAmount),
          startDate,
          deadline,
          status,
          picProgramId,
          picProgramName: programPicUser?.fullName || 'PIC Program',
          picFundraisingId,
          picFundraisingName: fundPicUser?.fullName || 'PIC Fundraising',
        });
      } else {
        await createCampaign({
          title: title.trim(),
          programType,
          description: description.trim(),
          background: background.trim(),
          location: location.trim(),
          targetBeneficiaries: Number(targetBeneficiaries),
          targetBeneficiaryDescription,
          picProgramId: picProgramId || currentUserProfile?.uid || 'SYSTEM',
          picProgramName: programPicUser?.fullName || currentUserProfile?.fullName || 'Divisi Program',
          picFundraisingId: picFundraisingId || currentUserProfile?.uid || 'SYSTEM',
          picFundraisingName: fundPicUser?.fullName || currentUserProfile?.fullName || 'Divisi Fundraising',
          targetAmount: Number(targetAmount),
          collectedAmount: 0,
          budgetApproved: Number(targetAmount),
          startDate,
          deadline,
          status,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Data Campaign' : 'Buat Campaign Sosial Baru'}
      subtitle="Pastikan setiap campaign memiliki program utama, target dana, dan PIC yang jelas"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Nama Campaign <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Sumur Bor Air Bersih Gunungkidul"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        {/* 9 Program Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Program Utama Yayasan (9 Pilar) <span className="text-rose-500">*</span>
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value as ProgramType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="AIR_BERSIH">1. AIR BERSIH</option>
              <option value="PENDIDIKAN">2. PENDIDIKAN</option>
              <option value="KESEHATAN">3. KESEHATAN</option>
              <option value="PANGAN">4. PANGAN</option>
              <option value="ZAKAT">5. ZAKAT</option>
              <option value="PEMBERDAYAAN">6. PEMBERDAYAAN</option>
              <option value="EMERGENCY">7. EMERGENCY</option>
              <option value="RAMADHAN">8. RAMADHAN</option>
              <option value="QURBAN">9. QURBAN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Status Campaign</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CampaignStatus)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="IDE">IDE</option>
              <option value="ASSESSMENT">ASSESSMENT</option>
              <option value="PERSETUJUAN">PERSETUJUAN</option>
              <option value="PERSIAPAN_FUNDRAISING">PERSIAPAN FUNDRAISING</option>
              <option value="FUNDRAISING">FUNDRAISING</option>
              <option value="SIAP_IMPLEMENTASI">SIAP IMPLEMENTASI</option>
              <option value="IMPLEMENTASI">IMPLEMENTASI</option>
              <option value="PELAPORAN">PELAPORAN</option>
              <option value="EVALUASI">EVALUASI</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          </div>
        </div>

        {/* Location & Target Beneficiaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Lokasi Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Kota / Kabupaten, Provinsi"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Target Jumlah Penerima Manfaat (Mustahik)
            </label>
            <input
              type="number"
              min="1"
              value={targetBeneficiaries}
              onChange={(e) => setTargetBeneficiaries(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
          </div>
        </div>

        {/* Target Amount (IDR) & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Target Dana (Rupiah) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="100000"
              step="500000"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            />
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

        {/* PIC Program & PIC Fundraising */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">PIC Divisi Program</label>
            <select
              value={picProgramId}
              onChange={(e) => setPicProgramId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="">-- Pilih Penanggung Jawab Program --</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.fullName} ({u.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">PIC Divisi Fundraising</label>
            <select
              value={picFundraisingId}
              onChange={(e) => setPicFundraisingId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
            >
              <option value="">-- Pilih Penanggung Jawab Fundraising --</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.fullName} ({u.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description & Background */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Deskripsi Singkat Program</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara ringkas maksud dan output program..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Latar Belakang & Urgensi Masalah
          </label>
          <textarea
            rows={2}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Kondisi riil di lapangan mengapa program ini mendesak untuk dibantu..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
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
            <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Campaign'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
