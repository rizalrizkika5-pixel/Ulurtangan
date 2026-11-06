import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { FundraisingPage } from './pages/FundraisingPage';
import { CRMPage } from './pages/CRMPage';
import { FinancePage } from './pages/FinancePage';
import { BudgetPage } from './pages/BudgetPage';
import { ImplementationPage } from './pages/ImplementationPage';
import { ContentPage } from './pages/ContentPage';
import { KPIPage } from './pages/KPIPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { StaffSummaryPage } from './pages/StaffSummaryPage';
import { UserGuidePage } from './pages/UserGuidePage';

// Modals
import { TaskProgressModal } from './components/tasks/TaskProgressModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { ChangePasswordModal } from './components/common/ChangePasswordModal';
import { CampaignFormModal } from './components/campaigns/CampaignFormModal';

// Services
import { subscribeTasks, getAllTasks } from './services/taskService';
import { subscribeCampaigns } from './services/campaignService';
import { subscribeDonations } from './services/donationService';
import { subscribeDonors } from './services/crmService';
import { subscribeAssessments } from './services/assessmentService';
import { subscribeAllUsers } from './services/authService';
import { evaluateDeadlinesForUser } from './services/notificationService';
import { checkAndSeedInitialData } from './services/seedService';

// Types
import { Task, Campaign, Donation, Donor, Assessment, UserProfile, ProgramType } from './types';

