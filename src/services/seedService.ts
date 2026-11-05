import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Campaign, Task, Donor, Donation, Meeting, Decision, ContentItem, KPI, Assessment, Budget } from '../types';

export async function checkAndSeedInitialData(): Promise<boolean> {
  try {
    const taskSnap = await getDocs(collection(db, 'tasks'));
    if (!taskSnap.empty) {
      return false; // Data already exists
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const now = new Date();
    const plusDays = (days: number) => {
      const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    };

    // 1. Initial Campaigns
    const sampleCampaigns: Omit<Campaign, 'id'>[] = [
      {
        campaignId: 'CMP-2026-101',
        title: 'Sumur Bor Air Bersih Dusun Terpencil',
        programType: 'AIR_BERSIH',
        description: 'Pembangunan sumur bor sedalam 60 meter dan pipanisasi penampungan air untuk 250 KK di kawasan rawan kekeringan.',
        background: 'Warga harus berjalan 3 km setiap hari ke lembah untuk memperoleh 1 jeriken air bersih.',
        location: 'Gunungkidul, D.I. Yogyakarta',
        targetBeneficiaries: 850,
        targetBeneficiaryDescription: '250 KK dhuafa dan lansia',
        picProgramId: 'pic-program-1',
        picProgramName: 'Ahmad Fauzi (Divisi Program)',
        picFundraisingId: 'pic-fund-1',
        picFundraisingName: 'Dewi Lestari (Divisi Fundraising)',
        targetAmount: 75000000,
        collectedAmount: 48500000,
        budgetApproved: 65000000,
        startDate: plusDays(-20),
        deadline: plusDays(15),
        status: 'FUNDRAISING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        campaignId: 'CMP-2026-102',
        title: 'Beasiswa Pendidikan Santri Yatim Penghafal Al-Qur\'an',
        programType: 'PENDIDIKAN',
        description: 'Biaya asrama, kitab, gizi, dan pendidikan formal 40 santri yatim dhuafa berprestasi selama 1 semester.',
        background: 'Banyak anak yatim dhuafa yang bercita-cita menjadi hafidz namun terhambat pembiayaan pendidikan.',
        location: 'Pesantren Tahfidz Uluran Tangan, Bogor',
        targetBeneficiaries: 40,
        targetBeneficiaryDescription: 'Santri yatim dhuafa berprestasi',
        picProgramId: 'pic-program-1',
        picProgramName: 'Ahmad Fauzi (Divisi Program)',
        picFundraisingId: 'pic-fund-1',
        picFundraisingName: 'Dewi Lestari (Divisi Fundraising)',
        targetAmount: 50000000,
        collectedAmount: 32000000,
        budgetApproved: 45000000,
        startDate: plusDays(-15),
        deadline: plusDays(25),
        status: 'FUNDRAISING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        campaignId: 'CMP-2026-103',
        title: 'Layanan Ambulans Tanggap Darurat Dhuafa Gratis',
        programType: 'KESEHATAN',
        description: 'Operasional bahan bakar, perawatan armada, dan honor paramedis untuk layanan antar-jemput pasien dhuafa 24 jam.',
        location: 'Jabodetabek & Banten',
        targetBeneficiaries: 300,
        picProgramId: 'pic-program-1',
        picProgramName: 'Ahmad Fauzi (Divisi Program)',
        picFundraisingId: 'pic-fund-1',
        picFundraisingName: 'Dewi Lestari (Divisi Fundraising)',
        targetAmount: 30000000,
        collectedAmount: 28000000,
        budgetApproved: 25000000,
        startDate: plusDays(-30),
        deadline: plusDays(5),
        status: 'IMPLEMENTASI',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        campaignId: 'CMP-2026-104',
        title: 'Paket Beras & Sembako Keluarga Pra-Sejahtera',
        programType: 'PANGAN',
        description: 'Distribusi 500 karung beras 5kg dan paket sembako nutrisi untuk buruh harian dan janda lansia.',
        location: 'Cianjur & Sukabumi',
        targetBeneficiaries: 500,
        picProgramId: 'pic-program-1',
        picProgramName: 'Ahmad Fauzi (Divisi Program)',
        picFundraisingId: 'pic-fund-1',
        picFundraisingName: 'Dewi Lestari (Divisi Fundraising)',
        targetAmount: 45000000,
        collectedAmount: 45000000,
        budgetApproved: 42000000,
        startDate: plusDays(-40),
        deadline: plusDays(-2),
        status: 'PELAPORAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const campaignDocRefs: string[] = [];
    for (const c of sampleCampaigns) {
      const docRef = await addDoc(collection(db, 'campaigns'), c);
      campaignDocRefs.push(docRef.id);
    }

    // 2. Initial Tasks with all priority levels & deadline statuses
    const sampleTasks: Omit<Task, 'id'>[] = [
      {
        taskId: 'TSK-2026-001',
        title: 'Verifikasi Teknis Geolistrik Titik Sumur Bor Gunungkidul',
        description: 'Lakukan peninjauan hasil survei geolistrik bersama tim ahli hidrologi untuk memastikan potensi debit air sebelum pengeboran dimulai.',
        department: 'DIVISI_PROGRAM',
        campaignId: campaignDocRefs[0],
        campaignTitle: sampleCampaigns[0].title,
        picId: 'pic-program-1',
        picName: 'Ahmad Fauzi',
        createdById: 'admin-1',
        createdByName: 'Koordinator Operasional',
        priority: 'KRITIS',
        status: 'BERJALAN',
        startDate: plusDays(-3),
        deadline: plusDays(0), // DUE TODAY
        progress: 75,
        notes: 'Hasil geolistrik menunjukkan potensi air pada kedalaman 55-62 meter. Sedang menyusun berita acara.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        taskId: 'TSK-2026-002',
        title: 'Produksi Video Naskah Campaign Santri Penghafal Qur\'an',
        description: 'Pengambilan gambar wawancara salah satu santri yatim berprestasi (atas izin pengasuh) dan penyusunan teaser Instagram Reels & TikTok.',
        department: 'KONTEN_KREATOR_VIDEO',
        campaignId: campaignDocRefs[1],
        campaignTitle: sampleCampaigns[1].title,
        picId: 'pic-content-1',
        picName: 'Rian Pratama',
        createdById: 'admin-1',
        createdByName: 'Koordinator Operasional',
        priority: 'TINGGI',
        status: 'BERJALAN',
        startDate: plusDays(-4),
        deadline: plusDays(1), // TOMORROW
        progress: 60,
        notes: 'Footage utama telah selesai diambil. Masuk tahap grading dan mixing audio.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        taskId: 'TSK-2026-003',
        title: 'Rekonsiliasi Bank Donasi Zakat & Infak Pekan Pertama',
        description: 'Cocokkan mutasi rekening BSI & Mandiri YIUT dengan bukti transfer donatur yang masuk lewat formulir website.',
        department: 'ADMIN_CRM',
        picId: 'pic-crm-1',
        picName: 'Siti Rahmawati',
        createdById: 'admin-1',
        createdByName: 'Koordinator Operasional',
        priority: 'NORMAL',
        status: 'SIAP_DIKERJAKAN',
        startDate: plusDays(-1),
        deadline: plusDays(2), // 2 DAYS
        progress: 20,
        notes: 'Menunggu rekap mutasi dari bagian administrasi keuangan.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        taskId: 'TSK-2026-004',
        title: 'Laporan Pertanggungjawaban Finansial Sembako Cianjur',
        description: 'Susun laporan akhir realisasi biaya beras dan nota pembelian sembako untuk diarsipkan ke Google Sheets audit.',
        department: 'DIVISI_PROGRAM',
        campaignId: campaignDocRefs[3],
        campaignTitle: sampleCampaigns[3].title,
        picId: 'pic-program-1',
        picName: 'Ahmad Fauzi',
        createdById: 'admin-1',
        createdByName: 'Pimpinan YIUT',
        priority: 'KRITIS',
        status: 'TERHAMBAT',
        startDate: plusDays(-10),
        deadline: plusDays(-1), // OVERDUE
        progress: 85,
        obstacles: 'Masih menunggu 2 nota stempel dari rekanan distributor logistik lokal.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        taskId: 'TSK-2026-005',
        title: 'Pengiriman Ucapan Terima Kasih Donatur Rutin Ambulans',
        description: 'Kirimkan pesan ucapan terima kasih personal dan dokumentasi foto layanan pasien ambulans gratis ke 45 donatur tetap.',
        department: 'ADMIN_CRM',
        campaignId: campaignDocRefs[2],
        campaignTitle: sampleCampaigns[2].title,
        picId: 'pic-crm-1',
        picName: 'Siti Rahmawati',
        createdById: 'admin-1',
        createdByName: 'Koordinator Operasional',
        priority: 'NORMAL',
        status: 'SELESAI',
        startDate: plusDays(-5),
        deadline: plusDays(-2),
        progress: 100,
        notes: 'Seluruh 45 donatur telah menerima update foto layanan ambulans dan ucapan terima kasih via WhatsApp.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const t of sampleTasks) {
      await addDoc(collection(db, 'tasks'), t);
    }

    // 3. Initial Donors
    const sampleDonors: Omit<Donor, 'id'>[] = [
      {
        donorId: 'DNR-1001',
        name: 'H. Bambang Sulistyo',
        phoneNumber: '081298765432',
        email: 'bambang.s@example.com',
        category: 'DONATUR_RUTIN',
        firstDonationDate: plusDays(-90),
        totalDonations: 15000000,
        donationCount: 6,
        communicationPreference: 'WhatsApp',
        notes: 'Donatur tetap program Air Bersih dan Sedekah Subuh.',
        createdAt: new Date().toISOString(),
      },
      {
        donorId: 'DNR-1002',
        name: 'Ibu Ratna Kumalasari',
        phoneNumber: '081387654321',
        email: 'ratna.k@example.com',
        category: 'DONATUR_AKTIF',
        firstDonationDate: plusDays(-45),
        totalDonations: 5000000,
        donationCount: 3,
        communicationPreference: 'WhatsApp',
        notes: 'Sangat berminat pada beasiswa santri penghafal Al-Qur\'an.',
        createdAt: new Date().toISOString(),
      },
      {
        donorId: 'DNR-1003',
        name: 'PT Berkah Logistik Amanah',
        phoneNumber: '0217891234',
        email: 'csr@berkahlogistik.id',
        category: 'DONATUR_INSTITUSI',
        firstDonationDate: plusDays(-60),
        totalDonations: 25000000,
        donationCount: 2,
        communicationPreference: 'Email & WhatsApp',
        notes: 'Mitra CSR armada ambulans gratis.',
        createdAt: new Date().toISOString(),
      },
    ];

    const donorDocRefs: string[] = [];
    for (const d of sampleDonors) {
      const docRef = await addDoc(collection(db, 'donors'), d);
      donorDocRefs.push(docRef.id);
    }

    // 4. Initial Donations
    const sampleDonations: Omit<Donation, 'id'>[] = [
      {
        donationId: 'TRX-2026-5001',
        date: plusDays(-3),
        donorId: donorDocRefs[0],
        donorName: 'H. Bambang Sulistyo',
        campaignId: campaignDocRefs[0],
        campaignTitle: sampleCampaigns[0].title,
        fundType: 'SEDEKAH',
        paymentMethod: 'Transfer BSI',
        amount: 5000000,
        recorderId: 'crm-admin',
        recorderName: 'Siti Rahmawati (CRM)',
        verifierId: 'pimpinan-1',
        verifierName: 'Ustadz Abdullah (Pimpinan)',
        status: 'TERVERIFIKASI',
        notes: 'Infak pembangunan titik sumur bor air bersih.',
        thankYouSent: true,
        createdAt: new Date().toISOString(),
      },
      {
        donationId: 'TRX-2026-5002',
        date: plusDays(-1),
        donorId: donorDocRefs[1],
        donorName: 'Ibu Ratna Kumalasari',
        campaignId: campaignDocRefs[1],
        campaignTitle: sampleCampaigns[1].title,
        fundType: 'INFAK',
        paymentMethod: 'Transfer Mandiri',
        amount: 2500000,
        recorderId: 'crm-admin',
        recorderName: 'Siti Rahmawati (CRM)',
        status: 'MENUNGGU_VERIFIKASI',
        notes: 'Perlu dicek mutasi rekening koran Mandiri sore ini.',
        thankYouSent: false,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const don of sampleDonations) {
      await addDoc(collection(db, 'donations'), don);
    }

    // 5. Initial Meetings & Decisions
    const meetingData = {
      meetingId: 'MTG-2026-001',
      title: 'Rapat Koordinasi Mingguan & Evaluasi Penyerapan Dana Program',
      date: plusDays(-2),
      leaderName: 'Direktur Operasional YIUT',
      attendees: ['Ahmad Fauzi', 'Dewi Lestari', 'Siti Rahmawati', 'Rian Pratama'],
      agenda: '1. Progres Pengeboran Air Bersih Gunungkidul\n2. Kesiapan Distribusi Sembako Cianjur\n3. Strategi Campaign Ramadhan Mendatang',
      notes: 'Pimpinan menginstruksikan agar seluruh SPJ pengeluaran diselesaikan paling lambat H+3 setelah kegiatan selesai. Sumur bor diprioritaskan selesai sebelum awal bulan depan.',
      createdAt: new Date().toISOString(),
    };

    const mtgRef = await addDoc(collection(db, 'meetings'), meetingData);

    await addDoc(collection(db, 'decisions'), {
      decisionId: 'DEC-01',
      meetingId: mtgRef.id,
      meetingTitle: meetingData.title,
      topic: 'Penjadwalan Peletakan Pipa Sumur Bor Air Bersih',
      decisionText: 'Tim teknis harus memfinalisasi jadwal pengiriman pipa PVC dan mesin pompa submersible dengan distributor lokal.',
      picId: 'pic-program-1',
      picName: 'Ahmad Fauzi',
      deadline: plusDays(4),
      status: 'PROSES',
      createdAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Seed initial data error:', error);
    return false;
  }
}
