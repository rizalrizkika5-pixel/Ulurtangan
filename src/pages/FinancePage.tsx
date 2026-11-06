import React, { useState } from 'react';
import { Donation, FundType, DonationStatus, Campaign, Donor, UserProfile } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { createDonation, verifyDonation, updateDonation, deleteDonation } from '../services/donationService';
import { Modal } from '../components/common/Modal';
import {
  Coins,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  donations: Donation[];
  campaigns: Campaign[];
  donors: Donor[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const FinancePage: React.FC<Props> = ({
  donations,
  campaigns,
  donors,
  currentUserProfile,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fundFilter, setFundFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Form states
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [donationToEdit, setDonationToEdit] = useState<Donation | null>(null);
  const [date, setDate] = useState(todayStr);
  const [donorId, setDonorId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [fundType, setFundType] = useState<FundType>('INFAK');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank Syariah (BSI)');
  const [amount, setAmount] = useState<number>(500000);
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification states
  const [verifyNotes, setVerifyNotes] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);

  const canVerify =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  const handleOpenCreate = () => {
    setDonationToEdit(null);
    setDate(todayStr);
    setDonorId('');
    setCampaignId('');
    setFundType('INFAK');
    setPaymentMethod('Transfer Bank Syariah (BSI)');
    setAmount(0);
    setProofUrl('');
    setNotes('');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (d: Donation) => {
    setDonationToEdit(d);
    setDate(d.date);
    setDonorId(d.donorId === 'ANONYMOUS' ? '' : d.donorId);
    setCampaignId(d.campaignId || '');
    setFundType(d.fundType);
    setPaymentMethod(d.paymentMethod);
    setAmount(d.amount);
    setProofUrl(d.proofUrl || '');
    setNotes(d.notes || '');
    setSelectedDonation(null);
    setShowCreateModal(true);
  };

  const handleDelete = async (donationId: string) => {
    const confirm = window.confirm(
      'Apakah Anda yakin ingin menghapus transaksi ini? Jika transaksi sudah diverifikasi, saldo campaign dan donatur akan disesuaikan otomatis.'
    );
    if (!confirm) return;
    try {
      await deleteDonation(donationId);
      onRefresh();
      setSelectedDonation(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus donasi');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 0) return;
    setLoading(true);

    const selDonor = donors.find((d) => d.id === donorId);
    const selCampaign = campaigns.find((c) => c.id === campaignId);

    try {
      if (donationToEdit) {
        await updateDonation(donationToEdit.id, {
          date,
          donorId: donorId || 'ANONYMOUS',
          donorName: selDonor?.name || 'Hamba Allah (Anonim)',
          campaignId: campaignId || undefined,
          campaignTitle: selCampaign?.title || undefined,
          fundType,
          paymentMethod,
          amount: Number(amount),
          proofUrl: proofUrl.trim() || undefined,
          notes: notes.trim(),
        });
      } else {
        await createDonation({
          date,
          donorId: donorId || 'ANONYMOUS',
          donorName: selDonor?.name || 'Hamba Allah (Anonim)',
          campaignId: campaignId || undefined,
          campaignTitle: selCampaign?.title || undefined,
          fundType,
          paymentMethod,
          amount: Number(amount),
          proofUrl: proofUrl.trim() || undefined,
          recorderId: currentUserProfile?.uid || 'RECORDER',
          recorderName: currentUserProfile?.fullName || 'Admin CRM',
          notes: notes.trim(),
        });
      }
      onRefresh();
      setShowCreateModal(false);
      setDonationToEdit(null);
      setAmount(0);
      setNotes('');
      setProofUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approved: boolean) => {
    if (!selectedDonation) return;
    setLoadingVerify(true);
    try {
      await verifyDonation(
        selectedDonation.id,
        approved,
        verifyNotes.trim() || (approved ? 'Mutasi bank valid dan terverifikasi.' : 'Mutasi belum ditemukan.')
      );
      onRefresh();
      setSelectedDonation(null);
      setVerifyNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerify(false);
    }
  };

  const filtered = donations.filter((d) => {
    const matchSearch =
      d.donationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.campaignTitle && d.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchFund = fundFilter === 'ALL' || d.fundType === fundFilter;
    return matchSearch && matchStatus && matchFund;
  });

  const totalVerified = donations
    .filter((d) => d.status === 'TERVERIFIKASI')
    .reduce((acc, d) => acc + d.amount, 0);

  const pendingCount = donations.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#173D32]" />
            <span>Pencatatan & Verifikasi Transaksi Donasi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemisahan fungsi pencatatan (Admin CRM) dan verifikasi mutasi rekening (Pemeriksa / Pimpinan)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Donasi Masuk</span>
        </button>
      </div>

      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Terverifikasi</span>
          <h4 className="text-xl font-bold text-emerald-800 font-mono mt-1">
            {formatIDR(totalVerified)}
          </h4>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-amber-800 uppercase font-semibold">Menunggu Verifikasi</span>
          <h4 className="text-xl font-bold text-amber-700 font-mono mt-1">
            {pendingCount} Transaksi
          </h4>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Catatan</span>
          <h4 className="text-xl font-bold text-slate-800 font-mono mt-1">
            {donations.length} Transaksi
          </h4>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID transaksi, nama donatur, atau campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="DITOLAK">Ditolak</option>
          </select>

          <select
            value={fundFilter}
            onChange={(e) => setFundFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Semua Kategori Dana</option>
            <option value="ZAKAT">Zakat</option>
            <option value="INFAK">Infak</option>
            <option value="SEDEKAH">Sedekah</option>
            <option value="WAKAF">Wakaf</option>
            <option value="QURBAN">Qurban</option>
            <option value="DONASI_TERIKAT">Donasi Terikat</option>
            <option value="DONASI_UMUM">Donasi Umum</option>
          </select>
        </div>
      </div>

      {/* Table of Donations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F4F7F5] border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">ID & Tanggal</th>
                <th className="py-3 px-4">Donatur</th>
                <th className="py-3 px-4">Campaign Program</th>
                <th className="py-3 px-4">Kategori Dana</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi donasi yang tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDonation(d)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-900 block">{d.donationId}</span>
                      <span className="text-[10px] text-slate-400">{formatDateID(d.date)}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{d.donorName}</td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {d.campaignTitle || <span className="text-slate-400 italic">Sedekah Umum YIUT</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {d.fundType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-sm">
                      {formatIDR(d.amount)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">{d.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} type="donation" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedDonation(d)}
                          className="px-2 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(d)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail & Verification Modal */}
      {selectedDonation && (
        <Modal
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          title={`Transaksi Donasi: ${selectedDonation.donationId}`}
          subtitle={`Tanggal: ${formatDateID(selectedDonation.date)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-800 font-semibold uppercase">Nominal Transaksi</span>
              <h3 className="text-2xl font-black text-emerald-900 font-mono mt-1">
                {formatIDR(selectedDonation.amount)}
              </h3>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold text-[10px] border border-slate-200">
                  {selectedDonation.fundType}
                </span>
                <StatusBadge status={selectedDonation.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Donatur</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDonation.donorName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Metode Bayar</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedDonation.paymentMethod}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Peruntukan Campaign</span>
              <p className="font-semibold text-emerald-800 mt-0.5">
                {selectedDonation.campaignTitle || 'Sedekah / Donasi Umum Yayasan'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Dicatat oleh:</span>
                <span className="font-semibold text-slate-800">{selectedDonation.recorderName}</span>
              </div>
              {selectedDonation.verifierName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Diverifikasi oleh:</span>
                  <span className="font-semibold text-emerald-800">{selectedDonation.verifierName}</span>
                </div>
              )}
            </div>

            {selectedDonation.notes && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Catatan Transaksi:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 mt-1">
                  {selectedDonation.notes}
                </p>
              </div>
            )}

            {/* Edit / Delete quick action bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Revisi Data Transaksi:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedDonation)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedDonation.id)}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* Segregation of duties verification section */}
            {canVerify && selectedDonation.status === 'MENUNGGU_VERIFIKASI' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                <h4 className="font-bold text-amber-950 uppercase tracking-tight">
                  Pemeriksaan & Verifikasi Keuangan
                </h4>
                <textarea
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Catatan verifikasi mutasi rekening..."
                  className="w-full px-3 py-2 border border-amber-300 bg-white rounded-xl text-xs text-slate-800"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={loadingVerify}
                    onClick={() => handleVerify(false)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    disabled={loadingVerify}
                    onClick={() => handleVerify(true)}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verifikasi Sah</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record / Edit Donation Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setDonationToEdit(null);
          }}
          title={donationToEdit ? 'Edit Catatan Donasi' : 'Pencatatan Donasi Masuk'}
          subtitle={donationToEdit ? `ID: ${donationToEdit.donationId}` : 'Catat donasi yang masuk melalui rekening bank atau kas yayasan'}
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Donasi (IDR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Donatur</label>
              <select
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">-- Hamba Allah (Anonim / Belum Terdaftar) --</option>
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phoneNumber || 'Tanpa HP'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Peruntukan Campaign</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">-- Sedekah / Donasi Umum Yayasan --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.programType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis / Akad Dana</label>
                <select
                  value={fundType}
                  onChange={(e) => setFundType(e.target.value as FundType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="INFAK">Infak</option>
                  <option value="SEDEKAH">Sedekah</option>
                  <option value="ZAKAT">Zakat</option>
                  <option value="WAKAF">Wakaf</option>
                  <option value="QURBAN">Qurban</option>
                  <option value="DONASI_TERIKAT">Donasi Terikat</option>
                  <option value="DONASI_UMUM">Donasi Umum</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="Transfer Bank Syariah (BSI)">Transfer BSI YIUT</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="QRIS / Digital Payment">QRIS YIUT</option>
                  <option value="Tunai Langsung di Kantor">Tunai di Kantor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nomor referensi mutasi atau pesan khusus..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setDonationToEdit(null);
                }}
                className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl transition"
              >
                {loading ? 'Menyimpan...' : donationToEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
