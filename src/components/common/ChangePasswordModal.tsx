import React, { useState } from 'react';
import { Modal } from './Modal';
import { changeUserPassword } from '../../services/authService';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 12) {
      setError('Password baru minimal 12 karakter untuk mematuhi standar keamanan YIUT.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await changeUserPassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perbarui Kata Sandi Akun"
      subtitle="Standar keamanan akun Yayasan Indonesia Uluran Tangan"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kata sandi berhasil diperbarui!</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Password Baru (Minimal 12 Karakter) *
          </label>
          <input
            type="password"
            required
            minLength={12}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 12 karakter..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Ulangi Konfirmasi Password Baru *
          </label>
          <input
            type="password"
            required
            minLength={12}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi konfirmasi..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 rounded-xl font-semibold hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{loading ? 'Menyimpan...' : 'Ganti Password'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
