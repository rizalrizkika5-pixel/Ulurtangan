import React, { useState } from 'react';
import { Donor, DonorCategory, Donation, UserProfile } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { createDonor, updateDonor, generateThankYouMessage } from '../services/crmService';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Heart,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface Props {
  donors: Donor[];
  donations: Donation[];
  currentUserProfile: UserProfile | null;
  onRefresh: () => void;
}

export const CRMPage: React.FC<Props> = ({
  donors,
  donations,
  currentUserProfile,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [thankYouText, setThankYouText] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<DonorCategory>('DONATUR_BARU');
  const [communicationPreference, setCommunicationPreference] = useState('WhatsApp');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createDonor({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        category,
        communicationPreference,
        notes: notes.trim(),
      });
      onRefresh();
      setShowCreateModal(false);
      setName('');
      setPhoneNumber('');
      setEmail('');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenThankYou = (donor: Donor) => {
    setSelectedDonor(donor);
    const donorDonations = donations.filter((d) => d.donorId === donor.id);
    const latestDonation = donorDonations[0];
    const msg = generateThankYouMessage(
      donor.name,
      latestDonation ? latestDonation.amount : donor.totalDonations,
      latestDonation?.campaignTitle
    );
    setThankYouText(msg);
    setCopied(false);
    setShowThankYouModal(true);
  };

  const handleCopyThankYou = () => {
    navigator.clipboard.writeText(thankYouText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = donors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.phoneNumber && d.phoneNumber.includes(searchTerm)) ||
      (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#173D32]" />
            <span>CRM & Database Donatur (Muzakki / Muhsinin)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola silaturahmi, preferensi komunikasi, dan riwayat kedermawanan donatur YIUT
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Donatur Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, no. HP, atau ID donatur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="DONATUR_BARU">Donatur Baru</option>
          <option value="DONATUR_AKTIF">Donatur Aktif</option>
          <option value="DONATUR_RUTIN">Donatur Rutin</option>
          <option value="DONATUR_TIDAK_AKTIF">Donatur Tidak Aktif</option>
          <option value="MITRA">Mitra</option>
          <option value="DONATUR_INSTITUSI">Donatur Institusi</option>
        </select>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((donor) => {
          const donorDonations = donations.filter((d) => d.donorId === donor.id);

          return (
            <div
              key={donor.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{donor.donorId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {donor.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{donor.name}</h3>

                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {donor.phoneNumber && (
                    <p className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{donor.phoneNumber}</span>
                    </p>
                  )}
                  {donor.email && (
                    <p className="flex items-center gap-1.5 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{donor.email}</span>
                    </p>
                  )}
                </div>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">Total Donasi:</span>
                    <span className="font-bold font-mono text-emerald-800">
                      {formatIDR(donor.totalDonations)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{donor.donationCount || donorDonations.length} Transaksi</span>
                    <span>Sejak {formatDateID(donor.firstDonationDate)}</span>
                  </div>
                </div>

                {donor.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-1">
                    Catatan: {donor.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Preferensi: {donor.communicationPreference || 'WhatsApp'}</span>
                <button
                  type="button"
                  onClick={() => handleOpenThankYou(donor)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim Ucapan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thank You Note Generator Modal */}
      {showThankYouModal && selectedDonor && (
        <Modal
          isOpen={showThankYouModal}
          onClose={() => setShowThankYouModal(false)}
          title={`Generator Ucapan Terima Kasih: ${selectedDonor.name}`}
          subtitle="Pesan apresiasi donasi resmi Yayasan Indonesia Uluran Tangan"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <textarea
              rows={9}
              value={thankYouText}
              onChange={(e) => setThankYouText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 leading-relaxed focus:bg-white"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyThankYou}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>

              {selectedDonor.phoneNumber && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${selectedDonor.phoneNumber.replace(/^0/, '62')}&text=${encodeURIComponent(
                    thankYouText
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Donor Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Donatur Baru"
          subtitle="Simpan data kontak donatur ke database resmi YIUT"
          maxWidth="md"
        >
          <form onSubmit={handleCreateDonor} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Donatur *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: H. Bambang Sulistyo"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Donatur</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DonorCategory)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="DONATUR_BARU">Donatur Baru</option>
                  <option value="DONATUR_AKTIF">Donatur Aktif</option>
                  <option value="DONATUR_RUTIN">Donatur Rutin</option>
                  <option value="MITRA">Mitra Lembaga</option>
                  <option value="DONATUR_INSTITUSI">Donatur Institusi / Korporasi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferensi Komunikasi</label>
                <select
                  value={communicationPreference}
                  onChange={(e) => setCommunicationPreference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Telepon Langsung">Telepon Langsung</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Khusus Donatur</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferensi program, jam yang nyaman dihubungi, akad donasi khusus..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl transition"
              >
                {loading ? 'Menyimpan...' : 'Simpan Donatur'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
