import React, { useState, useEffect } from 'react';
import { KPI, UserProfile } from '../types';
import { subscribeKPIs, createKPI, updateKPI, deleteKPI } from '../services/kpiService';
import { Modal } from '../components/common/Modal';
import { Award, Plus, TrendingUp, CheckCircle, AlertTriangle, User, Edit2, Trash2 } from 'lucide-react';

interface Props {
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
}

export const KPIPage: React.FC<Props> = ({ users, currentUserProfile }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const currentMonthStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());

  const [kpiToEdit, setKpiToEdit] = useState<KPI | null>(null);
  const [userId, setUserId] = useState('');
  const [periodMonth, setPeriodMonth] = useState(currentMonthStr);
  const [score, setScore] = useState<number>(85);
  const [grade, setGrade] = useState<'SANGAT_BAIK' | 'BAIK' | 'PERLU_PERBAIKAN' | 'TIDAK_TERCAPAI'>('BAIK');
  const [evaluatorNotes, setEvaluatorNotes] = useState('');

  const isLeaderOrAdmin =
    currentUserProfile?.role === 'SUPER_ADMIN' ||
    currentUserProfile?.role === 'PIMPINAN' ||
    currentUserProfile?.role === 'KOORDINATOR_OPERASIONAL';

  useEffect(() => {
    const unsub = subscribeKPIs(setKpis);
    return () => unsub();
  }, []);

  const handleOpenCreate = () => {
    setKpiToEdit(null);
    setUserId(users[0]?.uid || '');
    setPeriodMonth(currentMonthStr);
    setScore(85);
    setGrade('BAIK');
    setEvaluatorNotes('');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (k: KPI) => {
    setKpiToEdit(k);
    setUserId(k.userId);
    setPeriodMonth(k.periodMonth);
    setScore(k.score);
    setGrade(k.grade);
    setEvaluatorNotes(k.evaluatorNotes || '');
    setShowCreateModal(true);
  };

  const handleDelete = async (kpiId: string) => {
    const confirm = window.confirm('Apakah Anda yakin ingin menghapus catatan evaluasi KPI ini?');
    if (!confirm) return;
    try {
      await deleteKPI(kpiId);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus KPI');
    }
  };

  const handleCreateKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const targetUser = users.find((u) => u.uid === userId);

    try {
      if (kpiToEdit) {
        await updateKPI(kpiToEdit.id, {
          userId,
          userName: targetUser?.fullName || 'Karyawan',
          department: targetUser?.department || 'DIVISI_PROGRAM',
          periodMonth,
          score: Number(score),
          grade,
          evaluatorNotes: evaluatorNotes.trim(),
        });
      } else {
        await createKPI({
          userId,
          userName: targetUser?.fullName || 'Karyawan',
          department: targetUser?.department || 'DIVISI_PROGRAM',
          periodMonth,
          targets: [
            { title: 'Ketepatan Waktu Penyelesaian Tugas', targetValue: 100, achievedValue: score, unit: '%' },
            { title: 'Kelengkapan Bukti & Pelaporan', targetValue: 100, achievedValue: score >= 80 ? 95 : 70, unit: '%' },
          ],
          score: Number(score),
          grade,
          evaluatorNotes: evaluatorNotes.trim(),
        });
      }
      setShowCreateModal(false);
      setKpiToEdit(null);
      setEvaluatorNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const getGradeBadge = (g: string) => {
    switch (g) {
      case 'SANGAT_BAIK':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'BAIK':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PERLU_PERBAIKAN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'TIDAK_TERCAPAI':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Key Performance Indicator (KPI) & Evaluasi Karyawan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengukuran produktivitas berbasis kualitas hasil kerja, ketepatan deadline, dan dampak sosial
          </p>
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Input Evaluasi KPI</span>
          </button>
        )}
      </div>

      {/* KPI Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-700">Belum ada evaluasi KPI tercatat</p>
            <p className="text-xs text-slate-400 mt-1">Pimpinan dapat memasukkan evaluasi kinerja berkala staf.</p>
          </div>
        ) : (
          kpis.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.userName}</h3>
                    <span className="text-[11px] text-slate-500">{item.department.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{item.periodMonth}</span>
                    {isLeaderOrAdmin && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                          title="Edit KPI"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus KPI"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Display */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Skor Kinerja</span>
                    <span className="text-2xl font-black font-mono text-[#173D32]">{item.score} / 100</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getGradeBadge(item.grade)}`}>
                    {item.grade.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Evaluator Notes */}
                {item.evaluatorNotes && (
                  <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-700 mt-3">
                    <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">Catatan Evaluator:</span>
                    <p className="italic leading-relaxed">{item.evaluatorNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input / Edit KPI Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setKpiToEdit(null);
          }}
          title={kpiToEdit ? 'Edit Evaluasi KPI Karyawan' : 'Input Evaluasi KPI Karyawan'}
          subtitle="Berikan evaluasi berkala untuk akuntabilitas dan pengembangan personel"
          maxWidth="md"
        >
          <form onSubmit={handleCreateKPI} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Karyawan *</label>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">-- Pilih Karyawan --</option>
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.fullName} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Periode Bulan</label>
                <input
                  type="month"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Skor (0-100)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={score}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setScore(val);
                    if (val >= 90) setGrade('SANGAT_BAIK');
                    else if (val >= 75) setGrade('BAIK');
                    else if (val >= 60) setGrade('PERLU_PERBAIKAN');
                    else setGrade('TIDAK_TERCAPAI');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Predikat Penilaian</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="SANGAT_BAIK">Sangat Baik</option>
                <option value="BAIK">Baik</option>
                <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                <option value="TIDAK_TERCAPAI">Tidak Tercapai</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan & Masukan Perbaikan</label>
              <textarea
                rows={3}
                value={evaluatorNotes}
                onChange={(e) => setEvaluatorNotes(e.target.value)}
                placeholder="Apresiasi pencapaian dan aspek yang perlu ditingkatkan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setKpiToEdit(null);
                }}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                {kpiToEdit ? 'Simpan Perubahan' : 'Simpan Penilaian'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
