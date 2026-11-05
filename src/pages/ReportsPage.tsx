import React, { useState } from 'react';
import { Task, Campaign, Donation, Donor, UserProfile } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { FileText, Download, Printer, Filter, Calendar, CheckSquare, Coins } from 'lucide-react';

interface Props {
  tasks: Task[];
  campaigns: Campaign[];
  donations: Donation[];
  donors: Donor[];
  users: UserProfile[];
}

export const ReportsPage: React.FC<Props> = ({
  tasks,
  campaigns,
  donations,
  donors,
  users,
}) => {
  const [reportType, setReportType] = useState<string>('CAMPAIGN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `laporan_${reportType.toLowerCase()}_yiut.csv`;

    if (reportType === 'TASKS') {
      headers = ['ID Tugas', 'Judul', 'Divisi', 'PIC', 'Prioritas', 'Status', 'Deadline', 'Progres (%)'];
      rows = tasks.map((t) => [
        t.taskId,
        `"${t.title.replace(/"/g, '""')}"`,
        t.department,
        t.picName,
        t.priority,
        t.status,
        t.deadline,
        t.progress || 0,
      ]);
    } else if (reportType === 'CAMPAIGN') {
      headers = ['ID Campaign', 'Nama Campaign', 'Program Utama', 'Lokasi', 'Target Dana (IDR)', 'Dana Terkumpul (IDR)', 'Mustahik', 'Status', 'Deadline'];
      rows = campaigns.map((c) => [
        c.campaignId,
        `"${c.title.replace(/"/g, '""')}"`,
        c.programType,
        `"${c.location.replace(/"/g, '""')}"`,
        c.targetAmount,
        c.collectedAmount,
        c.targetBeneficiaries,
        c.status,
        c.deadline,
      ]);
    } else if (reportType === 'TRANSACTIONS') {
      headers = ['ID Transaksi', 'Tanggal', 'Donatur', 'Campaign', 'Jenis Dana', 'Nominal (IDR)', 'Metode Bayar', 'Status'];
      rows = donations.map((d) => [
        d.donationId,
        d.date,
        `"${d.donorName.replace(/"/g, '""')}"`,
        `"${(d.campaignTitle || 'Sedekah Umum').replace(/"/g, '""')}"`,
        d.fundType,
        d.amount,
        d.paymentMethod,
        d.status,
      ]);
    } else {
      headers = ['ID Donatur', 'Nama Donatur', 'No HP', 'Email', 'Kategori', 'Total Donasi (IDR)', 'Frekuensi Donasi'];
      rows = donors.map((dn) => [
        dn.donorId,
        `"${dn.name.replace(/"/g, '""')}"`,
        dn.phoneNumber || '',
        dn.email || '',
        dn.category,
        dn.totalDonations,
        dn.donationCount,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#173D32]" />
            <span>Pusat Laporan Terpadu & Ekspor Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan akuntabilitas otomatis berdasarkan data transaksi dan operasional riil Firestore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'CAMPAIGN', label: '1. Laporan Campaign' },
            { id: 'TRANSACTIONS', label: '2. Laporan Transaksi Donasi' },
            { id: 'TASKS', label: '3. Laporan Kinerja Tugas' },
            { id: 'DONORS', label: '4. Laporan Database Donatur' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id)}
              className={`p-2.5 rounded-xl text-xs font-bold transition text-center ${
                reportType === item.id
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Kop Surat Yayasan */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#173D32] text-white flex items-center justify-center font-bold text-xl">
              🤝
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-slate-900">
                YAYASAN INDONESIA ULURAN TANGAN (YIUT)
              </h1>
              <p className="text-xs text-slate-600">
                Lembaga Filantropi & Pengelolaan Dana Sosial Keagamaan Terpercaya
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                "Bergerak dengan Sistem, Melayani dengan Amanah." &bull; Zona Waktu: Asia/Jakarta
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">LAPORAN AKUNTABILITAS RESMI</p>
            <p className="text-[11px] font-mono mt-0.5">
              Dicetak: {formatDateID(new Date().toISOString().split('T')[0])}
            </p>
          </div>
        </div>

        {/* Report Content View */}
        {reportType === 'CAMPAIGN' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Rekapitulasi Campaign & Penyerapan Program ({campaigns.length} Program)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#F4F7F5] border-b border-slate-200 font-bold text-[11px] text-slate-800">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Nama Campaign</th>
                    <th className="p-2.5">Program</th>
                    <th className="p-2.5">Target Dana</th>
                    <th className="p-2.5">Terkumpul</th>
                    <th className="p-2.5">Mustahik</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 font-mono font-bold text-[10px]">{c.campaignId}</td>
                      <td className="p-2 font-semibold text-slate-900">{c.title}</td>
                      <td className="p-2 text-slate-600">{c.programType}</td>
                      <td className="p-2 font-mono">{formatIDR(c.targetAmount)}</td>
                      <td className="p-2 font-mono font-bold text-emerald-800">{formatIDR(c.collectedAmount)}</td>
                      <td className="p-2">{c.targetBeneficiaries} Jiwa</td>
                      <td className="p-2">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'TRANSACTIONS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Laporan Transaksi Penerimaan Donasi ({donations.length} Transaksi)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#F4F7F5] border-b border-slate-200 font-bold text-[11px] text-slate-800">
                  <tr>
                    <th className="p-2.5">ID Transaksi</th>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Donatur</th>
                    <th className="p-2.5">Akad / Jenis</th>
                    <th className="p-2.5">Nominal (IDR)</th>
                    <th className="p-2.5">Metode</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td className="p-2 font-mono font-bold text-[10px]">{d.donationId}</td>
                      <td className="p-2">{formatDateID(d.date)}</td>
                      <td className="p-2 font-semibold">{d.donorName}</td>
                      <td className="p-2">{d.fundType}</td>
                      <td className="p-2 font-mono font-bold text-emerald-800">{formatIDR(d.amount)}</td>
                      <td className="p-2 text-[11px]">{d.paymentMethod}</td>
                      <td className="p-2">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'TASKS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Laporan Kinerja & Penyelesaian Tugas Operasional ({tasks.length} Tugas)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#F4F7F5] border-b border-slate-200 font-bold text-[11px] text-slate-800">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Judul Tugas</th>
                    <th className="p-2.5">Divisi</th>
                    <th className="p-2.5">PIC</th>
                    <th className="p-2.5">Prioritas</th>
                    <th className="p-2.5">Deadline</th>
                    <th className="p-2.5">Progres</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 font-mono font-bold text-[10px]">{t.taskId}</td>
                      <td className="p-2 font-semibold">{t.title}</td>
                      <td className="p-2">{t.department}</td>
                      <td className="p-2">{t.picName}</td>
                      <td className="p-2">{t.priority}</td>
                      <td className="p-2 font-mono">{formatDateID(t.deadline)}</td>
                      <td className="p-2 font-mono font-bold">{t.progress || 0}%</td>
                      <td className="p-2">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'DONORS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Laporan Database & Rekap Donatur ({donors.length} Donatur)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#F4F7F5] border-b border-slate-200 font-bold text-[11px] text-slate-800">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Nama Donatur</th>
                    <th className="p-2.5">Kontak</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Total Kontribusi</th>
                    <th className="p-2.5">Frekuensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donors.map((dn) => (
                    <tr key={dn.id}>
                      <td className="p-2 font-mono font-bold text-[10px]">{dn.donorId}</td>
                      <td className="p-2 font-semibold">{dn.name}</td>
                      <td className="p-2 font-mono text-[11px]">{dn.phoneNumber || '-'}</td>
                      <td className="p-2">{dn.category}</td>
                      <td className="p-2 font-mono font-bold text-emerald-800">{formatIDR(dn.totalDonations)}</td>
                      <td className="p-2">{dn.donationCount} Kali</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signature Area */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-700">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold mt-1">Direktur Eksekutif YIUT</p>
            <div className="h-16" />
            <p className="font-bold underline">Ustadz H. Abdullah, S.Sos.</p>
          </div>
          <div>
            <p>Disusun oleh,</p>
            <p className="font-bold mt-1">Manajer Keuangan & Operasional</p>
            <div className="h-16" />
            <p className="font-bold underline">Ahmad Fauzi, S.E.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
