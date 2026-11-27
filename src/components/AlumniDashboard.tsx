import React, { useState } from 'react';
import { AlumniProfile, MentorshipRequest, Opportunity, SuccessStory } from '../types';
import { UserAvatar } from './UserAvatar';
import { SuccessStoriesSection } from './SuccessStoriesSection';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ShieldCheck, 
  Edit3, 
  Video,
  X
} from 'lucide-react';

interface AlumniDashboardProps {
  alumni: AlumniProfile;
  mentorshipRequests: MentorshipRequest[];
  opportunities: Opportunity[];
  successStories: SuccessStory[];
  onAcceptRequest: (requestId: string, note?: string, meetingUrl?: string) => void;
  onDeclineRequest: (requestId: string, note?: string) => void;
  onOpenPostModal: () => void;
  onOpenProfileUpdateModal: () => void;
  onOpenSuccessStoryModal: () => void;
  onToggleMentorshipAvailability: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AlumniDashboard: React.FC<AlumniDashboardProps> = ({
  alumni,
  mentorshipRequests,
  opportunities,
  successStories,
  onAcceptRequest,
  onDeclineRequest,
  onOpenPostModal,
  onOpenProfileUpdateModal,
  onOpenSuccessStoryModal,
  onToggleMentorshipAvailability,
}) => {
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<{
    request: MentorshipRequest;
    action: 'accept' | 'decline';
  } | null>(null);

  const [responseNote, setResponseNote] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/mait-session');

  // Filter requests directed to this alumni
  const myRequests = mentorshipRequests.filter((r) => r.alumniId === alumni.id);
  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const pastRequests = myRequests.filter((r) => r.status !== 'pending');

  // Opportunities posted by this alumni
  const myPostings = opportunities.filter((o) => o.posterId === alumni.id);

  const handleConfirmAction = () => {
    if (!selectedRequestForAction) return;

    if (selectedRequestForAction.action === 'accept') {
      onAcceptRequest(selectedRequestForAction.request.id, responseNote, meetingUrl);
    } else {
      onDeclineRequest(selectedRequestForAction.request.id, responseNote);
    }

    setSelectedRequestForAction(null);
    setResponseNote('');
  };

  return (
    <div className="space-y-6">
      {/* Alumni Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <UserAvatar name={alumni.name} size="xl" variant="alumni" />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-slate-500">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  MAIT CST Alumnus
                </span>
                <span>·</span>
                <span>Class of {alumni.gradYear}</span>
                <span>·</span>
                <span>{alumni.location}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {alumni.name}
              </h1>
              <p className="text-sm font-medium text-slate-700 mt-0.5">
                {alumni.designation} at <span className="font-semibold text-slate-900">{alumni.currentCompany}</span>
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {alumni.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {alumni.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Mentoring Status */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <button
              onClick={onToggleMentorshipAvailability}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                alumni.isAvailableForMentoring
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  alumni.isAvailableForMentoring ? 'bg-emerald-600' : 'bg-slate-400'
                }`}
              />
              <span>{alumni.isAvailableForMentoring ? 'Open for 1:1 Mentoring' : 'Mentoring Paused'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfileUpdateModal}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Update Profile</span>
              </button>
              <button
                onClick={onOpenPostModal}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Opportunity</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Pending Student Requests
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingRequests.length}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting your Accept or Decline decision</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Total Students Mentored
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {alumni.totalMentored + pastRequests.filter(r => r.status === 'accepted').length}
          </div>
          <p className="text-xs text-slate-500 mt-1">MAIT CST juniors guided</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            My Opportunities Posted
          </div>
          <div className="text-2xl font-bold text-slate-900">{myPostings.length}</div>
          <p className="text-xs text-slate-500 mt-1">Jobs, webinars, or referral drives</p>
        </div>
      </div>

      {/* Main Mentorship Inbox & Posted Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mentorship Requests Inbox (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Incoming Mentorship Requests
                </h2>
                <p className="text-xs text-slate-500">
                  Review and Accept or Decline incoming student requests.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                {pendingRequests.length} Action Needed
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-sm font-semibold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-500 mt-0.5">No pending student requests awaiting your review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{req.studentName}</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {req.studentBranch}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          CGPA: <span className="font-semibold text-slate-800">{req.studentCgpa}</span> · Requested Mode: <span className="text-slate-700 font-medium">{req.preferredMode}</span>
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-700 border border-slate-200 text-xs font-medium">
                        <span>Topic: {req.topic}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 text-xs text-slate-700 leading-relaxed border border-slate-200">
                      <p className="text-slate-500 text-[11px] font-semibold uppercase mb-1">Student's Message:</p>
                      "{req.message}"
                    </div>

                    {/* Alumni Sole Action: Accept or Decline */}
                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => {
                          setSelectedRequestForAction({ request: req, action: 'decline' });
                          setResponseNote('Currently at capacity for new 1:1 mentees this month. Please reach out again next semester!');
                        }}
                        className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRequestForAction({ request: req, action: 'accept' });
                          setResponseNote('Great to connect with a fellow MAITian! Happy to help you with your preparation.');
                          setMeetingUrl('https://meet.google.com/mait-session');
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Mentorship</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Resolved Mentorship Requests */}
          {pastRequests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3">Past & Active Mentees</h3>
              <div className="space-y-2.5">
                {pastRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{req.studentName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            req.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{req.topic}</p>
                    </div>

                    {req.status === 'accepted' && req.meetingUrl && (
                      <a
                        href={req.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Meeting Link</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Opportunities Posted by this Alumni */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>My Opportunities</span>
              </h2>
              <button
                onClick={onOpenPostModal}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Post new job or webinar"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {myPostings.length === 0 ? (
              <div className="text-center py-6 text-slate-500 border border-dashed border-slate-200 rounded-xl text-xs">
                <p>You haven't posted any jobs or webinars yet.</p>
                <button
                  onClick={onOpenPostModal}
                  className="mt-2 text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  + Post your company's referral
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myPostings.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {opp.type}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded uppercase ${
                          opp.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : opp.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {opp.status === 'pending' ? 'Pending Admin' : opp.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">{opp.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opp.companyOrOrganizer}</p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{opp.registeredStudentIds.length} Applicants</span>
                      <span>{opp.mode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips for MAIT Alumni */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>MAIT Alumni Mentorship Charter</span>
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              By reviewing requests, you help CST juniors navigate off-campus technical loops, resume reviews, and portfolio architecture. Postings are vetted by faculty moderation before going live.
            </p>
          </div>
        </div>
      </div>

      {/* MAIT CST Student & Alumni Success Stories Highlight Cards */}
      <SuccessStoriesSection
        stories={successStories}
        currentRole="alumni"
        currentAuthorName={alumni.name}
        onOpenSubmitModal={onOpenSuccessStoryModal}
      />

      {/* Confirmation Modal for Accept/Decline */}
      {selectedRequestForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-xl text-slate-900">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {selectedRequestForAction.action === 'accept'
                  ? 'Accept Mentorship Request'
                  : 'Decline Mentorship Request'}
              </h3>
              <button
                onClick={() => setSelectedRequestForAction(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Student: <span className="font-semibold text-slate-900">{selectedRequestForAction.request.studentName}</span> ({selectedRequestForAction.request.studentBranch})
              <br />
              Topic: <span className="font-medium text-slate-900">{selectedRequestForAction.request.topic}</span>
            </p>

            {selectedRequestForAction.action === 'accept' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Google Meet or Session URL:
                  </label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {selectedRequestForAction.action === 'accept'
                  ? 'Message to Student (Optional Note):'
                  : 'Reason for Declining (Sent to Student):'}
              </label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Write a brief response..."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedRequestForAction(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors ${
                  selectedRequestForAction.action === 'accept'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                Confirm {selectedRequestForAction.action === 'accept' ? 'Acceptance' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
