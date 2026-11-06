import React, { useState, useEffect } from 'react';
import { Meeting, Decision, UserProfile } from '../types';
import {
  subscribeMeetings,
  subscribeDecisions,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  updateDecision,
  deleteDecision,
  convertDecisionToTask,
} from '../services/meetingService';
import { formatDateID } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  UsersRound,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowRight,
  FileText,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  onRefreshTasks: () => void;
}

export const MeetingsPage: React.FC<Props> = ({ users, currentUserProfile, onRefreshTasks }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form states
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [leaderName, setLeaderName] = useState(currentUserProfile?.fullName || 'Pimpinan Rapat');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [decisionTopic, setDecisionTopic] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [decisionPicId, setDecisionPicId] = useState('');
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubM = subscribeMeetings(setMeetings);
    const unsubD = subscribeDecisions(setDecisions);
    return () => {
      unsubM();
      unsubD();
    };
  }, []);

  const handleOpenCreate = () => {
    setMeetingToEdit(null);
    setTitle('');
    setDate(todayStr);
    setLeaderName(currentUserProfile?.fullName || 'Pimpinan Rapat');
    setAgenda('');
    setNotes('');
    setDecisionTopic('');
    setDecisionText('');
    setDecisionPicId('');
    setShowMeetingModal(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setMeetingToEdit(m);
    setTitle(m.title);
    setDate(m.date);
    setLeaderName(m.leaderName);
    setAgenda(m.agenda);
    setNotes(m.notes);
    setDecisionTopic('');
    setDecisionText('');
    setDecisionPicId('');
    setSelectedMeeting(null);
    setShowMeetingModal(true);
  };

  const handleDeleteMeeting = async (mId: string) => {
    const confirm = window.confirm('Apakah Anda yakin ingin menghapus notulensi rapat ini?');
    if (!confirm) return;
    try {
      await deleteMeeting(mId);
      setSelectedMeeting(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus notulensi');
    }
  };

  const handleDeleteDecision = async (decId: string) => {
    const confirm = window.confirm('Apakah Anda yakin ingin menghapus keputusan ini?');
    if (!confirm) return;
    try {
      await deleteDecision(decId);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus keputusan');
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const picUser = users.find((u) => u.uid === decisionPicId);

    try {
      if (meetingToEdit) {
        await updateMeeting(meetingToEdit.id, {
          title: title.trim(),
          date,
          leaderName,
          agenda: agenda.trim(),
          notes: notes.trim(),
        });
      } else {
        await createMeeting(
          {
            title: title.trim(),
            date,
            leaderName,
            attendees: [leaderName],
            agenda: agenda.trim(),
            notes: notes.trim(),
          },
          decisionTopic.trim()
            ? [
                {
                  topic: decisionTopic.trim(),
                  decisionText: decisionText.trim() || decisionTopic.trim(),
                  picId: decisionPicId,
                  picName: picUser?.fullName,
                  deadline: date,
                },
              ]
            : undefined
        );
      }

      setShowMeetingModal(false);
      setMeetingToEdit(null);
      setTitle('');
      setAgenda('');
      setNotes('');
      setDecisionTopic('');
      setDecisionText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async (decision: Decision) => {
    setConvertingId(decision.id);
    const picUser = users.find((u) => u.uid === decision.picId) || users[0];
    try {
      await convertDecisionToTask(
        decision,
        picUser?.department || 'KOORDINATOR_OPERASIONAL',
        decision.picId || picUser?.uid || 'ADMIN',
        decision.picName || picUser?.fullName || 'PIC Rapat'
      );
      onRefreshTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-[#173D32]" />
            <span>Sistem Notulensi Rapat & Keputusan Eksekutif</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap keputusan rapat memiliki penanggung jawab (PIC) dan dapat dikonversi langsung menjadi tugas operasional
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Notulensi Rapat</span>
        </button>
      </div>

      {/* Decisions List: Core Action Engine */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Daftar Keputusan Rapat & Tindak Lanjut ({decisions.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Konversi ke tugas agar langsung dikerjakan staf</span>
        </div>

        <div className="divide-y divide-slate-100">
          {decisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada keputusan rapat yang tercatat.
            </div>
          ) : (
            decisions.map((dec) => (
              <div key={dec.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{dec.decisionId}</span>
                    <span className="font-bold text-slate-900 text-xs">{dec.topic}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        dec.status === 'SELESAI'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : dec.status === 'PROSES'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {dec.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{dec.decisionText}</p>
                  <p className="text-[11px] text-slate-400">
                    PIC: <span className="font-medium text-slate-700">{dec.picName || 'Belum Ditentukan'}</span> &bull; Tenggat: {formatDateID(dec.deadline)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {dec.convertedTaskId ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Telah Jadi Tugas ({dec.convertedTaskId})</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvert(dec)}
                      disabled={convertingId === dec.id}
                      className="px-3 py-1.5 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{convertingId === dec.id ? 'Mengonversi...' : 'Konversi Jadi Tugas'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDecision(dec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus Keputusan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Meetings Archive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMeeting(m)}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{m.meetingId}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{formatDateID(m.date)}</span>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Notulensi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Notulensi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{m.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{m.agenda}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Dipimpin oleh: <span className="font-medium text-slate-800">{m.leaderName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          title={selectedMeeting.title}
          subtitle={`Tanggal: ${formatDateID(selectedMeeting.date)} • Pimpinan: ${selectedMeeting.leaderName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700">Tindakan Notulensi:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedMeeting)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Agenda Pembahasan:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedMeeting.agenda}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">Catatan & Arahan Rapat:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedMeeting.notes}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Meeting Modal */}
      {showMeetingModal && (
        <Modal
          isOpen={showMeetingModal}
          onClose={() => {
            setShowMeetingModal(false);
            setMeetingToEdit(null);
          }}
          title={meetingToEdit ? 'Edit Notulensi Rapat' : 'Notulensi Rapat & Keputusan Baru'}
          subtitle={meetingToEdit ? `ID: ${meetingToEdit.meetingId}` : 'Dokumentasikan hasil rapat dan hasil keputusan strategis'}
          maxWidth="md"
        >
          <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Topik / Nama Rapat *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rapat Koordinasi Penyerapan Dana Qurban"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Rapat</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pimpinan Rapat</label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Agenda Pokok Bahasan</label>
              <textarea
                rows={2}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Poin-poin bahasan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notulensi / Ringkasan Diskusi</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hasil diskusi, masukan divisi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Decision Line (only when creating) */}
            {!meetingToEdit && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-950 block">Keputusan yang Harus Ditindaklanjuti:</span>
                <input
                  type="text"
                  value={decisionTopic}
                  onChange={(e) => setDecisionTopic(e.target.value)}
                  placeholder="Poin keputusan utama..."
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
                <select
                  value={decisionPicId}
                  onChange={(e) => setDecisionPicId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                >
                  <option value="">-- Tetapkan PIC Penanggung Jawab --</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullName} ({u.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowMeetingModal(false);
                  setMeetingToEdit(null);
                }}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                {meetingToEdit ? 'Simpan Perubahan' : 'Simpan Notulensi'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
