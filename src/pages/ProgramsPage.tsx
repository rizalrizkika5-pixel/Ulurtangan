import React, { useState } from 'react';
import { ProgramType, Campaign, Task } from '../types';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { formatIDR } from '../utils/formatters';
import {
  Droplets,
  GraduationCap,
  HeartPulse,
  Utensils,
  Coins,
  TrendingUp,
  AlertOctagon,
  Moon,
  Beef,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface ProgramDetail {
  type: ProgramType;
  title: string;
  icon: React.ElementType;
  description: string;
  objective: string;
  color: string;
  accentBg: string;
}

const PROGRAMS_DATA: ProgramDetail[] = [
  {
    type: 'AIR_BERSIH',
    title: 'Air Bersih & Sanitasi',
    icon: Droplets,
    description: 'Penyediaan akses sumber air minum layak, pembuatan sumur bor dalam, pipanisasi desa, dan sarana MCK dhuafa di wilayah kekeringan.',
    objective: 'Mengentaskan krisis air bersih dan meningkatkan derajat kesehatan masyarakat pedesaan.',
    color: 'text-sky-600',
    accentBg: 'bg-sky-50 border-sky-200',
  },
  {
    type: 'PENDIDIKAN',
    title: 'Pendidikan & Beasiswa Santri',
    icon: GraduationCap,
    description: 'Bantuan biaya sekolah, asrama tahfidz, sarana belajar santri yatim, serta pemberdayaan guru ngaji di pelosok nusantara.',
    objective: 'Mencetak generasi qurani yang berakhlak mulia, mandiri, dan berdaya saing global.',
    color: 'text-indigo-600',
    accentBg: 'bg-indigo-50 border-indigo-200',
  },
  {
    type: 'KESEHATAN',
    title: 'Kesehatan & Ambulans Dhuafa',
    icon: HeartPulse,
    description: 'Layanan operasional ambulans gratis 24 jam, bantuan biaya pengobatan mustahik, khitanan massal, dan klinik gratis.',
    objective: 'Memberikan pertolongan medis darurat dan layanan transportasi kesehatan tanpa membebani kaum dhuafa.',
    color: 'text-rose-600',
    accentBg: 'bg-rose-50 border-rose-200',
  },
  {
    type: 'PANGAN',
    title: 'Pangan & Sembako Dhuafa',
    icon: Utensils,
    description: 'Distribusi beras berkah, dapur umum sedekah makan, dan paket sembako nutrisi untuk keluarga pra-sejahtera dan lansia dhuafa.',
    objective: 'Mencegah kerawanan pangan dan malnutrisi pada anak-anak serta lansia.',
    color: 'text-amber-600',
    accentBg: 'bg-amber-50 border-amber-200',
  },
  {
    type: 'ZAKAT',
    title: 'Zakat Maal & Zakat Fitrah',
    icon: Coins,
    description: 'Penghimpunan dan penyaluran zakat secara syar\'i dan transparan kepada 8 asnaf (khususnya fakir miskin dan fi sabilillah).',
    objective: 'Membersihkan harta para muzakki dan mentransformasi mustahik menjadi muzakki berdaya.',
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-50 border-emerald-200',
  },
  {
    type: 'PEMBERDAYAAN',
    title: 'Pemberdayaan Ekonomi Mustahik',
    icon: TrendingUp,
    description: 'Bantuan modal usaha mikro tanpa riba, pelatihan kejuruan, alat produksi gerobak berkah, dan pendampingan wirausaha mandiri.',
    objective: 'Mengikis ketergantungan mustahik menuju kemandirian ekonomi keluarga yang berkelanjutan.',
    color: 'text-teal-600',
    accentBg: 'bg-teal-50 border-teal-200',
  },
  {
    type: 'EMERGENCY',
    title: 'Tanggap Bencana (Emergency)',
    icon: AlertOctagon,
    description: 'Penerjunan relawan reaksi cepat, evakuasi korban bencana alam, dapur darurat, selimut, dan rekonstruksi hunian sementara.',
    objective: 'Memberikan respons darurat kemanusiaan secara sigap dalam 24 jam pertama paska bencana.',
    color: 'text-red-600',
    accentBg: 'bg-red-50 border-red-200',
  },
  {
    type: 'RAMADHAN',
    title: 'Program Berkah Ramadhan',
    icon: Moon,
    description: 'Penyaluran paket ifthar buka puasa, santunan kado lebaran yatim, tebar Al-Qur\'an, dan fidyah bagi yang berhalangan puasa.',
    objective: 'Menyemarakkan bulan suci Ramadhan dengan kegembiraan dan kebahagiaan bagi keluarga dhuafa.',
    color: 'text-purple-600',
    accentBg: 'bg-purple-50 border-purple-200',
  },
  {
    type: 'QURBAN',
    title: 'Tebar Hewan Qurban Berkah',
    icon: Beef,
    description: 'Pengadaan hewan qurban sehat sesuai syariat dan pendistribusian daging segar ke kantong-kantong kemiskinan pelosok yang jarang makan daging.',
    objective: 'Menjamin pemerataan distribusi daging qurban hingga pelosok terpencil nusantara.',
    color: 'text-orange-600',
    accentBg: 'bg-orange-50 border-orange-200',
  },
];

interface Props {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onCreateCampaignForProgram: (programType: ProgramType) => void;
}

export const ProgramsPage: React.FC<Props> = ({
  campaigns,
  onSelectCampaign,
  onCreateCampaignForProgram,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail>(PROGRAMS_DATA[0]);

  // Aggregate stats for the selected program
  const programCampaigns = campaigns.filter((c) => c.programType === selectedProgram.type);
  const activeCampaigns = programCampaigns.filter((c) => c.status !== 'SELESAI' && c.status !== 'DIBATALKAN');
  const completedCampaigns = programCampaigns.filter((c) => c.status === 'SELESAI');

  const totalFunds = programCampaigns.reduce((acc, c) => acc + (c.collectedAmount || 0), 0);
  const targetBeneficiaries = programCampaigns.reduce((acc, c) => acc + (c.targetBeneficiaries || 0), 0);

  return (
    <div className="space-y-6">
      {/* 9 Programs Navigation Bar */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          9 Program Utama Yayasan Indonesia Uluran Tangan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pilar program sosial terpadu YIUT untuk kemaslahatan umat
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 mt-4">
          {PROGRAMS_DATA.map((prog, index) => {
            const Icon = prog.icon;
            const isSelected = selectedProgram.type === prog.type;
            const count = campaigns.filter((c) => c.programType === prog.type).length;

            return (
              <button
                key={prog.type}
                onClick={() => setSelectedProgram(prog)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                  isSelected
                    ? 'bg-[#173D32] text-white border-[#173D32] shadow-md ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mb-1.5 ${
                    isSelected ? 'bg-white/20 text-white' : `${prog.accentBg} ${prog.color}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold line-clamp-1">{index + 1}. {prog.title.split(' ')[0]}</span>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {count} Campaign
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Program Dedicated Profile */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3.5 rounded-2xl ${selectedProgram.accentBg} ${selectedProgram.color}`}>
              {React.createElement(selectedProgram.icon, { className: 'w-8 h-8' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{selectedProgram.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600 font-bold">
                  PROGRAM-{selectedProgram.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                {selectedProgram.description}
              </p>
              <div className="mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                Tujuan Strategis: {selectedProgram.objective}
              </div>
            </div>
          </div>

          <button
            onClick={() => onCreateCampaignForProgram(selectedProgram.type)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Campaign di Program Ini</span>
          </button>
        </div>

        {/* Aggregate Program Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Dana Terhimpun</span>
            <h4 className="text-lg font-bold text-emerald-800 font-mono mt-1">
              {formatIDR(totalFunds)}
            </h4>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Target Penerima Manfaat</span>
            <h4 className="text-lg font-bold text-slate-800 mt-1">
              {targetBeneficiaries.toLocaleString('id-ID')} Jiwa
            </h4>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Campaign Berjalan</span>
            <h4 className="text-lg font-bold text-amber-700 mt-1">{activeCampaigns.length} Campaign</h4>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Campaign Selesai & LPJ</span>
            <h4 className="text-lg font-bold text-emerald-700 mt-1">{completedCampaigns.length} Selesai</h4>
          </div>
        </div>

        {/* List of campaigns under this program */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
            Daftar Campaign di Bawah Program {selectedProgram.title} ({programCampaigns.length})
          </h4>

          {programCampaigns.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada campaign aktif pada program ini. Klik tombol di atas untuk membuat campaign baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} onSelect={onSelectCampaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
