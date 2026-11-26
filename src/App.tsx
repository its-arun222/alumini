import React, { useEffect, useState } from 'react';
import { 
  UserRole, 
  StudentProfile, 
  AlumniProfile, 
  Opportunity, 
  MentorshipRequest, 
  PendingProfileUpdate 
} from './types';
import { 
  CURRENT_STUDENT, 
  ALUMNI_DATA, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_MENTORSHIP_REQUESTS, 
  INITIAL_PENDING_UPDATES 
} from './data/mockData';
import { 
  createMentorshipRequest, 
  acceptMentorshipRequest, 
  declineMentorshipRequest, 
  toggleOpportunityRegistration,
  moderateOpportunity,
  moderateProfileUpdate,
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

import { fetchState, persistChanges } from './lib/api';

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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [student, setStudent] = useState<StudentProfile>(CURRENT_STUDENT);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>(ALUMNI_DATA);
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>('alumni-priya-goel');

  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(INITIAL_MENTORSHIP_REQUESTS);
  const [pendingUpdates, setPendingUpdates] = useState<PendingProfileUpdate[]>(INITIAL_PENDING_UPDATES);

  // Load persisted data from the database (falls back to bundled mock data if unavailable)
  useEffect(() => {
    fetchState().then((s) => {
      if (!s) return;
      if (s.student) setStudent(s.student);
      setAlumniList(s.alumniList);
      setOpportunities(s.opportunities);
      setMentorshipRequests(s.mentorshipRequests);
      setPendingUpdates(s.pendingUpdates);
      if (s.alumniList.length && !s.alumniList.some((a) => a.id === 'alumni-priya-goel')) {
        setSelectedAlumniId(s.alumniList[0].id);
      }
    });
  }, []);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
  const [preselectedAlumni, setPreselectedAlumni] = useState<AlumniProfile | null>(null);
  const [isPostOpportunityModalOpen, setIsPostOpportunityModalOpen] = useState(false);
  const [isProfileUpdateModalOpen, setIsProfileUpdateModalOpen] = useState(false);
  const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeAlumni = alumniList.find((a) => a.id === selectedAlumniId) || alumniList[0];

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

  // Handlers
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

  const handleSubmitMentorshipRequest = (data: any) => {
    if (!canRequestMentorship(currentRole)) return;
    const updated = createMentorshipRequest(mentorshipRequests, data);
    setMentorshipRequests(updated);
    persistChanges('mentorshipRequests', mentorshipRequests, updated);
    showToast(`Mentorship request submitted to ${data.alumniName}! Check status in Mentorship Hub.`);
  };

  const handleAcceptMentorship = (requestId: string, note?: string, meetingUrl?: string) => {
    if (!canRespondToMentorship(currentRole)) return;
    const updated = acceptMentorshipRequest(mentorshipRequests, requestId, note, meetingUrl);
    setMentorshipRequests(updated);
    persistChanges('mentorshipRequests', mentorshipRequests, updated);
    showToast('Mentorship request accepted! Meeting details shared with student.');
  };

  const handleDeclineMentorship = (requestId: string, note?: string) => {
    if (!canRespondToMentorship(currentRole)) return;
    const updated = declineMentorshipRequest(mentorshipRequests, requestId, note);
    setMentorshipRequests(updated);
    persistChanges('mentorshipRequests', mentorshipRequests, updated);
    showToast('Mentorship request declined. Notification sent to student.');
  };

  const handleToggleRegistration = (opportunityId: string) => {
    if (!canRegisterForOpportunity(currentRole)) return;
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp || opp.status !== 'approved') return;
    const wasRegistered = opp.registeredStudentIds.includes(student.id);

    const updated = toggleOpportunityRegistration(opportunities, opportunityId, student.id);
    setOpportunities(updated);
    persistChanges('opportunities', opportunities, updated);

    if (wasRegistered) {
      showToast('Registration cancelled.');
    } else {
      showToast(`Successfully registered for ${opp.title}! Added to your dashboard.`);
    }
  };

  const handleOpenPostOpportunityModal = () => {
    if (!canPostOpportunity(currentRole)) return;
    setIsPostOpportunityModalOpen(true);
  };

  const handlePostOpportunity = (newOpp: Opportunity) => {
    if (!canPostOpportunity(currentRole)) return;
    const enforcedOpp: Opportunity = {
      ...newOpp,
      postedByRole: currentRole,
      status: getOpportunityStatusForRole(currentRole),
    };
    setOpportunities((prev) => [enforcedOpp, ...prev]);
    persistChanges('opportunities', [], [enforcedOpp]);
    if (enforcedOpp.status === 'approved') {
      showToast('Opportunity published live to the feed!');
    } else {
      showToast('Opportunity submitted for Admin Moderation review.');
    }
  };

  const handleModerateOpportunity = (opportunityId: string, action: 'approved' | 'rejected') => {
    if (!canAccessAdminModeration(currentRole)) return;
    const updated = moderateOpportunity(opportunities, opportunityId, action);
    setOpportunities(updated);
    persistChanges('opportunities', opportunities, updated);
    showToast(`Opportunity marked as ${action.toUpperCase()}`);
  };

  const handleModerateProfileUpdate = (
    updateId: string,
    action: 'approved' | 'rejected',
    remark?: string
  ) => {
    if (!canAccessAdminModeration(currentRole)) return;
    const { updatedPendingUpdates, updatedAlumniList } = moderateProfileUpdate(
      pendingUpdates,
      alumniList,
      updateId,
      action,
      remark
    );
    setPendingUpdates(updatedPendingUpdates);
    setAlumniList(updatedAlumniList);
    persistChanges('pendingUpdates', pendingUpdates, updatedPendingUpdates);
    persistChanges('alumni', alumniList, updatedAlumniList);
    showToast(`Alumni profile update marked as ${action.toUpperCase()} and synced to Directory`);
  };

  const handleToggleMentorshipAvailability = () => {
    if (!canRequestAlumniProfileUpdate(currentRole)) return;
    const nextState = !activeAlumni.isAvailableForMentoring;
    const updated = { ...activeAlumni, isAvailableForMentoring: nextState };
    setAlumniList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    persistChanges('alumni', [activeAlumni], [updated]);
    showToast(`Mentoring status set to: ${nextState ? 'Open for 1:1 Mentoring' : 'Mentoring Paused'}`);
  };

  const handleOpenProfileUpdateModal = () => {
    if (!canRequestAlumniProfileUpdate(currentRole)) return;
    setIsProfileUpdateModalOpen(true);
  };

  const handleSubmitProfileUpdate = (newUpdate: PendingProfileUpdate) => {
    if (!canRequestAlumniProfileUpdate(currentRole)) return;
    const enforcedUpdate: PendingProfileUpdate = { ...newUpdate, status: 'pending' };
    setPendingUpdates((prev) => [enforcedUpdate, ...prev]);
    persistChanges('pendingUpdates', [], [enforcedUpdate]);
    showToast('Profile update submitted to MAIT CST Admin for review!');
  };

  const handleOpenStudentProfileModal = () => {
    if (!canEditStudentProfile(currentRole)) return;
    setIsStudentProfileModalOpen(true);
  };

  const handleUpdateStudentProfile = (updatedStudent: StudentProfile) => {
    if (!canEditStudentProfile(currentRole)) return;
    const prevStudent = student;
    setStudent(updatedStudent);
    persistChanges('students', [prevStudent], [updatedStudent]);
    showToast('Student profile updated successfully!');
  };

  // If user is not yet logged in, show the institutional password authentication page
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
          showToast('Logged out of MAIT Connect session.');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xl ring-1 ring-slate-900/5 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                opportunities={opportunities}
                pendingUpdates={pendingUpdates}
                alumniList={alumniList}
                mentorshipRequests={mentorshipRequests}
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

        {/* View 6: Dedicated Admin Moderation Console (Admin only) */}
        {activeTab === 'admin-moderation' && canAccessAdminModeration(currentRole) && (
          <AdminDashboard
            opportunities={opportunities}
            pendingUpdates={pendingUpdates}
            alumniList={alumniList}
            mentorshipRequests={mentorshipRequests}
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
            <span>Training & Placement Cell</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-semibold">Stateless Gemini Advisory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
