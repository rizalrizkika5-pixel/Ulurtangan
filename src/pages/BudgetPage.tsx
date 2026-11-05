import React, { useState, useEffect } from 'react';
import { Budget, Expenditure, Campaign, UserProfile } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { subscribeBudgets, subscribeExpenditures, createBudget, createExpenditure, approveExpenditure } from '../services/budgetService';
import { Modal } from '../components/common/Modal';
import {
  FileSpreadsheet,
  Plus,
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface Props {
  campaigns: Campaign[];
  currentUserProfile: UserProfile | null;
}

export const BudgetPage: React.FC<Props> = ({ campaigns, currentUserProfile }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  // Budget form states
  const [campaignId, setCampaignId] = useState('');
  const [budgetCode, setBudgetCode] = useState('POS-01');
  const [category, setCategory] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(10000000);

  // Expenditure form states
  const [expBudgetId, setExpBudgetId] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(1000000);
  const [expProofUrl, setExpProofUrl] = useState('');

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  useEffect(() => {
    const unsubB = subscribeBudgets(setBudgets);
    const unsubE = subscribeExpenditures(setExpenditures);
    return () => {
      unsubB();
      unsubE();
    };
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !campaignId) return;
    const selCamp = campaigns.find((c) => c.id === campaignId);

    try {
      await createBudget({
        campaignId,
        campaignTitle: selCamp?.title,
        budgetCode,
        category: category.trim(),
        approvedAmount: Number(approvedAmount),
        picId: currentUserProfile?.uid || 'ADMIN',
        picName: currentUserProfile?.fullName || 'Pengelola Anggaran',
        status: 'DISETUJUI',
      });
      setShowBudgetModal(false);
      setCategory('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim() || !expBudgetId) return;
    const selBudget = budgets.find((b) => b.id === expBudgetId);

    try {
      await createExpenditure({
        budgetId: expBudgetId,
        campaignId: selBudget?.campaignId || '',
        description: expDescription.trim(),
        amount: Number(expAmount),
        date: new Date().toISOString().split('T')[0],
        proofUrl: expProofUrl.trim() || undefined,
        spenderId: currentUserProfile?.uid || 'SPENDER',
        spenderName: currentUserProfile?.fullName || 'Staf Lapangan',
      });
      setShowExpModal(false);
      setExpDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveExp = async (expId: string, approved: boolean) => {
    try {
      await approveExpenditure(expId, approved);
    } catch (err) {
      console.error(err);
    }
  };

  const totalApproved = budgets.reduce((acc, b) => acc + (b.approvedAmount || 0), 0);
  const totalRealized = budgets.reduce((acc, b) => acc + (b.realizedAmount || 0), 0);
  const totalVariance = totalApproved - totalRealized;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#173D32]" />
            <span>Manajemen Anggaran Belanja (RAB vs Realisasi)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akuntabilitas alokasi pos anggaran, realisasi pengeluaran, dan persentase serapan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            + Ajukan Pengeluaran
          </button>
          {isLeaderOrAdmin && (
            <button
              onClick={() => setShowBudgetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pos Anggaran</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Budget Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Anggaran Disetujui</span>
          <h4 className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatIDR(totalApproved)}
          </h4>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Realisasi Belanja</span>
          <h4 className="text-xl font-bold text-emerald-800 font-mono mt-1">
            {formatIDR(totalRealized)}
          </h4>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Sisa Saldo Anggaran (Selisih)</span>
          <h4 className="text-xl font-bold text-amber-700 font-mono mt-1">
            {formatIDR(totalVariance)}
          </h4>
        </div>
      </div>

      {/* Budget Lines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">
            Pos-Pos Anggaran Kegiatan & Indikator Serapan
          </h3>
          <span className="text-xs text-slate-400">{budgets.length} Pos Alokasi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F4F7F5] border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode & Pos Anggaran</th>
                <th className="py-3 px-4">Campaign Terkait</th>
                <th className="py-3 px-4">Anggaran Disetujui</th>
                <th className="py-3 px-4">Realisasi</th>
                <th className="py-3 px-4">Selisih</th>
                <th className="py-3 px-4">Serapan %</th>
                <th className="py-3 px-4 text-center">Status Indikator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Belum ada pos anggaran yang dibuat.
                  </td>
                </tr>
              ) : (
                budgets.map((b) => {
                  const selisih = b.approvedAmount - (b.realizedAmount || 0);
                  const percent =
                    b.approvedAmount > 0
                      ? Math.round(((b.realizedAmount || 0) / b.approvedAmount) * 100)
                      : 0;

                  // Indicator rule:
                  // <= 80%: Sesuai Anggaran (Hijau)
                  // 81-100%: Mendekati Batas (Kuning)
                  // > 100%: Melebihi Anggaran (Merah)
                  const isOver = percent > 100;
                  const isNear = percent > 80 && percent <= 100;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-slate-400 font-bold block">
                          {b.budgetCode}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{b.category}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{b.campaignTitle || '-'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatIDR(b.approvedAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {formatIDR(b.realizedAmount || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {formatIDR(selisih)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">{percent}%</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isOver
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isNear
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isOver
                            ? 'Melebihi Anggaran'
                            : isNear
                            ? 'Mendekati Batas'
                            : 'Sesuai Anggaran'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Realized Expenditures Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">
            Pengajuan & Bukti Realisasi Biaya ({expenditures.length})
          </h3>
          <span className="text-xs text-slate-500">Wajib disertai bukti transaksi / nota SPJ</span>
        </div>

        <div className="divide-y divide-slate-100">
          {expenditures.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Belum ada riwayat pengeluaran yang diajukan.
            </div>
          ) : (
            expenditures.map((exp) => (
              <div key={exp.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{exp.expenditureId}</span>
                    <span className="font-bold text-slate-900">{exp.description}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Oleh: {exp.spenderName} &bull; {formatDateID(exp.date)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatIDR(exp.amount)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      exp.status === 'DISETUJUI'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : exp.status === 'DITOLAK'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {exp.status.replace(/_/g, ' ')}
                  </span>

                  {isLeaderOrAdmin && exp.status === 'MENUNGGU_PERSETUJUAN' && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => handleApproveExp(exp.id, true)}
                        className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                        title="Setujui Pengeluaran"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApproveExp(exp.id, false)}
                        className="p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white"
                        title="Tolak Pengeluaran"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Budget Modal */}
      {showBudgetModal && (
        <Modal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          title="Tambah Pos Anggaran Kegiatan"
          subtitle="Tentukan plafon anggaran yang disetujui untuk pos belanja"
          maxWidth="md"
        >
          <form onSubmit={handleCreateBudget} className="space-y-3 text-xs">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Pos Anggaran</label>
                <input
                  type="text"
                  value={budgetCode}
                  onChange={(e) => setBudgetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Anggaran Disetujui (Rupiah) *</label>
                <input
                  type="number"
                  min="100000"
                  step="500000"
                  required
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pos / Rincian Belanja *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Pembelian Mesin Pompa & Pipa Submersible"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                Simpan Pos Anggaran
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Log Expenditure Modal */}
      {showExpModal && (
        <Modal
          isOpen={showExpModal}
          onClose={() => setShowExpModal(false)}
          title="Ajukan Realisasi Pengeluaran"
          subtitle="Catat pengeluaran riil belanja kegiatan beserta bukti SPJ"
          maxWidth="md"
        >
          <form onSubmit={handleCreateExp} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Pos Anggaran *</label>
              <select
                required
                value={expBudgetId}
                onChange={(e) => setExpBudgetId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">-- Pilih Pos Anggaran --</option>
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.budgetCode}: {b.category} ({b.campaignTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Biaya Riil (Rupiah) *</label>
              <input
                type="number"
                min="1000"
                step="50000"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deskripsi Pengeluaran *</label>
              <textarea
                rows={2}
                required
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                placeholder="Rincian pembelian material, transportasi armada, sewa alat..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Link Bukti / Nota (Google Drive)</label>
              <input
                type="url"
                value={expProofUrl}
                onChange={(e) => setExpProofUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                Ajukan Pengeluaran
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