function MainApp() {
  const { currentUser, userProfile, loading, logout, refreshProfile } = useAuth();
  const { unreadCount } = useNotifications();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Selected items & modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progressTask, setProgressTask] = useState<Task | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProgramCampaignModal, setShowProgramCampaignModal] = useState(false);
  const [defaultProgramType, setDefaultProgramType] = useState<ProgramType | undefined>(undefined);

  // Subscribe to real-time collections when authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Check & seed starter data if database is fresh
    checkAndSeedInitialData().catch(console.error);

    const unsubTasks = subscribeTasks((updatedTasks) => {
      setTasks(updatedTasks);
      // Run smart deadline evaluator for user
      if (currentUser?.uid) {
        evaluateDeadlinesForUser(updatedTasks, currentUser.uid).catch(console.warn);
      }
    });

    const unsubCampaigns = subscribeCampaigns(setCampaigns);
    const unsubDonations = subscribeDonations(setDonations);
    const unsubDonors = subscribeDonors(setDonors);
    const unsubAssessments = subscribeAssessments(setAssessments);
    const unsubUsers = subscribeAllUsers(setUsers);

    return () => {
      unsubTasks();
      unsubCampaigns();
      unsubDonations();
      unsubDonors();
      unsubAssessments();
      unsubUsers();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#173D32] text-white text-2xl flex items-center justify-center font-bold animate-pulse shadow-md">
          🤝
        </div>
        <p className="text-xs font-bold text-slate-700 mt-4 tracking-wider uppercase">
          Memuat ULURTANGAN OS...
        </p>
      </div>
    );
  }

  // Mandatory Authentication Boundary
  if (!currentUser) {
    return <LoginPage />;
  }

  const getPageTitle = (tabId: string) => {
    switch (tabId) {
      case 'dashboard':
        return 'Pusat Kendali Operasional';
      case 'tasks':
        return 'Manajemen Tugas';
      case 'staff-summary':
        return 'Rangkuman Karyawan & Kontrol Tugas';
      case 'programs':
        return '9 Program Utama Yayasan';
      case 'campaigns':
        return 'Manajemen Campaign';
      case 'assessments':
        return 'Assessment Mustahik';
      case 'fundraising':
        return 'Fundraising & Donatur';
      case 'crm':
        return 'Database CRM Donatur';
      case 'finance':
        return 'Transaksi & Verifikasi';
      case 'budget':
        return 'Anggaran Belanja';
      case 'implementations':
        return 'Pelaksanaan Lapangan';
      case 'content':
        return 'Kalender Konten';
      case 'kpi':
        return 'Evaluasi KPI Karyawan';
      case 'meetings':
        return 'Rapat & Keputusan';
      case 'reports':
        return 'Laporan & Ekspor';
      case 'users':
        return 'Manajemen Pengguna';
      case 'audit':
        return 'Jejak Audit Keamanan';
      case 'notifications':
        return 'Pemberitahuan Internal';
      case 'guide':
        return 'Panduan Penggunaan Sistem';
      default:
        return 'ULURTANGAN OS';
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-slate-800 font-sans antialiased selection:bg-emerald-200">
      {/* Desktop & Tablet Sidebar (Hidden on mobile via hidden md:flex) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        userRole={userProfile?.role}
        unreadNotifications={unreadCount}
        onLogout={logout}
      />

      {/* Mobile Drawer Navigation Backdrop & Slide-out Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out flex"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Mobile"
        >
          <div
            className="w-72 sm:w-80 h-full max-w-[85vw] bg-[#173D32] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileMenuOpen(false)}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              userRole={userProfile?.role}
              unreadNotifications={unreadCount}
              onLogout={() => {
                setMobileMenuOpen(false);
                logout();
              }}
            />
          </div>
        </div>
      )}

      {/* Topbar */}
      <Topbar
        userProfile={userProfile}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        collapsed={collapsed}
        activeTitle={getPageTitle(activeTab)}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        onSelectTab={handleSelectTab}
        onLogout={logout}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Page Area */}
      <main
        className={`pt-20 px-3 sm:px-6 pb-28 md:pb-10 transition-all duration-300 min-h-screen ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage
              userProfile={userProfile}
              tasks={tasks}
              campaigns={campaigns}
              donations={donations}
              users={users}
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenProgressModal={(t) => setProgressTask(t)}
              onNavigateTab={handleSelectTab}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              campaigns={campaigns}
              users={users}
              currentUserProfile={userProfile}
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenProgressModal={(t) => setProgressTask(t)}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'staff-summary' && (
            <StaffSummaryPage
              users={users}
              tasks={tasks}
              currentUserProfile={userProfile}
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenProgressModal={(t) => setProgressTask(t)}
            />
          )}

          {activeTab === 'programs' && (
            <ProgramsPage
              campaigns={campaigns}
              onSelectCampaign={() => handleSelectTab('campaigns')}
              onCreateCampaignForProgram={(progType) => {
                setDefaultProgramType(progType);
                setShowProgramCampaignModal(true);
              }}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsPage
              campaigns={campaigns}
              tasks={tasks}
              donations={donations}
              users={users}
              currentUserProfile={userProfile}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentsPage
              assessments={assessments}
              currentUserProfile={userProfile}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'fundraising' && (
            <FundraisingPage
              campaigns={campaigns}
              donations={donations}
              onSelectCampaign={() => handleSelectTab('campaigns')}
            />
          )}

          {activeTab === 'crm' && (
            <CRMPage
              donors={donors}
              donations={donations}
              currentUserProfile={userProfile}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'finance' && (
            <FinancePage
              donations={donations}
              campaigns={campaigns}
              donors={donors}
              currentUserProfile={userProfile}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetPage
              campaigns={campaigns}
              currentUserProfile={userProfile}
            />
          )}

          {activeTab === 'implementations' && (
            <ImplementationPage
              campaigns={campaigns}
              currentUserProfile={userProfile}
            />
          )}

          {activeTab === 'content' && (
            <ContentPage
              campaigns={campaigns}
              currentUserProfile={userProfile}
            />
          )}

          {activeTab === 'kpi' && (
            <KPIPage
              users={users}
              currentUserProfile={userProfile}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsPage
              users={users}
              currentUserProfile={userProfile}
              onRefreshTasks={() => refreshProfile()}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              tasks={tasks}
              campaigns={campaigns}
              donations={donations}
              donors={donors}
              users={users}
            />
          )}

          {activeTab === 'users' && (
            <UsersPage
              users={users}
              currentUserProfile={userProfile}
              onRefresh={() => refreshProfile()}
            />
          )}

          {activeTab === 'audit' && <AuditLogPage />}

          {activeTab === 'notifications' && (
            <NotificationsPage onNavigateTask={() => handleSelectTab('tasks')} />
          )}

          {activeTab === 'guide' && <UserGuidePage />}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />

      {/* Global Task Progress Modal */}
      {progressTask && (
        <TaskProgressModal
          isOpen={!!progressTask}
          onClose={() => setProgressTask(null)}
          task={progressTask}
          onSuccess={() => refreshProfile()}
        />
      )}

      {/* Global Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          currentUserProfile={userProfile}
          onOpenProgressModal={(t) => setProgressTask(t)}
          onRefresh={() => refreshProfile()}
        />
      )}

      {/* Global Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Create Campaign for Program Modal */}
      {showProgramCampaignModal && (
        <CampaignFormModal
          isOpen={showProgramCampaignModal}
          onClose={() => setShowProgramCampaignModal(false)}
          defaultProgramType={defaultProgramType}
          users={users}
          currentUserProfile={userProfile}
          onSuccess={() => refreshProfile()}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
