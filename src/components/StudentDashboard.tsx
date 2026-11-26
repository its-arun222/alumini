import React from 'react';
import { StudentProfile, MentorshipRequest, Opportunity, AlumniProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  GraduationCap, 
  Sparkles, 
  Video, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Briefcase, 
  ExternalLink,
  Users,
  Compass,
  Edit3
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  mentorshipRequests: MentorshipRequest[];
  opportunities: Opportunity[];
  alumniList: AlumniProfile[];
  onNavigateTab: (tab: string) => void;
  onRequestMentorship: (alumni: AlumniProfile) => void;
  onOpenEditProfileModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  mentorshipRequests,
  opportunities,
  alumniList,
  onNavigateTab,
  onRequestMentorship,
  onOpenEditProfileModal,
}) => {
  const myRequests = mentorshipRequests.filter((r) => r.studentId === student.id);
  const acceptedRequests = myRequests.filter((r) => r.status === 'accepted');
  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const myRegisteredOpps = opportunities.filter(
    (o) => o.status === 'approved' && o.registeredStudentIds.includes(student.id)
  );

  // Top recommended alumni mentors
  const recommendedMentors = alumniList
    .filter((a) => a.isAvailableForMentoring)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <UserAvatar name={student.name} size="xl" variant="student" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">Student Portal</span>
                <span>·</span>
                <span>Roll: {student.rollNo}</span>
                <span>·</span>
                <span>Sem {student.currentSemester}</span>
                <span>·</span>
                <span className="font-medium text-slate-800">CGPA: {student.cgpa}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {student.name}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                {student.bio || `${student.branch} · Batch ${student.batchYear}`}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {student.skills.slice(0, 6).map((skill) => (
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

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenEditProfileModal}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai-guidance')}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Counselor</span>
            </button>
            <button
              onClick={() => onNavigateTab('directory')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Explore CST Alumni</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards - Clean, Unhighlighted & Readable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide">Active Mentorships</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{acceptedRequests.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            {acceptedRequests.length} confirmed session ready
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingRequests.length}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting mentor decision</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide">Registered Events</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{myRegisteredOpps.length}</div>
          <p className="text-xs text-slate-500 mt-1">Webinars and referral drives</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide">Profile Completeness</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">88%</span>
            <span className="text-xs font-semibold text-emerald-700">Good Standing</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Evaluated by CST metrics</p>
        </div>
      </div>

      {/* Main Grid: Mentorship Tracker & Registered Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mentorship Status Tracker (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  My Mentorship Engagements
                </h2>
                <p className="text-xs text-slate-500">1:1 guidance sessions with MAIT alumni</p>
              </div>
              <button
                onClick={() => onNavigateTab('mentorship')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                <Compass className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">No mentorship requests sent yet.</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with alumni working at Google, Microsoft, Blinkit, and Amazon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            req.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {req.topic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Mentor: <span className="font-semibold text-slate-900">{req.alumniName}</span> · {req.alumniDesignation} at {req.alumniCompany}
                      </p>
                      {req.responseNote && (
                        <p className="text-xs text-slate-700 mt-2 bg-white border border-slate-200 p-2.5 rounded-lg">
                          <span className="font-medium text-slate-900">Mentor's Note:</span> "{req.responseNote}"
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      {req.status === 'accepted' && req.meetingUrl ? (
                        <a
                          href={req.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {req.preferredMode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Opportunities */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Registered Events & Referral Pools
                </h2>
                <p className="text-xs text-slate-500">Opportunities you have RSVP'd or applied to</p>
              </div>
              <button
                onClick={() => onNavigateTab('opportunities')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myRegisteredOpps.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                You haven't registered for any opportunities yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myRegisteredOpps.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-blue-700 uppercase">
                          {opp.type}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Registered
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{opp.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{opp.companyOrOrganizer} · {opp.location}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>Deadline: {opp.deadlineOrDate}</span>
                      <button
                        onClick={() => onNavigateTab('opportunities')}
                        className="text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommended CST Alumni Mentors */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Featured CST Mentors
              </h2>
              <button
                onClick={() => onNavigateTab('directory')}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {recommendedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <UserAvatar name={mentor.name} size="md" variant="alumni" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">{mentor.name}</h4>
                      <p className="text-xs text-slate-600 truncate">{mentor.designation}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {mentor.currentCompany} · CST '{mentor.gradYear.toString().slice(-2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {mentor.bio}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Open for Mentoring
                    </span>
                    <button
                      onClick={() => onRequestMentorship(mentor)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    >
                      Request 1:1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Guidance Callout Card */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>Career Advisory</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Need Placement Advice?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Gemini evaluates your CST academic profile and questions without storing chat history.
            </p>
            <button
              onClick={() => onNavigateTab('ai-guidance')}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Ask AI Career Counselor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
