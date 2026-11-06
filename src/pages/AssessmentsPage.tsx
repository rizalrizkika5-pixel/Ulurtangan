import React, { useState } from 'react';
import { Assessment, AssessmentStatus, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatIDR, formatDateID } from '../utils/formatters';
import { createAssessment, updateAssessmentStatus, convertAssessmentToCampaign, updateAssessment, deleteAssessment } from '../services/assessmentService';
import { Modal } from '../components/common/Modal';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  assessments: Assessment[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const AssessmentsPage: React.FC<Props> = ({
  assessments,
  currentUserProfile,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Form states
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [date, setDate] = useState(todayStr);
  const [location, setLocation] = useState('');
  const [needType, setNeedType] = useState('Bantuan Air Bersih / Sumur Bor');
  const [problemDescription, setProblemDescription] = useState('');
  const [sourceOfInformation, setSourceOfInformation] = useState('');
  const [targetCount, setTargetCount] = useState<number>(50);
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(25000000);
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);

  const handleOpenCreate = () => {
    setAssessmentToEdit(null);
    setDate(todayStr);
    setLocation('');
    setNeedType('Bantuan Air Bersih / Sumur Bor');
    setProblemDescription('');
    setSourceOfInformation('');
    setTargetCount(50);
    setEligibilityCriteria('');
    setEstimatedCost(0);
    setRecommendations('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (asm: Assessment) => {
    setAssessmentToEdit(asm);
    setDate(asm.date);
    setLocation(asm.location);
    setNeedType(asm.needType);
    setProblemDescription(asm.problemDescription);
    setSourceOfInformation(asm.sourceOfInformation || '');
    setTargetCount(asm.targetCount);
    setEligibilityCriteria(asm.eligibilityCriteria);
    setEstimatedCost(asm.estimatedCost);
    setRecommendations(asm.recommendations);
    setSelectedAssessment(null);
    setShowFormModal(true);
  };

  const handleDelete = async (assessmentId: string) => {
    const confirm = window.confirm('Apakah Anda yakin ingin menghapus assessment lapangan ini? Tindakan ini permanen.');
    if (!confirm) return;
    try {
      await deleteAssessment(assessmentId);
      setSelectedAssessment(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus assessment');
    }
  };

  // Convert to campaign states
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignProgramType, setCampaignProgramType] = useState('AIR_BERSIH');
  const [campaignDeadline, setCampaignDeadline] = useState(todayStr);

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (assessmentToEdit) {
        await updateAssessment(assessmentToEdit.id, {
          date,
          location,
          needType,
          problemDescription,
          sourceOfInformation,
          targetCount: Number(targetCount),
          eligibilityCriteria,
          estimatedCost: Number(estimatedCost),
          recommendations,
        });
      } else {
        await createAssessment({
          date,
          assessorId: currentUserProfile?.uid || 'ASSESSOR',
          assessorName: currentUserProfile?.fullName || 'Assessor Lapangan YIUT',
          location,
          needType,
          problemDescription,
          sourceOfInformation,
          targetCount: Number(targetCount),
          eligibilityCriteria,
          estimatedCost: Number(estimatedCost),
          recommendations,
          status: 'MENUNGGU_VERIFIKASI',
        });
      }
      onRefresh();
      setShowFormModal(false);
      setAssessmentToEdit(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: AssessmentStatus) => {
    try {
      await updateAssessmentStatus(id, status);
      onRefresh();
      if (selectedAssessment) {
        setSelectedAssessment({ ...selectedAssessment, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setLoading(true);
    try {
      await convertAssessmentToCampaign(
        selectedAssessment,
        campaignTitle || `Program ${selectedAssessment.needType} - ${selectedAssessment.location}`,
        campaignProgramType,
        selectedAssessment.estimatedCost,
        currentUserProfile?.uid || 'PROGRAM',
        currentUserProfile?.fullName || 'Divisi Program',
        currentUserProfile?.uid || 'FUNDRAISING',
        currentUserProfile?.fullName || 'Divisi Fundraising',
        campaignDeadline
      );
      onRefresh();
      setShowConvertModal(false);
      setSelectedAssessment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assessments.filter(
    (a) =>
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.needType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assessmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assessorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#173D32]" />
            <span>Assessment & Verifikasi Mustahik Lapangan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Survei kelayakan penerima manfaat dengan perlindungan privasi data pribadi dhuafa
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Form Assessment Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari lokasi, jenis kebutuhan, ID assessment, atau nama assessor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>
      </div>

      {/* Grid of Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asm) => (
          <div
            key={asm.id}
            onClick={() => setSelectedAssessment(asm)}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{asm.assessmentId}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={asm.status} />
                  <div className="flex items-center gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(asm)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Assessment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(asm.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                {asm.needType}
              </h4>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{asm.location}</span>
              </div>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {asm.problemDescription}
              </p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Target Mustahik:</span>
                  <span className="font-bold text-slate-800">{asm.targetCount} Jiwa/KK</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimasi Biaya:</span>
                  <span className="font-bold font-mono text-emerald-800">{formatIDR(asm.estimatedCost)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Assessor: {asm.assessorName}</span>
              <span>{formatDateID(asm.date)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Detail & Convert Modal */}
      {selectedAssessment && (
        <Modal
          isOpen={!!selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          title={`Detail Assessment: ${selectedAssessment.assessmentId}`}
          subtitle={`Tanggal Survei: ${formatDateID(selectedAssessment.date)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">{selectedAssessment.needType}</span>
              <StatusBadge status={selectedAssessment.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lokasi</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedAssessment.location}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Sumber Informasi</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedAssessment.sourceOfInformation || '-'}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Deskripsi Kondisi & Masalah:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedAssessment.problemDescription}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Kriteria Kelayakan Mustahik:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {selectedAssessment.eligibilityCriteria}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Rekomendasi Tindak Lanjut:</span>
              <p className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 leading-relaxed">
                {selectedAssessment.recommendations}
              </p>
            </div>

            {/* Actions for Leaders */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-tight text-[11px]">
                  Kelola Assessment & Tindakan
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(selectedAssessment)}
                    className="px-2.5 py-1 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Data</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedAssessment.id)}
                    className="px-2.5 py-1 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {isLeaderOrAdmin && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedAssessment.id, 'DISETUJUI')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Assessment</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAssessment.id, 'DITOLAK')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  {selectedAssessment.status === 'DISETUJUI' && !selectedAssessment.linkedCampaignId && (
                    <button
                      onClick={() => {
                        setCampaignTitle(`Program ${selectedAssessment.needType} - ${selectedAssessment.location}`);
                        setShowConvertModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Konversi Menjadi Campaign Baru</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Form Assessment Modal */}
      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setAssessmentToEdit(null);
          }}
          title={assessmentToEdit ? 'Edit Data Assessment Lapangan' : 'Formulir Assessment Calon Penerima Manfaat'}
          subtitle={assessmentToEdit ? `ID: ${assessmentToEdit.assessmentId}` : 'Catat temuan survei kelayakan lapangan secara sistematis'}
          maxWidth="2xl"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Assessment</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Survei</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dusun, Desa, Kecamatan, Kab/Kota"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kebutuhan</label>
                <input
                  type="text"
                  required
                  value={needType}
                  onChange={(e) => setNeedType(e.target.value)}
                  placeholder="Contoh: Sumur Bor Air Bersih / Bantuan Pangan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Informasi Awal</label>
                <input
                  type="text"
                  value={sourceOfInformation}
                  onChange={(e) => setSourceOfInformation(e.target.value)}
                  placeholder="Aparatur Desa / Relawan Lapangan / Tokoh Agama"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deskripsi Kondisi & Masalah</label>
              <textarea
                rows={3}
                required
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Uraikan kondisi riil masalah, kesulitan warga, dan tingkat kedaruratan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Jumlah Mustahik (Jiwa/KK)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimasi Kebutuhan Biaya (Rupiah)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kriteria Kelayakan Penerima Manfaat</label>
              <textarea
                rows={2}
                value={eligibilityCriteria}
                onChange={(e) => setEligibilityCriteria(e.target.value)}
                placeholder="Penghasilan di bawah rata-rata, lansia sebatang kara, rumah tidak layak huni..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rekomendasi Solusi Tim Lapangan</label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Rekomendasi teknis atau intervensi program yang tepat..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowFormModal(false);
                  setAssessmentToEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white rounded-xl font-bold transition"
              >
                {loading ? 'Menyimpan...' : assessmentToEdit ? 'Simpan Perubahan' : 'Simpan Assessment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Convert to Campaign Modal */}
      {showConvertModal && selectedAssessment && (
        <Modal
          isOpen={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          title="Konversi Assessment Menjadi Campaign Baru"
          subtitle="Otomatis mentransfer data hasil verifikasi menjadi proyek penghimpunan"
          maxWidth="md"
        >
          <form onSubmit={handleConvertToCampaign} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Campaign Baru</label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilar Program Utama</label>
              <select
                value={campaignProgramType}
                onChange={(e) => setCampaignProgramType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="AIR_BERSIH">AIR BERSIH</option>
                <option value="PENDIDIKAN">PENDIDIKAN</option>
                <option value="KESEHATAN">KESEHATAN</option>
                <option value="PANGAN">PANGAN</option>
                <option value="ZAKAT">ZAKAT</option>
                <option value="PEMBERDAYAAN">PEMBERDAYAAN</option>
                <option value="EMERGENCY">EMERGENCY</option>
                <option value="RAMADHAN">RAMADHAN</option>
                <option value="QURBAN">QURBAN</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Batas Waktu (Deadline)</label>
              <input
                type="date"
                required
                value={campaignDeadline}
                onChange={(e) => setCampaignDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <span className="font-bold block">Target Dana:</span>
              <span className="font-mono text-sm font-bold text-emerald-800">
                {formatIDR(selectedAssessment.estimatedCost)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                {loading ? 'Memproses...' : 'Luncurkan Campaign'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
