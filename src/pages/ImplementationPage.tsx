import React, { useState, useEffect } from 'react';
import { Implementation, Campaign, UserProfile } from '../types';
import { subscribeImplementations, createImplementation, updateImplementation } from '../services/implementationService';
import { Modal } from '../components/common/Modal';
import { formatIDR, formatDateID } from '../utils/formatters';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  MapPin,
  Users,
  CheckSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Props {
  campaigns: Campaign[];
  currentUserProfile: UserProfile | null;
}

export const ImplementationPage: React.FC<Props> = ({ campaigns, currentUserProfile }) => {
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Implementation | null>(null);

  // Form states
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [campaignId, setCampaignId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [location, setLocation] = useState('');
  const [partner, setPartner] = useState('');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState<number>(100);
  const [budgetApproved, setBudgetApproved] = useState<number>(15000000);
  const [outputSummary, setOutputSummary] = useState('');

  useEffect(() => {
    const unsub = subscribeImplementations(setImplementations);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !campaignId) return;
    const selCamp = campaigns.find((c) => c.id === campaignId);

    try {
      await createImplementation({
        campaignId,
        campaignTitle: selCamp?.title,
        activityTitle: activityTitle.trim(),
        date,
        location: location.trim(),
        partner: partner.trim() || undefined,
        fieldPicName: currentUserProfile?.fullName || 'PIC Lapangan',
        targetBeneficiaries: Number(targetBeneficiaries),
        actualBeneficiaries: 0,
        budgetApproved: Number(budgetApproved),
        actualCost: 0,
        outputSummary: outputSummary.trim(),
        preChecklist: {
          proposalApproved: true,
          fundsReady: true,
          partnerVerified: true,
          locationReady: true,
          beneficiariesVerified: true,
          teamReady: true,
          documentationPrepared: true,
        },
        postChecklist: {
          activityExecuted: false,
          beneficiariesRecorded: false,
          handoverProofAvailable: false,
          documentationComplete: false,
          actualCostsLogged: false,
          reportFinished: false,
        },
        status: 'PERSIAPAN',
      });
      setShowCreateModal(false);
      setActivityTitle('');
      setLocation('');
      setOutputSummary('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleChecklist = async (
    impId: string,
    type: 'pre' | 'post',
    key: string,
    currentValue: boolean
  ) => {
    const current = implementations.find((i) => i.id === impId);
    if (!current) return;

    const updatedPre = { ...current.preChecklist };
    const updatedPost = { ...current.postChecklist };

    if (type === 'pre') {
      (updatedPre as any)[key] = !currentValue;
    } else {
      (updatedPost as any)[key] = !currentValue;
    }

    try {
      await updateImplementation(impId, {
        preChecklist: updatedPre,
        postChecklist: updatedPost,
      });
      if (selectedItem && selectedItem.id === impId) {
        setSelectedItem({
          ...selectedItem,
          preChecklist: updatedPre,
          postChecklist: updatedPost,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#173D32]" />
            <span>Pelaksanaan Lapangan & Kontrol Mutu Kegiatan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring kesiapan sebelum aksi (Pre-Checklist) dan pertanggungjawaban paska kegiatan (Post-Checklist)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Rencana Pelaksanaan Baru</span>
        </button>
      </div>

      {/* Grid of Implementations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {implementations.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-700">Belum ada agenda pelaksanaan lapangan</p>
            <p className="text-xs text-slate-400 mt-1">Buat rencana pelaksanaan kegiatan menggunakan tombol di atas.</p>
          </div>
        ) : (
          implementations.map((imp) => {
            const prePassed = Object.values(imp.preChecklist).filter(Boolean).length;
            const postPassed = Object.values(imp.postChecklist).filter(Boolean).length;

            return (
              <div
                key={imp.id}
                onClick={() => setSelectedItem(imp)}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{imp.implementationId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {imp.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {imp.activityTitle}
                  </h3>

                  <p className="text-[11px] text-emerald-800 font-medium mt-1 truncate">
                    {imp.campaignTitle}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{imp.location}</span>
                  </div>

                  {/* Checklist Summary */}
                  <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Pra-Aksi (Kesiapan):</span>
                      <span className="font-bold font-mono text-emerald-800">{prePassed} / 7 Lolos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Pasca-Aksi (Pelaporan):</span>
                      <span className="font-bold font-mono text-slate-700">{postPassed} / 6 Selesai</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>PIC: {imp.fieldPicName}</span>
                  <span>{formatDateID(imp.date)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checklist & Implementation Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Audit Lapangan: ${selectedItem.activityTitle}`}
          subtitle={`Tanggal: ${formatDateID(selectedItem.date)} • Lokasi: ${selectedItem.location}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Output Summary */}
            {selectedItem.outputSummary && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Rencana Output:</span>
                <p className="text-slate-700 leading-relaxed">{selectedItem.outputSummary}</p>
              </div>
            )}

            {/* Checklist Sebelum Implementasi */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2.5">
              <h4 className="font-bold text-[#173D32] uppercase tracking-tight flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <span>Checklist Sebelum Implementasi (Pra-Aksi)</span>
              </h4>
              <div className="space-y-1.5">
                {[
                  { key: 'proposalApproved', label: 'Proposal & RAB Telah Disetujui Pimpinan' },
                  { key: 'fundsReady', label: 'Dana Tersedia Sesuai Peruntukan Syar\'i' },
                  { key: 'partnerVerified', label: 'Mitra Lapangan & Vendor Terverifikasi' },
                  { key: 'locationReady', label: 'Lokasi dan Perizinan Lingkungan Siap' },
                  { key: 'beneficiariesVerified', label: 'Daftar Calon Penerima Manfaat Terverifikasi' },
                  { key: 'teamReady', label: 'Tim Operasional & Relawan Siap Berangkat' },
                  { key: 'documentationPrepared', label: 'Alat & Standar Dokumentasi Disiapkan' },
                ].map((item) => {
                  const checked = (selectedItem.preChecklist as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-emerald-50/30 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleToggleChecklist(selectedItem.id, 'pre', item.key, checked)
                        }
                        className="accent-[#173D32] rounded"
                      />
                      <span className={checked ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Checklist Setelah Implementasi */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-slate-700" />
                <span>Checklist Setelah Implementasi (Pasca-Aksi & LPJ)</span>
              </h4>
              <div className="space-y-1.5">
                {[
                  { key: 'activityExecuted', label: 'Kegiatan Terlaksana Sesuai Rencana' },
                  { key: 'beneficiariesRecorded', label: 'Daftar Hadir / Penerima Manfaat Tercatat' },
                  { key: 'handoverProofAvailable', label: 'Berita Acara Serah Terima (BAST) Tersedia' },
                  { key: 'documentationComplete', label: 'Dokumentasi Foto & Video Resolusi Tinggi Lengkap' },
                  { key: 'actualCostsLogged', label: 'Realisasi Biaya & Nota SPJ Telah Diunggah' },
                  { key: 'reportFinished', label: 'Laporan Pertanggungjawaban (LPJ) Selesai Disusun' },
                ].map((item) => {
                  const checked = (selectedItem.postChecklist as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleToggleChecklist(selectedItem.id, 'post', item.key, checked)
                        }
                        className="accent-[#173D32] rounded"
                      />
                      <span className={checked ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Rencana Pelaksanaan Lapangan Baru"
          subtitle="Jadwalkan kegiatan operasional dan siapkan checklist mutu"
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Campaign Program *</label>
              <select
                required
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">-- Pilih Campaign --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama / Judul Kegiatan *</label>
              <input
                type="text"
                required
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="Contoh: Pengeboran & Pemasangan Pipa Tahap 1"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Titik Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dusun / Desa, Kab"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Mustahik</label>
                <input
                  type="number"
                  min="1"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mitra Lapangan / Vendor</label>
                <input
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="Dinas / Pemdes / Tukang"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ringkasan Output Kegiatan</label>
              <textarea
                rows={2}
                value={outputSummary}
                onChange={(e) => setOutputSummary(e.target.value)}
                placeholder="Target capaian fisik atau penerima manfaat..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                Simpan Agenda
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
