import React, { useState, useEffect } from 'react';
import { ContentItem, ContentType, ContentStatus, Campaign, UserProfile } from '../types';
import { subscribeContentItems, createContentItem, updateContentStatus } from '../services/contentService';
import { formatDateID } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  Video,
  Plus,
  Calendar,
  Search,
  ExternalLink,
  Instagram,
  Youtube,
  Globe,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  campaigns: Campaign[];
  currentUserProfile: UserProfile | null;
}

export const ContentPage: React.FC<Props> = ({ campaigns, currentUserProfile }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [title, setTitle] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [contentType, setContentType] = useState<ContentType>('REELS');
  const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'TikTok']);
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState('');
  const [productionDate, setProductionDate] = useState(todayStr);
  const [publishDate, setPublishDate] = useState(todayStr);
  const [assetUrl, setAssetUrl] = useState('');

  useEffect(() => {
    const unsub = subscribeContentItems(setContentItems);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selCamp = campaigns.find((c) => c.id === campaignId);

    try {
      await createContentItem({
        title: title.trim(),
        campaignId: campaignId || undefined,
        campaignTitle: selCamp?.title || undefined,
        contentType,
        platforms,
        picId: currentUserProfile?.uid || 'KONTEN',
        picName: currentUserProfile?.fullName || 'Konten Kreator',
        brief: brief.trim(),
        script: script.trim() || undefined,
        productionDate,
        publishDate,
        status: 'BRIEF',
        assetUrl: assetUrl.trim() || undefined,
      });
      setShowCreateModal(false);
      setTitle('');
      setBrief('');
      setScript('');
      setAssetUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (contentId: string, status: ContentStatus, publishUrl?: string) => {
    try {
      await updateContentStatus(contentId, status, publishUrl);
      if (selectedItem && selectedItem.id === contentId) {
        setSelectedItem({ ...selectedItem, status, publishUrl: publishUrl || selectedItem.publishUrl });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contentItems.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.campaignTitle && c.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-5 h-5 text-[#173D32]" />
            <span>Kalender Konten Kreator & Media Sosial</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perencanaan video campaign, reels dakwah, artikel web, dan dokumentasi penjaga martabat mustahik
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#173D32] hover:bg-[#245D49] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Konten</span>
        </button>
      </div>

      {/* Guiding Ethics Banner */}
      <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-emerald-900 font-bold">Etika Konten YIUT:</strong> Konten yang menampilkan penerima manfaat wajib menjaga martabat, tidak merendahkan, serta memprioritaskan narasi harapan, kemandirian, dan pertanggungjawaban amanah donatur.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul konten, format, atau nama campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173D32]"
          />
        </div>
      </div>

      {/* Grid of Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-700">Belum ada jadwal konten yang dibuat</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol di atas untuk menyusun kalender konten bulanan.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{item.contentId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-[11px] text-emerald-800 font-medium mt-1 truncate">
                  {item.contentType.replace(/_/g, ' ')}
                  {item.campaignTitle && ` • ${item.campaignTitle}`}
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {item.brief}
                </p>

                {/* Platforms badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.platforms.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tayang: {formatDateID(item.publishDate)}</span>
                <span className="font-medium text-slate-800">PIC: {item.picName}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Content Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          subtitle={`Kode: ${selectedItem.contentId} • Format: ${selectedItem.contentType.replace(/_/g, ' ')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">
                Platform: {selectedItem.platforms.join(', ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                {selectedItem.status}
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Brief Konten & Tujuan:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedItem.brief}
              </p>
            </div>

            {selectedItem.script && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">Naskah / Script Video:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                  {selectedItem.script}
                </p>
              </div>
            )}

            {selectedItem.assetUrl && (
              <a
                href={selectedItem.assetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-emerald-800 font-medium transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">Link Aset Video / Google Drive: {selectedItem.assetUrl}</span>
              </a>
            )}

            {/* Workflow status transition */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Ubah Status Progres Konten:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['IDE', 'BRIEF', 'PRODUKSI', 'REVIEW', 'DISETUJUI', 'TERJADWAL', 'TAYANG', 'REVISI'] as ContentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedItem.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedItem.status === st
                        ? 'bg-[#173D32] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Jadwalkan Konten Baru"
          subtitle="Tentukan format, naskah, dan tanggal tayang di media sosial"
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul / Topik Konten *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kisah Perjuangan Santri Yatim Penghafal Al-Qur'an"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Format Konten</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="REELS">Reels / Shorts (Video Vertikal)</option>
                  <option value="VIDEO_CAMPAIGN">Video Campaign Panjang</option>
                  <option value="VIDEO_DOKUMENTASI">Video Dokumentasi Aksi</option>
                  <option value="POSTER">Poster / Banner Desain</option>
                  <option value="CAROUSEL">Carousel Instagram Edukasi</option>
                  <option value="ARTIKEL">Artikel Website / Berita</option>
                  <option value="STORY">Instagram / WA Story</option>
                  <option value="TESTIMONI">Testimoni Mustahik / Donatur</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Terkait</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Branding Umum YIUT --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Produksi</label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Tanggal Tayang</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brief & Angle Cerita *</label>
              <textarea
                rows={2}
                required
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Pesan utama yang ingin disampaikan, Call to Action donasi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Link Bahan / Footage (Drive)</label>
              <input
                type="url"
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#173D32] hover:bg-[#245D49] text-white font-bold rounded-xl"
              >
                Simpan Jadwal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
