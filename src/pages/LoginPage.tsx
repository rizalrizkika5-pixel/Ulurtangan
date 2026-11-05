import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User, Shield, AlertCircle, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import { checkAndSeedInitialData } from '../services/seedService';

export const LoginPage: React.FC = () => {
  const { login, bootstrapAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First Super Admin bootstrap modal
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapConfirm, setBootstrapConfirm] = useState('');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapSuccess, setBootstrapSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      // Trigger initial sample data check non-blockingly
      checkAndSeedInitialData().catch(console.error);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapError(null);
    setBootstrapSuccess(null);

    if (bootstrapPassword.length < 12) {
      setBootstrapError('Password Super Admin wajib minimal 12 karakter untuk standar keamanan YIUT.');
      return;
    }

    if (bootstrapPassword !== bootstrapConfirm) {
      setBootstrapError('Konfirmasi password tidak cocok.');
      return;
    }

    setBootstrapLoading(true);
    try {
      await bootstrapAdmin(bootstrapPassword);
      setBootstrapSuccess('Akun Super Admin "ulurtangan" berhasil dibuat! Sistem kini siap digunakan.');
      setUsername('ulurtangan');
      setPassword(bootstrapPassword);
      setTimeout(() => {
        setShowBootstrapModal(false);
      }, 1500);
    } catch (err: any) {
      setBootstrapError(err.message || 'Gagal inisialisasi Super Admin');
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col justify-center items-center p-4 selection:bg-emerald-200">
      <div className="w-full max-w-md">
        {/* Main Brand Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Header Banner */}
          <div className="p-8 bg-[#173D32] text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto text-3xl shadow-lg mb-4">
              🤝
            </div>
            <h1 className="text-xl font-black tracking-wider text-white">ULURTANGAN OS</h1>
            <p className="text-xs text-emerald-200/90 font-medium mt-1">
              Yayasan Indonesia Uluran Tangan
            </p>
            <p className="text-[11px] text-emerald-300/70 italic mt-2">
              "Bergerak dengan Sistem, Melayani dengan Amanah."
            </p>
          </div>

          {/* Login Form Body */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan username dan password yang diberikan oleh pimpinan yayasan.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: ulurtangan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Tampilkan atau sembunyikan password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              </button>
            </form>

            {/* Bootstrap Super Admin first setup helper */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
              <p className="text-[11px] text-slate-400">
                Pemasangan awal yayasan atau akun Super Admin belum ada?
              </p>
              <button
                type="button"
                onClick={() => setShowBootstrapModal(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-300"
              >
                Inisialisasi Super Admin Pertama (ulurtangan)
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} Yayasan Indonesia Uluran Tangan (YIUT). Hak Cipta Dilindungi.
        </p>
      </div>

      {/* Bootstrap Super Admin First Modal */}
      {showBootstrapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-[#173D32]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Inisialisasi Super Admin</h3>
                <p className="text-xs text-slate-500">Username: <span className="font-mono font-bold text-emerald-800">ulurtangan</span></p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Sesuai standar operasional YIUT, password akun Super Admin pertama harus minimal 12 karakter dan tidak boleh menggunakan password default.
            </p>

            {bootstrapError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {bootstrapError}
              </div>
            )}

            {bootstrapSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bootstrapSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBootstrap} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Super Admin (Min. 12 Karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  placeholder="Minimal 12 karakter aman..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Password Konfirmasi
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={bootstrapConfirm}
                  onChange={(e) => setBootstrapConfirm(e.target.value)}
                  placeholder="Ulangi password..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBootstrapModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bootstrapLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#173D32] hover:bg-[#245D49] rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{bootstrapLoading ? 'Memproses...' : 'Aktifkan Akun Super Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
