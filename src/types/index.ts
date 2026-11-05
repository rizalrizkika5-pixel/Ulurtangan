export type UserRole =
  | 'SUPER_ADMIN'
  | 'PIMPINAN'
  | 'KOORDINATOR_OPERASIONAL'
  | 'DIVISI_PROGRAM'
  | 'DIVISI_FUNDRAISING'
  | 'KONTEN_KREATOR_VIDEO'
  | 'MEDIA_SOSIAL_WEBSITE'
  | 'ADMIN_CRM'
  | 'KARYAWAN_RELAWAN';

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  department: string;
  role: UserRole;
  phoneNumber?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskPriority = 'KRITIS' | 'TINGGI' | 'NORMAL' | 'RENDAH';

export type TaskStatus =
  | 'BACKLOG'
  | 'SIAP_DIKERJAKAN'
  | 'BERJALAN'
  | 'MENUNGGU_PERSETUJUAN'
  | 'TERHAMBAT'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface TaskHistoryItem {
  timestamp: string;
  userName: string;
  action: string;
  note?: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  department: string;
  campaignId?: string;
  campaignTitle?: string;
  picId: string;
  picName: string;
  supportingMembers?: string[];
  createdById: string;
  createdByName: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0-100
  documentLinks?: string[];
  proofLinks?: string[];
  notes?: string;
  obstacles?: string;
  history?: TaskHistoryItem[];
  approvalStatus?: 'BELUM_DIAJUKAN' | 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';
  approvalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProgramType =
  | 'ZAKAT'
  | 'PENDIDIKAN'
  | 'KESEHATAN'
  | 'PANGAN'
  | 'AIR_BERSIH'
  | 'PEMBERDAYAAN'
  | 'EMERGENCY'
  | 'RAMADHAN'
  | 'QURBAN';

export type CampaignStatus =
  | 'IDE'
  | 'ASSESSMENT'
  | 'PERSETUJUAN'
  | 'PERSIAPAN_FUNDRAISING'
  | 'FUNDRAISING'
  | 'SIAP_IMPLEMENTASI'
  | 'IMPLEMENTASI'
  | 'PELAPORAN'
  | 'EVALUASI'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface Campaign {
  id: string;
  campaignId: string;
  title: string;
  programType: ProgramType;
  description: string;
  background?: string;
  location: string;
  targetBeneficiaries: number;
  targetBeneficiaryDescription?: string;
  picProgramId: string;
  picProgramName: string;
  picFundraisingId: string;
  picFundraisingName: string;
  targetAmount: number;
  collectedAmount: number;
  budgetApproved: number;
  startDate: string;
  deadline: string;
  status: CampaignStatus;
  proposalUrl?: string;
  documentationUrls?: string[];
  finalReportUrl?: string;
  evaluationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssessmentStatus =
  | 'DRAFT'
  | 'MENUNGGU_VERIFIKASI'
  | 'TERVERIFIKASI'
  | 'DISETUJUI'
  | 'DITOLAK';

export interface Assessment {
  id: string;
  assessmentId: string;
  date: string;
  assessorId: string;
  assessorName: string;
  location: string;
  needType: string;
  problemDescription: string;
  sourceOfInformation: string;
  targetCount: number;
  eligibilityCriteria: string;
  estimatedCost: number;
  alternativeSolutions?: string;
  risks?: string;
  recommendations: string;
  status: AssessmentStatus;
  verificationNotes?: string;
  linkedCampaignId?: string;
  createdAt: string;
}

export type DonorCategory =
  | 'DONATUR_BARU'
  | 'DONATUR_AKTIF'
  | 'DONATUR_RUTIN'
  | 'DONATUR_TIDAK_AKTIF'
  | 'MITRA'
  | 'DONATUR_INSTITUSI';

export interface Donor {
  id: string;
  donorId: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  category: DonorCategory;
  firstDonationDate?: string;
  totalDonations: number;
  donationCount: number;
  communicationPreference?: string;
  notes?: string;
  createdAt: string;
}

export type FundType =
  | 'ZAKAT'
  | 'INFAK'
  | 'SEDEKAH'
  | 'WAKAF'
  | 'QURBAN'
  | 'DONASI_TERIKAT'
  | 'DONASI_UMUM'
  | 'LAINNYA';

export type DonationStatus = 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK';

export interface Donation {
  id: string;
  donationId: string;
  date: string;
  donorId: string;
  donorName: string;
  campaignId?: string;
  campaignTitle?: string;
  fundType: FundType;
  paymentMethod: string;
  amount: number;
  proofUrl?: string;
  recorderId: string;
  recorderName: string;
  verifierId?: string;
  verifierName?: string;
  status: DonationStatus;
  notes?: string;
  thankYouSent?: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  budgetId: string;
  campaignId: string;
  campaignTitle?: string;
  budgetCode: string;
  category: string;
  approvedAmount: number;
  realizedAmount: number;
  picId: string;
  picName: string;
  status: 'DISETUJUI' | 'MENUNGGU_PERSETUJUAN' | 'REVISI' | 'DITOLAK';
  notes?: string;
  createdAt: string;
}

export interface Expenditure {
  id: string;
  expenditureId: string;
  budgetId: string;
  campaignId: string;
  description: string;
  amount: number;
  date: string;
  proofUrl?: string;
  spenderId: string;
  spenderName: string;
  approverId?: string;
  approverName?: string;
  status: 'MENUNGGU_PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK';
  createdAt: string;
}

export interface Implementation {
  id: string;
  implementationId: string;
  campaignId: string;
  campaignTitle?: string;
  activityTitle: string;
  date: string;
  location: string;
  partner?: string;
  fieldPicName: string;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  budgetApproved: number;
  actualCost: number;
  outputSummary: string;
  documentationUrls?: string[];
  minutesUrl?: string;
  obstacles?: string;
  preChecklist: {
    proposalApproved: boolean;
    fundsReady: boolean;
    partnerVerified: boolean;
    locationReady: boolean;
    beneficiariesVerified: boolean;
    teamReady: boolean;
    documentationPrepared: boolean;
  };
  postChecklist: {
    activityExecuted: boolean;
    beneficiariesRecorded: boolean;
    handoverProofAvailable: boolean;
    documentationComplete: boolean;
    actualCostsLogged: boolean;
    reportFinished: boolean;
  };
  status: 'PERSIAPAN' | 'BERJALAN' | 'SELESAI' | 'TERKENDALA';
  createdAt: string;
}

export type ContentType =
  | 'VIDEO_CAMPAIGN'
  | 'VIDEO_DOKUMENTASI'
  | 'REELS'
  | 'POSTER'
  | 'CAROUSEL'
  | 'ARTIKEL'
  | 'STORY'
  | 'TESTIMONI'
  | 'LAPORAN';

export type ContentStatus =
  | 'IDE'
  | 'BRIEF'
  | 'PRODUKSI'
  | 'REVIEW'
  | 'DISETUJUI'
  | 'TERJADWAL'
  | 'TAYANG'
  | 'REVISI';

export interface ContentItem {
  id: string;
  contentId: string;
  campaignId?: string;
  campaignTitle?: string;
  title: string;
  platforms: string[]; // Instagram, Facebook, TikTok, YouTube, Website, WhatsApp
  contentType: ContentType;
  picId: string;
  picName: string;
  brief: string;
  script?: string;
  productionDate: string;
  reviewDate?: string;
  publishDate?: string;
  status: ContentStatus;
  assetUrl?: string;
  publishUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | 'TUGAS_BARU'
  | 'PERUBAHAN_TUGAS'
  | 'DEADLINE_MENDEKAT'
  | 'DEADLINE_LEWAT'
  | 'TUGAS_SELESAI'
  | 'PERSETUJUAN_DIPERLUKAN'
  | 'CAMPAIGN_BARU'
  | 'ASSESSMENT_SELESAI'
  | 'LAPORAN_PENDING'
  | 'KENDALA_OPERASIONAL';

export interface AppNotification {
  id: string;
  notificationId: string;
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Meeting {
  id: string;
  meetingId: string;
  title: string;
  date: string;
  leaderName: string;
  attendees: string[];
  agenda: string;
  notes: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  decisionId: string;
  meetingId: string;
  meetingTitle?: string;
  topic: string;
  decisionText: string;
  picId?: string;
  picName?: string;
  deadline?: string;
  status: 'BELUM_DILAKSANAKAN' | 'PROSES' | 'SELESAI' | 'DIBATALKAN';
  convertedTaskId?: string;
  proofOfExecution?: string;
  createdAt: string;
}

export interface KPITargetItem {
  title: string;
  targetValue: number;
  achievedValue: number;
  unit: string;
}

export interface KPI {
  id: string;
  kpiId: string;
  userId: string;
  userName: string;
  department: string;
  periodMonth: string; // e.g. "2026-11"
  targets: KPITargetItem[];
  score: number; // 0-100
  grade: 'SANGAT_BAIK' | 'BAIK' | 'PERLU_PERBAIKAN' | 'TIDAK_TERCAPAI';
  evaluatorNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  logId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
}
