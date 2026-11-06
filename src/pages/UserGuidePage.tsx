import React, { useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  Layers,
  ClipboardList,
  HeartHandshake,
  Users,
  Coins,
  FileSpreadsheet,
  CalendarCheck,
  Video,
  Award,
  UsersRound,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  summary: string;
  steps: string[];
  tips: string[];
}

export const UserGuidePage: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('tugas');
  const [searchTerm, setSearchTerm] = useState('');

  const sections: GuideSection[] = [
    {
      id: 'prinsip',
      title: '1. Filosofi & Tata Kelola Sistem YIUT',
      category: 'TATA KELOLA',
      icon: Info,
      summary:
        'Sistem ULURTANGAN OS dirancang untuk memastikan operasional yayasan bergerak mandiri berbasis sistem, transparan, dan dapat dipertanggungjawabkan di hadapan donatur serta Allah Ta\'ala.',
      steps: [
        'Setiap karyawan masuk menggunakan username resmi masing-masing tanpa registrasi publik.',
        'Sistem tidak menyimpan password dalam format terbuka; selalu gunakan password minimal 12 karakter.',
        'Seluruh aktivitas input, edit, dan hapus tercatat otomatis dalam jejak audit (Audit Log).',
        'Pimpinan memiliki dashboard eksekutif untuk mengawasi item kritis, approval, dan deadline operasional.',
      ],
      tips: [
        'Gunakan fitur Ganti Password di pojok kanan atas profil jika ingin memperbarui kata sandi secara berkala.',
        'Jika menjumpai kesalahan input, tombol Edit dan Hapus tersedia di setiap modul untuk koreksi mandiri.',
      ],
    },
    {
      id: 'tugas',
      title: '2. Manajemen Tugas & 4 Tingkat Prioritas',
      category: 'OPERASIONAL',
      icon: CheckSquare,
      summary:
        'Pengelolaan pekerjaan yayasan mengacu pada 4 tingkat prioritas berbobot dan tenggat waktu ketat berstandar zona waktu Indonesia Barat (WIB).',
      steps: [
        'Buka menu "Manajemen Tugas" dan klik tombol "Tambah Tugas Baru".',
        'Tentukan Tingkat Prioritas: KRITIS (Bobot 4.0 - penanganan < 24 jam), TINGGI (Bobot 3.0), SEDANG (Bobot 2.0), atau RENDAH (Bobot 1.0).',
        'Pilih PIC utama penanggung jawab dan tentukan tanggal batas waktu (deadline).',
        'Karyawan bertugas memperbarui progres pengerjaan (0% s/d 100%) dengan menyertakan tautan bukti atau catatan kendala jika ada hambatan.',
        'Saat tugas mencapai 100%, sistem otomatis mengubah status menjadi "Menunggu Persetujuan" agar pimpinan atau koordinator memverifikasi hasil kerja.',
      ],
      tips: [
        'Gunakan tampilan Kanban Board untuk memantau alur kerja secara visual atau Table View untuk pencarian spesifik.',
        'Warna badge deadline akan berubah otomatis: Merah (Terlambat/Hari Ini), Kuning (Besok / 2-3 Hari), dan Abu-abu (Normal).',
      ],
    },
    {
      id: 'programs',
      title: '3. 9 Program Utama & Kampanye 10-Tab',
      category: 'PROGRAM',
      icon: Layers,
      summary:
        'Yayasan memiliki 9 pilar program sosial tetap dan setiap kampanye dana memiliki 10 tab rincian yang saling terhubung.',
      steps: [
        'Buka menu "9 Program Utama" untuk melihat direktori 9 pilar resmi yayasan.',
        'Klik tombol "Buat Campaign untuk Program Ini" untuk membuka modal pembuatan kampanye dana.',
        'Isi target dana (nominal bebas tanpa batas minimal/maksimal), target penerima manfaat, dan lokasi penyaluran.',
        'Pada menu "Manajemen Campaign", klik pada salah satu kampanye untuk membuka modal detail 10-Tab: Ringkasan, Asesmen, Proposal, Fundraising, Konten, Implementasi, Anggaran, Dokumentasi, Laporan, dan Evaluasi.',
      ],
      tips: [
        'Kampanye yang baru dibuat otomatis mengaktifkan penugasan awal untuk divisi fundraising dan konten kreator.',
        'Setiap kampanye dapat diedit atau dihapus kapan saja jika terjadi kesalahan penginputan.',
      ],
    },
    {
      id: 'assessment',
      title: '4. Asesmen Mustahik & Konversi Menjadi Campaign',
      category: 'PROGRAM',
      icon: ClipboardList,
      summary:
        'Prosedur survei kelayakan calon penerima manfaat lapangan sebelum bantuan digulirkan atau digalang dananya.',
      steps: [
        'Buka menu "Assessment Mustahik" dan pilih "Form Assessment Baru".',
        'Catat data survei: tanggal, lokasi detail, jenis kebutuhan, deskripsi masalah, target jiwa/keluarga, dan estimasi biaya.',
        'Pimpinan meninjau asesmen dan memilih "Setujui Assessment" atau "Tolak".',
        'Untuk asesmen yang disetujui, pimpinan cukup mengklik tombol "Konversi Menjadi Campaign Baru" agar sistem otomatis membuat kampanye dana dengan data yang sudah terisi.',
      ],
      tips: [
        'Data asesmen dapat diedit kembali jika ada rincian penerima manfaat yang perlu disesuaikan.',
        'Estimasi biaya dapat diinput dengan nilai berapapun sesuai realitas survei lapangan.',
      ],
    },
    {
      id: 'fundraising',
      title: '5. Fundraising, CRM Donatur & WhatsApp Generator',
      category: 'FUNDRAISING',
      icon: HeartHandshake,
      summary:
        'Manajemen database donatur, pencatatan titipan infak/sedekah/zakat, dan otomatisasi ucapan apresiasi resmi.',
      steps: [
        'Buka menu "CRM Donatur" untuk mendaftarkan donatur baru (Individu, Korporat, Komunitas, atau Anonim).',
        'Pada menu "Transaksi & Keuangan", catat setiap donasi yang masuk lengkap dengan bank tujuan (BSI, Mandiri, BCA, Muamalat, QRIS, Tunai).',
        'Verifikator keuangan mengklik "Verifikasi Donasi", yang otomatis menambahkan saldo terkumpul pada kampanye dan total donasi donatur terkait.',
        'Klik tombol "Kirim WA Terima Kasih" untuk membuka chat WhatsApp resmi yang otomatis terformat dengan doa keberkahan dan nominal donasi.',
      ],
      tips: [
        'Jika transaksi donasi salah input, gunakan tombol Edit atau Hapus Transaksi. Sistem akan otomatis memotong kembali saldo kampanye dan donatur secara sinkron.',
      ],
    },
    {
      id: 'anggaran',
      title: '6. Rencana Anggaran (RAB) vs Realisasi Pengeluaran',
      category: 'KEUANGAN',
      icon: FileSpreadsheet,
      summary:
        'Disiplin pencatatan pagu anggaran kegiatan sosial dan verifikasi kuitansi belanja riil di lapangan.',
      steps: [
        'Buka menu "Anggaran Belanja" dan klik "Tambah Pos Anggaran" untuk kampanye tertentu.',
        'Tentukan kode pos, kategori belanja, dan nominal pagu yang disetujui (dapat diisi berapapun nilainya).',
        'Tim lapangan mengajukan "Ajukan Realisasi Pengeluaran" saat dana dibelanjakan dengan melampirkan kuitansi atau nota.',
        'Pimpinan menyetujui pengeluaran, yang otomatis menambah persentase realisasi anggaran pos tersebut.',
      ],
      tips: [
        'Pos anggaran maupun pengeluaran riil dapat diedit atau dihapus jika terdapat revisi kuitansi dari bendahara.',
      ],
    },
    {
      id: 'implementasi',
      title: '7. Pelaksanaan Lapangan & Berita Acara',
      category: 'OPERASIONAL',
      icon: CalendarCheck,
      summary:
        'Pencatatan agenda penyaluran bantuan sosial, checklist persiapan barang, dan kehadiran penerima manfaat.',
      steps: [
        'Buka menu "Pelaksanaan Lapangan" dan klik "Catat Agenda Baru".',
        'Pilih kampanye terkait, tanggal kegiatan, lokasi, mitra lapangan/vendor, dan target mustahik.',
        'Buka detail kegiatan untuk mencentang checklist kesiapan: Logistik, Kendaraan, Tim Medis, Dokumentasi, dsb.',
      ],
      tips: [
        'Kegiatan yang sudah terlaksana dapat diubah statusnya menjadi "Selesai" dan tautan dokumentasi video/foto dapat dilampirkan.',
      ],
    },
    {
      id: 'konten',
      title: '8. Kalender Konten & Media Sosial',
      category: 'MEDIA',
      icon: Video,
      summary:
        'Manajemen pipa produksi materi dakwah, foto kisah mustahik, video penyaluran, dan publikasi sosial media.',
      steps: [
        'Buka menu "Kalender Konten" dan pilih "Tambah Ide Konten".',
        'Pilih platform distribusi (Instagram, YouTube, TikTok, Facebook, Website) dan jenis konten (Video Reel, Dokumenter, Feed, Artikel).',
        'PIC konten memperbarui status dari Ide ➔ Riset ➔ Produksi ➔ Review ➔ Terjadwal ➔ Terbit.',
      ],
      tips: [
        'Saat konten terbit, cantumkan URL publikasi agar pimpinan dan donatur dapat langsung melihat hasil karya tim media.',
      ],
    },
    {
      id: 'kpi',
      title: '9. Penilaian Kinerja & Evaluasi Berkala KPI',
      category: 'SDM',
      icon: Award,
      summary:
        'Evaluasi objektif kinerja staf yayasan berdasarkan 5 indikator utama dengan pembobotan otomatis.',
      steps: [
        'Buka menu "Evaluasi KPI Karyawan" dan klik "Input Penilaian KPI".',
        'Pilih karyawan dan tentukan periode bulan penilaian.',
        'Beri skor 0 s/d 100 pada 5 indikator: Kedisiplinan (20%), Kualitas Kerja (25%), Inisiatif (20%), Kerjasama (15%), dan Produktivitas (20%).',
        'Sistem otomatis menghitung Nilai Akhir Berbobot dan menetapkan Grade: A+ (Istimewa), A (Sangat Baik), B (Baik), C (Cukup), D (Perlu Pembinaan).',
      ],
      tips: [
        'Pimpinan dapat memberikan catatan apresiasi atau arahan perbaikan untuk pengembangan diri karyawan.',
      ],
    },
    {
      id: 'laporan',
      title: '10. Laporan Resmi, Kustomisasi Tanda Tangan & Reset Sistem',
      category: 'LAPORAN',
      icon: FileText,
      summary:
        'Penerbitan rekapitulasi data yayasan untuk rapat pleno, donatur, auditor, dan pengaturan data.',
      steps: [
        'Buka menu "Laporan & Ekspor" dan pilih jenis laporan yang diinginkan (Kampanye, Transaksi, Tugas, atau Donatur).',
        'Klik tombol "Ekspor Dokumen CSV" untuk mengunduh berkas spreadsheet.',
        'Klik tombol "Cetak Dokumen Resmi" untuk mencetak dokumen fisik atau menyimpan sebagai file PDF.',
        'Pada bagian bawah laporan, klik tombol "Edit Nama & Tanda Tangan Pimpinan" untuk menyesuaikan nama direktur, ketua yayasan, atau manajer penyusun laporan.',
        'Untuk Super Admin: Jika ingin mengosongkan seluruh data operasional kembali ke nol, buka menu "Manajemen Pengguna" dan gunakan tombol "Kosongkan Semua Data Inputan (Reset ke 0)".',
      ],
      tips: [
        'Reset sistem hanya menghapus data transaksi/tugas/konten. Seluruh akun login staf tetap aman dan tidak akan terhapus.',
      ],
    },
  ];

  const filteredSections = sections.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#173D32] via-[#245D49] to-[#173D32] rounded-3xl text-white shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
          <span>Standar Operasional Prosedur (SOP) YIUT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Panduan Penggunaan ULURTANGAN OS
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
          Buku pedoman interaktif pengoperasian sistem terpadu Yayasan Indonesia Uluran Tangan untuk seluruh tim, pimpinan, staf divisi, dan relawan.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari materi panduan (tugas, kampanye, RAB, donasi, laporan, tanda tangan)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>
      </div>

      {/* Guide Content: 2-Column Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Menu (List of Modules) */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Daftar Modul Panduan ({filteredSections.length})
          </p>
          <div className="space-y-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = sec.id === activeSection.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#173D32] text-white border-[#173D32] shadow-sm font-semibold'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive ? 'bg-white/10 text-amber-300' : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate">{sec.title}</span>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-emerald-200/80' : 'text-slate-400'
                        }`}
                      >
                        {sec.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
                  {activeSection.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2 tracking-tight">
                  {activeSection.title}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-[#173D32] shrink-0">
                <activeSection.icon className="w-6 h-6" />
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              {activeSection.summary}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Langkah-Langkah Operasional:
              </h4>
              <div className="space-y-2">
                {activeSection.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#173D32] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips / Keamanan */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tips Penting & Best Practice Yayasan:</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-950 leading-relaxed">
                {activeSection.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
