import React, { useState } from 'react';
import { MentorshipRequest, UserRole, StudentProfile, AlumniProfile, MentorshipStatus } from '../types';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Video, 
  ExternalLink, 
  Plus, 
  GraduationCap, 
  Briefcase,
  X
} from 'lucide-react';

interface MentorshipModuleProps {
  currentRole: UserRole;
  student: StudentProfile;
  alumni: AlumniProfile;
  mentorshipRequests: MentorshipRequest[];
  alumniList: AlumniProfile[];
  onOpenMentorshipModal: (preselectedAlumni?: AlumniProfile) => void;
  onAcceptRequest: (requestId: string, note?: string, meetingUrl?: string) => void;
  onDeclineRequest: (requestId: string, note?: string) => void;
}

export const MentorshipModule: React.FC<MentorshipModuleProps> = ({
  currentRole,
  student,
  alumni,
  mentorshipRequests,
  alumniList,
  onOpenMentorshipModal,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<MentorshipStatus | 'all'>('all');
  const [actionModal, setActionModal] = useState<{
    request: MentorshipRequest;
    action: 'accept' | 'decline';
  } | null>(null);

  const [responseNote, setResponseNote] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/mait-session');

  // Filter requests according to active persona:
  const relevantRequests = mentorshipRequests.filter((r) => {
    if (currentRole === 'student') return r.studentId === student.id;
    if (currentRole === 'alumni') return r.alumniId === alumni.id;
    return true; // admin sees all
  });

  const filteredRequests = relevantRequests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleConfirmAction = () => {
    if (!actionModal) return;

    if (actionModal.action === 'accept') {
      onAcceptRequest(actionModal.request.id, responseNote, meetingUrl);
    } else {
      onDeclineRequest(actionModal.request.id, responseNote);
    }

    setActionModal(null);
    setResponseNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with clean white card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
              MAIT CST 1:1 Mentorship Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Direct Senior-Junior Tech Mentorship
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Bridging classroom theory with industry standards. CST students receive 1:1 guidance on resume formulation, mock technical interviews, system design, and tier-1 referrals. Alumni review and Accept or Decline incoming requests.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onOpenMentorshipModal()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request 1:1 Mentorship</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'accepted', label: 'Accepted Sessions' },
            { id: 'declined', label: 'Declined' },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            const count = tab.id === 'all'
              ? relevantRequests.length
              : relevantRequests.filter(r => r.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role specific hint banner */}
      {currentRole === 'student' && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-700">
          <GraduationCap className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900">Student View:</span> You are viewing your mentorship requests. When an alumnus accepts your request, their meeting link and advice notes will appear directly here.
          </div>
        </div>
      )}

      {currentRole === 'alumni' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-700">
          <Briefcase className="w-5 h-5 text-slate-700 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900">Alumni View ({alumni.name}):</span> You have sole authority to <span className="font-semibold text-emerald-700">Accept</span> or <span className="font-semibold text-rose-700">Decline</span> requests from MAIT CST juniors.
          </div>
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No mentorship requests in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {currentRole === 'student'
              ? 'Send a mentorship inquiry to any MAIT CST alumnus in the directory.'
              : 'No incoming mentorship requests matching this filter.'}
          </p>
          {currentRole === 'student' && (
            <button
              onClick={() => onOpenMentorshipModal()}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
            >
              Request Mentorship Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-5 sm:p-6 space-y-4 shadow-xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'pending'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      Topic: <span className="text-blue-700">{req.topic}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {req.studentName} <span className="text-slate-500 font-normal text-xs">({req.studentBranch})</span>
                    <span className="text-slate-400 mx-2">→</span>
                    <span className="text-slate-900 font-semibold">{req.alumniName}</span>
                    <span className="text-slate-500 font-normal text-xs"> ({req.alumniDesignation} at {req.alumniCompany})</span>
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Student CGPA: <span className="text-slate-800 font-medium">{req.studentCgpa}</span> • Preferred Mode: <span className="text-slate-800 font-medium">{req.preferredMode}</span>
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0">
                  Requested on {req.requestedAt.slice(0, 10)}
                </div>
              </div>

              {/* Message from Student */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="text-slate-500 font-semibold block text-[11px] uppercase mb-1">Student's Goals & Inquiries:</span>
                "{req.message}"
              </div>

              {/* Mentor's Response Note if available */}
              {req.responseNote && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  req.status === 'accepted'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                }`}>
                  <span className="font-semibold text-slate-900 block text-[11px] uppercase mb-1">
                    {req.alumniName}'s Response Note:
                  </span>
                  "{req.responseNote}"
                </div>
              )}

              {/* Action / Meeting Room Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  {req.status === 'accepted' && req.meetingUrl && (
                    <a
                      href={req.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-white" />
                      <span>Enter Mentorship Meeting</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {req.status === 'pending' && currentRole === 'student' && (
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Awaiting mentor review. You will receive an alert once accepted.</span>
                    </span>
                  )}
                </div>

                {/* Alumni Sole Action Buttons */}
                {req.status === 'pending' && (currentRole === 'alumni' || currentRole === 'admin') && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => {
                        setActionModal({ request: req, action: 'decline' });
                        setResponseNote('Currently at capacity for new 1:1 mentees this month. Please reach out again next semester!');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 hover:border-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Decline</span>
                    </button>

                    <button
                      onClick={() => {
                        setActionModal({ request: req, action: 'accept' });
                        setResponseNote('Happy to mentor a fellow MAIT CST student! Looking forward to reviewing your resume and roadmap.');
                        setMeetingUrl('https://meet.google.com/mait-session');
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Accept Mentorship</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Accept/Decline */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {actionModal.action === 'accept'
                  ? 'Accept Mentorship Request'
                  : 'Decline Mentorship Request'}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Student: <span className="font-semibold text-slate-900">{actionModal.request.studentName}</span> ({actionModal.request.studentBranch})
              <br />
              Topic: <span className="text-blue-700 font-semibold">{actionModal.request.topic}</span>
            </p>

            {actionModal.action === 'accept' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Meet or Session URL:
                  </label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {actionModal.action === 'accept'
                  ? 'Note to Student:'
                  : 'Reason for Declining:'}
              </label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Write your note..."
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  actionModal.action === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                }`}
              >
                Confirm {actionModal.action === 'accept' ? 'Acceptance' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
