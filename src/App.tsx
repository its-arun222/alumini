import React, { useCallback, useEffect, useState } from 'react';
import {
  UserRole,
  StudentProfile,
  AlumniProfile,
  Opportunity,
  MentorshipRequest,
  PendingProfileUpdate,
} from './types';
import {
  canPostOpportunity,
  canRegisterForOpportunity,
  canRequestMentorship,
  canRespondToMentorship,
  canAccessAdminModeration,
  canUseAiCareerGuidance,
  canEditStudentProfile,
  canRequestAlumniProfileUpdate,
  canAccessTab,
  getOpportunityStatusForRole,
} from './utils/alumni-ecosystem';
import {
  DbActivityEntry,
  ensureFirestoreSeeded,
  fetchAllCollectionsFromServer,
  subscribeAllCollections,
  subscribeDbActivity,
  clearDbActivityLog,
  updateStudentProfileInFirestore,
  createOpportunityInFirestore,
  moderateOpportunityInFirestore,
  toggleOpportunityRegistrationInFirestore,
  createMentorshipRequestInFirestore,
  respondToMentorshipRequestInFirestore,
  toggleAlumniAvailabilityInFirestore,
  createPendingProfileUpdateInFirestore,
  moderateProfileUpdateInFirestore,
} from './lib/firestoreService';

import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AlumniDashboard } from './components/AlumniDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AlumniDirectory } from './components/AlumniDirectory';
import { EventsOpportunitiesBoard } from './components/EventsOpportunitiesBoard';
import { MentorshipModule } from './components/MentorshipModule';
import { AiCareerGuidance } from './components/AiCareerGuidance';
import { MentorshipRequestModal } from './components/MentorshipRequestModal';
import { PostOpportunityModal } from './components/PostOpportunityModal';
import { RequestProfileUpdateModal } from './components/RequestProfileUpdateModal';
import { EditStudentProfileModal } from './components/EditStudentProfileModal';
import { Database, AlertTriangle, RefreshCw } from 'lucide-react';

const SESSION_KEY = 'mait_connect_ui_session_v1';

interface UiSession {
  isLoggedIn: boolean;
  currentRole: UserRole;
  activeTab: string;
}

function readUiSession(): UiSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { isLoggedIn: false, currentRole: 'student', activeTab: 'dashboard' };
    const parsed = JSON.parse(raw) as Partial<UiSession>;
    const role: UserRole =
      parsed.currentRole === 'alumni' || parsed.currentRole === 'admin'
        ? parsed.currentRole
        : 'student';
    const tab =
      typeof parsed.activeTab === 'string' && canAccessTab(role, parsed.activeTab)
        ? parsed.activeTab
        : 'dashboard';
    return {
      isLoggedIn: Boolean(parsed.isLoggedIn),
      currentRole: role,
      activeTab: tab,
    };
  } catch {
    return { isLoggedIn: false, currentRole: 'student', activeTab: 'dashboard' };
  }
}

