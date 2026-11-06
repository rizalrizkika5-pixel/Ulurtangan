import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { createStaffAccount, toggleUserStatus, updateUserProfile, deleteUserAccount } from '../services/authService';
import { clearAllOperationalData } from '../services/seedService';
import { Modal } from '../components/common/Modal';
import { formatDateID } from '../utils/formatters';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Building,
  AlertCircle,
  Sparkles,
  Trash2,
  Edit3,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const UsersPage: React.FC<Props> = ({ users, currentUserProfile, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('DIVISI_PROGRAM');
  const [role, setRole] = useState<UserRole>('DIVISI_PROGRAM');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Operational Reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Edit User Profile state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('DIVISI_PROGRAM');
  const [editPhone, setEditPhone] = useState('');

  const isSuperAdmin = currentUserProfile?.role === 'SUPER_ADMIN';

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditDepartment(u.department);
    setEditRole(u.role);
    setEditPhone(u.phoneNumber || '');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      await updateUserProfile(editingUser.uid, {
        fullName: editFullName.trim(),
        department: editDepartment,
        role: editRole,
        phoneNumber: editPhone.trim(),
      });
      onRefresh();
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui profil pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (u.role === 'SUPER_ADMIN') {
      alert('Akun Super Admin utama tidak dapat dihapus.');
      return;
    }
    if (u.uid === currentUserProfile?.uid) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus akun "${u.fullName}" (@${u.username}) secara permanen? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirm) return;

    try {
      await deleteUserAccount(u.uid);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus akun pengguna');
    }
  };

  const handleResetAllData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmWord !== 'RESET') {
      alert('Ketik kata "RESET" untuk konfirmasi.');
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await clearAllOperationalData();
      setResetMessage(`✅ Berhasil! Sebanyak ${res.count} item data operasional telah dikosongkan. Sistem kini bersih di angka 0. Akun pengguna tetap aman.`);
      onRefresh();
      setTimeout(() => {
        setShowResetModal(false);
        setResetConfirmWord('');
        setResetMessage(null);
      }, 3000);
    } catch (err: any) {
      setResetMessage(`❌ Gagal mereset: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setResetLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 12) {
      setError('Password minimal 12 karakter sesuai standar keamanan YIUT.');
      return;
    }

    setLoading(true);
    try {
      await createStaffAccount(
        username.trim(),
        fullName.trim(),
        department,
        role,
        password,
        phoneNumber.trim()
      );
      setSuccess(`Akun untuk "${fullName}" (${username}) berhasil dibuat dengan aplikasi autentikasi sekunder.`);
      onRefresh();
      setTimeout(() => {
        setShowCreateModal(false);
        setUsername('');
        setFullName('');
        setPassword('');
        setPhoneNumber('');
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat akun staf');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('Akun Super Admin tidak dapat dinonaktifkan.');
      return;
    }
    const nextState = !user.isActive;
    const confirmMsg = nextState
      ? `Aktifkan kembali akun ${user.fullName}?`
      : `Nonaktifkan akun ${user.fullName}? Pengguna tidak akan bisa masuk ke sistem.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(user.uid, nextState);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserProfile(uid, { role: newRole });
      onRefresh();
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#173D32]" />
            <span>Manajemen Pengguna & Pengaturan Hak Akses (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun staf, aktivasi, dan pembagian kewenangan terstruktur Yayasan Indonesia Uluran Tangan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Operasional (0)</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Staf Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Architecture & Reset Notice */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Keamanan Autentikasi:</strong> Pembuatan akun menggunakan sesi sekunder terisolasi. Tombol <strong>Reset Data Operasional</strong> di atas memungkinkan Super Admin mengosongkan seluruh data operasional (tugas, kampanye, donasi, asesmen, dsb.) kembali ke angka 0 tanpa menghapus akun login staf.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan, username, atau divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F4F7F5] border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama & Username</th>
                <th className="py-3 px-4">Divisi / Jabatan</th>
                <th className="py-3 px-4">Hak Akses (Role)</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#173D32] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {u.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        <span className="font-mono text-[11px] text-slate-400">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{u.department.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#173D32] border border-emerald-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200"
                        >
                          Ubah Role
                        </button>
                      )}
                      {isSuperAdmin && u.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition border ${
                            u.isActive
                              ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                      {isSuperAdmin && u.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Ubah Role Hak Akses: ${selectedUser.fullName}`}
          subtitle={`Username: @${selectedUser.username}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Hak Akses Baru</label>
              <select
                value={selectedUser.role}
                onChange={(e) => handleChangeRole(selectedUser.uid, e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="PIMPINAN">PIMPINAN</option>
                <option value="KOORDINATOR_OPERASIONAL">KOORDINATOR OPERASIONAL</option>
                <option value="DIVISI_PROGRAM">DIVISI PROGRAM</option>
                <option value="DIVISI_FUNDRAISING">DIVISI FUNDRAISING</option>
                <option value="KONTEN_KREATOR_VIDEO">KONTEN KREATOR VIDEO</option>
                <option value="MEDIA_SOSIAL_WEBSITE">MEDIA SOSIAL & WEBSITE</option>
                <option value="ADMIN_CRM">ADMIN CRM</option>
                <option value="KARYAWAN_RELAWAN">KARYAWAN / RELAWAN</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Staff Profile Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Profil Karyawan: ${editingUser.fullName}`}
          subtitle={`Username: @${editingUser.username}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Karyawan *</label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Divisi</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="DIVISI_PROGRAM">Divisi Program</option>
                  <option value="DIVISI_FUNDRAISING">Divisi Fundraising</option>
                  <option value="KONTEN_KREATOR_VIDEO">Konten Kreator Video</option>
                  <option value="MEDIA_SOSIAL_WEBSITE">Medsos & Website</option>
                  <option value="ADMIN_CRM">Admin CRM & Donasi</option>
                  <option value="KOORDINATOR_OPERASIONAL">Koordinator Operasional</option>
                  <option value="PIMPINAN_DAN_OPERASIONAL">Pimpinan Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Akses</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="DIVISI_PROGRAM">DIVISI PROGRAM</option>
                  <option value="DIVISI_FUNDRAISING">DIVISI FUNDRAISING</option>
                  <option value="KONTEN_KREATOR_VIDEO">KONTEN KREATOR VIDEO</option>
                  <option value="MEDIA_SOSIAL_WEBSITE">MEDIA SOSIAL & WEBSITE</option>
                  <option value="ADMIN_CRM">ADMIN CRM</option>
                  <option value="KOORDINATOR_OPERASIONAL">KOORDINATOR OPERASIONAL</option>
                  <option value="PIMPINAN">PIMPINAN</option>
                  <option value="KARYAWAN_RELAWAN">KARYAWAN / RELAWAN</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl transition"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Operational Data Modal (Reset to 0) */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => {
            if (!resetLoading) {
              setShowResetModal(false);
              setResetConfirmWord('');
              setResetMessage(null);
            }
          }}
          title="⚠️ Konfirmasi Reset Seluruh Data Operasional ke Nol"
          subtitle="Tindakan ini akan mengosongkan seluruh data operasional inputan"
          maxWidth="md"
        >
          <form onSubmit={handleResetAllData} className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-black text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>PERHATIAN: PEMBERSIHAN DATA OPERASIONAL</span>
              </div>
              <p className="leading-relaxed">
                Tindakan ini akan menghapus <strong>seluruh data operasional</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-800">
                <li>Semua tugas & riwayat progres</li>
                <li>Semua campaign & target penggalangan dana</li>
                <li>Semua asesmen lapangan mustahik</li>
                <li>Semua transaksi donasi & database donatur</li>
                <li>Semua pos anggaran belanja (RAB) & pengeluaran</li>
                <li>Semua agenda implementasi lapangan</li>
                <li>Semua kalender konten, evaluasi KPI, notulensi rapat & keputusan</li>
              </ul>
              <div className="pt-2 border-t border-rose-200 text-emerald-900 font-bold text-[11px]">
                🛡️ <strong>Koleksi Akun Pengguna / Staf TETAP UTUH dan TIDAK AKAN DIHAPUS.</strong> Super Admin dan seluruh staf tetap dapat login secara normal.
              </div>
            </div>

            {resetMessage && (
              <div className={`p-3 rounded-xl border font-semibold ${
                resetMessage.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {resetMessage}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Ketik kata <span className="font-mono text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-sm">RESET</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                required
                disabled={resetLoading}
                value={resetConfirmWord}
                onChange={(e) => setResetConfirmWord(e.target.value.toUpperCase())}
                placeholder="Ketik RESET"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm tracking-widest text-rose-700 font-black"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={resetLoading}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={resetLoading || resetConfirmWord !== 'RESET'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${resetLoading ? 'animate-spin' : ''}`} />
                <span>{resetLoading ? 'Mengosongkan Database...' : 'Kosongkan Semua Data ke 0'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Akun Karyawan / Relawan Baru"
          subtitle="Dibuat melalui Secondary Auth tanpa memutus sesi Super Admin"
          maxWidth="md"
        >
          <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Username Unik *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Contoh: ahmad.fauzi (huruf kecil)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Karyawan *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi, S.E."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Divisi / Penempatan</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="DIVISI_PROGRAM">Divisi Program</option>
                  <option value="DIVISI_FUNDRAISING">Divisi Fundraising</option>
                  <option value="KONTEN_KREATOR_VIDEO">Konten Kreator Video</option>
                  <option value="MEDIA_SOSIAL_WEBSITE">Medsos & Website</option>
                  <option value="ADMIN_CRM">Admin CRM & Donasi</option>
                  <option value="KOORDINATOR_OPERASIONAL">Koordinator Operasional</option>
                  <option value="PIMPINAN_DAN_OPERASIONAL">Pimpinan Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Hak Akses (RBAC)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="DIVISI_PROGRAM">DIVISI PROGRAM</option>
                  <option value="DIVISI_FUNDRAISING">DIVISI FUNDRAISING</option>
                  <option value="KONTEN_KREATOR_VIDEO">KONTEN KREATOR VIDEO</option>
                  <option value="MEDIA_SOSIAL_WEBSITE">MEDIA SOSIAL & WEBSITE</option>
                  <option value="ADMIN_CRM">ADMIN CRM</option>
                  <option value="KOORDINATOR_OPERASIONAL">KOORDINATOR OPERASIONAL</option>
                  <option value="PIMPINAN">PIMPINAN</option>
                  <option value="KARYAWAN_RELAWAN">KARYAWAN / RELAWAN</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password Awal (Minimal 12 Karakter) *
              </label>
              <input
                type="password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 12 karakter..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl transition"
              >
                {loading ? 'Mendaftarkan Akun...' : 'Buat Akun Staf'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