export default function App() {
  const initialSession = readUiSession();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialSession.isLoggedIn);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialSession.currentRole);
  const [activeTab, setActiveTab] = useState<string>(initialSession.activeTab);

  // Live Firestore collections (zero local/mock fallback state)
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>('alumni-priya-goel');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<PendingProfileUpdate[]>([]);

  // Firestore hydration & live activity state
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRefreshingDb, setIsRefreshingDb] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<DbActivityEntry[]>([]);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
  const [preselectedAlumni, setPreselectedAlumni] = useState<AlumniProfile | null>(null);
  const [isPostOpportunityModalOpen, setIsPostOpportunityModalOpen] = useState(false);
  const [isProfileUpdateModalOpen, setIsProfileUpdateModalOpen] = useState(false);
  const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((curr) => (curr === msg ? null : curr)), 4000);
  }, []);

  // Persist UI persona/tab across page reloads (no database data stored locally)
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ isLoggedIn, currentRole, activeTab })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [isLoggedIn, currentRole, activeTab]);

  // Subscribe to live Firestore activity log
  useEffect(() => {
    return subscribeDbActivity((entries) => {
      setActivityLog(entries);
    });
  }, []);

  // Initialize Firestore: seed empty collections once, then subscribe live
  useEffect(() => {
    let unsubscribeAll: (() => void) | null = null;
    let isMounted = true;

    async function bootstrapFirestore() {
      setIsDbLoading(true);
      setDbError(null);
      try {
        await ensureFirestoreSeeded();
        if (!isMounted) return;

        // Initial server fetch so first render is guaranteed live from Cloud Firestore
        const snapshot = await fetchAllCollectionsFromServer();
        if (!isMounted) return;

        setStudents(snapshot.students);
        setAlumniList(snapshot.alumni);
        setOpportunities(snapshot.opportunities);
        setMentorshipRequests(snapshot.mentorship_requests);
        setPendingUpdates(snapshot.pending_profile_updates);
        setLastSyncedAt(new Date().toISOString());

        if (
          snapshot.alumni.length > 0 &&
          !snapshot.alumni.some((a) => a.id === 'alumni-priya-goel')
        ) {
          setSelectedAlumniId(snapshot.alumni[0].id);
        }

        // Attach real-time onSnapshot listeners across all 5 collections
        unsubscribeAll = subscribeAllCollections({
          onStudents: (items) => {
            if (!isMounted) return;
            setStudents(items);
            setLastSyncedAt(new Date().toISOString());
          },
          onAlumni: (items) => {
            if (!isMounted) return;
            setAlumniList(items);
            setLastSyncedAt(new Date().toISOString());
          },
          onOpportunities: (items) => {
            if (!isMounted) return;
            setOpportunities(items);
            setLastSyncedAt(new Date().toISOString());
          },
          onMentorshipRequests: (items) => {
            if (!isMounted) return;
            setMentorshipRequests(items);
            setLastSyncedAt(new Date().toISOString());
          },
          onPendingUpdates: (items) => {
            if (!isMounted) return;
            setPendingUpdates(items);
            setLastSyncedAt(new Date().toISOString());
          },
          onError: (err) => {
            if (!isMounted) return;
            setDbError(err.message);
          },
        });
      } catch (err: any) {
        if (!isMounted) return;
        setDbError(err?.message || 'Failed to connect to Cloud Firestore.');
      } finally {
        if (isMounted) setIsDbLoading(false);
      }
    }

    void bootstrapFirestore();

    return () => {
      isMounted = false;
      if (unsubscribeAll) unsubscribeAll();
    };
  }, []);

  const handleRefreshDatabase = useCallback(async () => {
    setIsRefreshingDb(true);
    try {
      const snapshot = await fetchAllCollectionsFromServer();
      setStudents(snapshot.students);
      setAlumniList(snapshot.alumni);
      setOpportunities(snapshot.opportunities);
      setMentorshipRequests(snapshot.mentorship_requests);
      setPendingUpdates(snapshot.pending_profile_updates);
      setLastSyncedAt(new Date().toISOString());
      showToast('Synced all 5 collections live from Cloud Firestore.');
    } catch (err: any) {
      setDbError(err?.message || 'Failed to refresh from Cloud Firestore.');
    } finally {
      setIsRefreshingDb(false);
    }
  }, [showToast]);

  const student = students[0] || null;
  const activeAlumni =
    alumniList.find((a) => a.id === selectedAlumniId) || alumniList[0] || null;

  const pendingModerationCount =
    opportunities.filter((o) => o.status === 'pending').length +
    pendingUpdates.filter((u) => u.status === 'pending').length;

  // Role-guarded navigation
  const handleNavigateTab = (tab: string) => {
    if (!canAccessTab(currentRole, tab)) {
      setActiveTab('dashboard');
      return;
    }
    setActiveTab(tab);
  };

  // Role-guarded handlers backed directly by Firestore
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setIsMentorshipModalOpen(false);
    setIsPostOpportunityModalOpen(false);
    setIsProfileUpdateModalOpen(false);
    setIsStudentProfileModalOpen(false);
    setPreselectedAlumni(null);
    if (!canAccessTab(role, activeTab)) {
      setActiveTab('dashboard');
    }
    showToast(`Switched portal persona to ${role.toUpperCase()}`);
  };

  const handleOpenMentorshipForAlumni = (alumniTarget?: AlumniProfile) => {
    if (!canRequestMentorship(currentRole)) return;
    setPreselectedAlumni(alumniTarget || null);
    setIsMentorshipModalOpen(true);
  };

  const handleSubmitMentorshipRequest = async (data: any) => {
    if (!canRequestMentorship(currentRole)) return;
    const newReq: MentorshipRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...data,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    try {
      await createMentorshipRequestInFirestore(newReq);
      showToast(`Mentorship request saved to Firestore for ${data.alumniName}!`);
    } catch (err: any) {
      showToast(`Firestore write failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleAcceptMentorship = async (
    requestId: string,
    note?: string,
    meetingUrl?: string
  ) => {
    if (!canRespondToMentorship(currentRole)) return;
    const target = mentorshipRequests.find((r) => r.id === requestId);
    try {
      await respondToMentorshipRequestInFirestore(
        requestId,
        'accepted',
        note,
        meetingUrl,
        target?.studentName
      );
      showToast('Mentorship request accepted & saved to Firestore.');
    } catch (err: any) {
      showToast(`Firestore update failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDeclineMentorship = async (requestId: string, note?: string) => {
    if (!canRespondToMentorship(currentRole)) return;
    const target = mentorshipRequests.find((r) => r.id === requestId);
    try {
      await respondToMentorshipRequestInFirestore(
        requestId,
        'declined',
        note,
        undefined,
        target?.studentName
      );
      showToast('Mentorship request declined & saved to Firestore.');
    } catch (err: any) {
      showToast(`Firestore update failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleToggleRegistration = async (opportunityId: string) => {
    if (!canRegisterForOpportunity(currentRole) || !student) return;
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp || opp.status !== 'approved') return;

    const wasRegistered = opp.registeredStudentIds.includes(student.id);
    const updatedIds = wasRegistered
      ? opp.registeredStudentIds.filter((id) => id !== student.id)
      : [...opp.registeredStudentIds, student.id];

    try {
      await toggleOpportunityRegistrationInFirestore(
        opportunityId,
        updatedIds,
        opp.title,
        !wasRegistered
      );
      if (wasRegistered) {
        showToast('Registration cancelled in Firestore.');
      } else {
        showToast(`Successfully registered for ${opp.title}! Saved to Firestore.`);
      }
    } catch (err: any) {
      showToast(`Firestore registration failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleOpenPostOpportunityModal = () => {
    if (!canPostOpportunity(currentRole)) return;
    setIsPostOpportunityModalOpen(true);
  };

  const handlePostOpportunity = async (newOpp: Opportunity) => {
    if (!canPostOpportunity(currentRole)) return;
    const enforcedOpp: Opportunity = {
      ...newOpp,
      postedByRole: currentRole,
      status: getOpportunityStatusForRole(currentRole),
    };
    try {
      await createOpportunityInFirestore(enforcedOpp);
      if (enforcedOpp.status === 'approved') {
        showToast('Opportunity published live to Firestore!');
      } else {
        showToast('Opportunity saved to Firestore as pending for Admin Moderation.');
      }
    } catch (err: any) {
      showToast(`Failed to post opportunity: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleModerateOpportunity = async (
    opportunityId: string,
    action: 'approved' | 'rejected'
  ) => {
    if (!canAccessAdminModeration(currentRole)) return;
    const target = opportunities.find((o) => o.id === opportunityId);
    try {
      await moderateOpportunityInFirestore(opportunityId, action, target?.title);
      showToast(`Opportunity marked as ${action.toUpperCase()} in Firestore.`);
    } catch (err: any) {
      showToast(`Moderation write failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleModerateProfileUpdate = async (
    updateId: string,
    action: 'approved' | 'rejected',
    remark?: string
  ) => {
    if (!canAccessAdminModeration(currentRole)) return;
    const targetUpdate = pendingUpdates.find((u) => u.id === updateId);
    if (!targetUpdate) return;
    const targetAlumni = alumniList.find((a) => a.id === targetUpdate.alumniId);
    try {
      await moderateProfileUpdateInFirestore(targetUpdate, targetAlumni, action, remark);
      showToast(`Alumni profile update marked as ${action.toUpperCase()} & synced in Firestore.`);
    } catch (err: any) {
      showToast(`Profile moderation failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleToggleMentorshipAvailability = async () => {
    if (!canRequestAlumniProfileUpdate(currentRole) || !activeAlumni) return;
    const nextState = !activeAlumni.isAvailableForMentoring;
    try {
      await toggleAlumniAvailabilityInFirestore(activeAlumni.id, nextState, activeAlumni.name);
      showToast(
        `Mentoring status saved to Firestore: ${
          nextState ? 'Open for 1:1 Mentoring' : 'Mentoring Paused'
        }`
      );
    } catch (err: any) {
      showToast(`Update failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleOpenProfileUpdateModal = () => {
    if (!canRequestAlumniProfileUpdate(currentRole)) return;
    setIsProfileUpdateModalOpen(true);
  };

  const handleSubmitProfileUpdate = async (newUpdate: PendingProfileUpdate) => {
    if (!canRequestAlumniProfileUpdate(currentRole)) return;
    const enforcedUpdate: PendingProfileUpdate = { ...newUpdate, status: 'pending' };
    try {
      await createPendingProfileUpdateInFirestore(enforcedUpdate);
      showToast('Profile update request saved to Firestore for Admin review!');
    } catch (err: any) {
      showToast(`Profile update failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleOpenStudentProfileModal = () => {
    if (!canEditStudentProfile(currentRole)) return;
    setIsStudentProfileModalOpen(true);
  };

  const handleUpdateStudentProfile = async (updatedStudent: StudentProfile) => {
    if (!canEditStudentProfile(currentRole)) return;
    try {
      await updateStudentProfileInFirestore(updatedStudent);
      showToast('Student profile saved to Cloud Firestore!');
    } catch (err: any) {
      showToast(`Failed to save profile: ${err?.message || 'Unknown error'}`);
    }
  };

  // If user is not yet logged in, show the institutional authentication page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(role) => {
          setCurrentRole(role);
          setIsLoggedIn(true);
          setActiveTab('dashboard');
          showToast(`Authenticated as ${role.toUpperCase()} in MAIT Connect`);
        }}
      />
    );
  }

  // Real Firestore loading / error states (no fake local fallback)
  if (isDbLoading || !student || !activeAlumni) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 shadow-xs text-center space-y-4">
          {dbError ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h1 className="text-base font-bold text-slate-900">
                Cloud Firestore Connection Error
              </h1>
              <p className="text-xs text-slate-600 break-words bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono">
                {dbError}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-base font-bold text-slate-900">
                Connecting to MAIT Cloud Firestore
              </h1>
              <p className="text-xs text-slate-500">
                Loading live records across students, alumni, opportunities, mentorship requests, and moderation queues...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        student={student}
        alumni={activeAlumni}
        pendingModerationCount={pendingModerationCount}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onLogout={() => {
          setIsLoggedIn(false);
          try {
            sessionStorage.removeItem(SESSION_KEY);
          } catch {
            // ignore
          }
          showToast('Logged out of MAIT Connect session.');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xl ring-1 ring-slate-900/5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {dbError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
            <span className="font-medium">Firestore Error: {dbError}</span>
            <button
              type="button"
              onClick={() => setDbError(null)}
              className="font-semibold underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View 1: Dashboard (Role adaptive) */}
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'student' && (
              <StudentDashboard
                student={student}
                mentorshipRequests={mentorshipRequests}
                opportunities={opportunities}
                alumniList={alumniList}
                onNavigateTab={handleNavigateTab}
                onRequestMentorship={handleOpenMentorshipForAlumni}
                onOpenEditProfileModal={handleOpenStudentProfileModal}
              />
            )}

            {currentRole === 'alumni' && (
              <AlumniDashboard
                alumni={activeAlumni}
                mentorshipRequests={mentorshipRequests}
                opportunities={opportunities}
                onAcceptRequest={handleAcceptMentorship}
                onDeclineRequest={handleDeclineMentorship}
                onOpenPostModal={handleOpenPostOpportunityModal}
                onOpenProfileUpdateModal={handleOpenProfileUpdateModal}
                onToggleMentorshipAvailability={handleToggleMentorshipAvailability}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {currentRole === 'admin' && (
              <AdminDashboard
                students={students}
                opportunities={opportunities}
                pendingUpdates={pendingUpdates}
                alumniList={alumniList}
                mentorshipRequests={mentorshipRequests}
                activityLog={activityLog}
                lastSyncedAt={lastSyncedAt}
                isRefreshingDb={isRefreshingDb}
                onRefreshDatabase={handleRefreshDatabase}
                onClearActivityLog={clearDbActivityLog}
                onModerateOpportunity={handleModerateOpportunity}
                onModerateProfileUpdate={handleModerateProfileUpdate}
                onNavigateTab={handleNavigateTab}
              />
            )}
          </>
        )}

        {/* View 2: Searchable Alumni Directory */}
        {activeTab === 'directory' && (
          <AlumniDirectory
            alumniList={alumniList}
            currentRole={currentRole}
            onRequestMentorship={handleOpenMentorshipForAlumni}
          />
        )}

        {/* View 3: Combined Events & Opportunities Board */}
        {activeTab === 'opportunities' && (
          <EventsOpportunitiesBoard
            opportunities={opportunities}
            currentRole={currentRole}
            student={student}
            onToggleRegistration={handleToggleRegistration}
            onOpenPostModal={handleOpenPostOpportunityModal}
          />
        )}

        {/* View 4: Mentorship Request Hub */}
        {activeTab === 'mentorship' && (
          <MentorshipModule
            currentRole={currentRole}
            student={student}
            alumni={activeAlumni}
            mentorshipRequests={mentorshipRequests}
            alumniList={alumniList}
            onOpenMentorshipModal={handleOpenMentorshipForAlumni}
            onAcceptRequest={handleAcceptMentorship}
            onDeclineRequest={handleDeclineMentorship}
          />
        )}

        {/* View 5: Stateless AI Career Guidance Chatbot (Student only) */}
        {activeTab === 'ai-guidance' && canUseAiCareerGuidance(currentRole) && (
          <AiCareerGuidance
            student={student}
            alumniList={alumniList}
            onRequestMentorship={handleOpenMentorshipForAlumni}
          />
        )}

        {/* View 6: Dedicated Admin Moderation & Live Database Console (Admin only) */}
        {activeTab === 'admin-moderation' && canAccessAdminModeration(currentRole) && (
          <AdminDashboard
            students={students}
            opportunities={opportunities}
            pendingUpdates={pendingUpdates}
            alumniList={alumniList}
            mentorshipRequests={mentorshipRequests}
            activityLog={activityLog}
            lastSyncedAt={lastSyncedAt}
            isRefreshingDb={isRefreshingDb}
            onRefreshDatabase={handleRefreshDatabase}
            onClearActivityLog={clearDbActivityLog}
            onModerateOpportunity={handleModerateOpportunity}
            onModerateProfileUpdate={handleModerateProfileUpdate}
            onNavigateTab={handleNavigateTab}
          />
        )}
      </main>

      {/* Role Selection Modal */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        student={student}
        alumniList={alumniList}
        selectedAlumniId={selectedAlumniId}
        onSelectAlumniId={setSelectedAlumniId}
      />

      {/* Mentorship Request Modal (Student only) */}
      {canRequestMentorship(currentRole) && (
        <MentorshipRequestModal
          isOpen={isMentorshipModalOpen}
          onClose={() => {
            setIsMentorshipModalOpen(false);
            setPreselectedAlumni(null);
          }}
          currentRole={currentRole}
          student={student}
          alumniList={alumniList}
          initialAlumni={preselectedAlumni}
          onSubmitRequest={handleSubmitMentorshipRequest}
        />
      )}

      {/* Post Opportunity Modal (Alumni & Admin only) */}
      {canPostOpportunity(currentRole) && (
        <PostOpportunityModal
          key={`${currentRole}-${activeAlumni.id}`}
          isOpen={isPostOpportunityModalOpen}
          onClose={() => setIsPostOpportunityModalOpen(false)}
          currentRole={currentRole}
          alumni={activeAlumni}
          onPostSuccess={handlePostOpportunity}
        />
      )}

      {/* Request Profile Update Modal (Alumni only) */}
      {canRequestAlumniProfileUpdate(currentRole) && (
        <RequestProfileUpdateModal
          isOpen={isProfileUpdateModalOpen}
          onClose={() => setIsProfileUpdateModalOpen(false)}
          alumni={activeAlumni}
          onSubmitUpdate={handleSubmitProfileUpdate}
        />
      )}

      {/* Edit Student Profile Modal (Student only) */}
      {canEditStudentProfile(currentRole) && (
        <EditStudentProfileModal
          isOpen={isStudentProfileModalOpen}
          onClose={() => setIsStudentProfileModalOpen(false)}
          student={student}
          onSaveProfile={handleUpdateStudentProfile}
        />
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-bold mb-1">
              <span>Maharaja Agrasen Institute of Technology (MAIT)</span>
              <span className="text-slate-300">•</span>
              <span>CST Department</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              PSP Area, Sector 22, Rohini, Delhi, 110086 • Affiliated with Guru Gobind Singh Indraprastha University (GGSIPU)
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>MAIT Alumni Relations Cell</span>
            <span className="text-slate-300">•</span>
            <span>Cloud Firestore Backed</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-semibold">Stateless Gemini Advisory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
