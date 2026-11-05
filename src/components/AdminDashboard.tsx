import React, { useState } from 'react';
import { Opportunity, PendingProfileUpdate, AlumniProfile, MentorshipRequest } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Briefcase, 
  UserCheck, 
  Users, 
  Check, 
  X,
  FileText,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  opportunities: Opportunity[];
  pendingUpdates: PendingProfileUpdate[];
  alumniList: AlumniProfile[];
  mentorshipRequests: MentorshipRequest[];
  onModerateOpportunity: (opportunityId: string, action: 'approved' | 'rejected') => void;
  onModerateProfileUpdate: (updateId: string, action: 'approved' | 'rejected', remark?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  opportunities,
  pendingUpdates,
  alumniList,
  mentorshipRequests,
  onModerateOpportunity,
  onModerateProfileUpdate,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'opps' | 'profiles' | 'all-opps'>('opps');

  const pendingOpportunities = opportunities.filter((o) => o.status === 'pending');
  const pendingProfileUpdates = pendingUpdates.filter((u) => u.status === 'pending');

  const totalPendingCount = pendingOpportunities.length + pendingProfileUpdates.length;

  return (
    <div className="space-y-6">
      {/* Admin Header with clean institutional design */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Admin & Faculty Console
                </span>
                <span className="text-xs text-slate-500">
                  MAIT Rohini • Department of Computer Science & Technology
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Placement & Alumni Moderation Hub
              </h1>
              <p className="text-sm text-slate-700 max-w-2xl mt-1">
                Administrator: <span className="font-semibold text-slate-900">Prof. Dr. S.K. Mittal</span> (Head of CST Alumni Relations & Industry Placements).
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Review and approve alumni opportunity postings and verified profile credentials before they are published to students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl text-center">
              <div className="text-xs text-slate-500 font-semibold">Pending Review Items</div>
              <div className="text-3xl font-bold text-blue-700">{totalPendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Postings</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{pendingOpportunities.length}</div>
          <p className="text-xs text-slate-500 mt-1">Jobs, internships & webinars</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Profile Updates</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{pendingProfileUpdates.length}</div>
          <p className="text-xs text-slate-500 mt-1">Promotions & relocations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Verified CST Alumni</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{alumniList.length}</div>
          <p className="text-xs text-slate-500 mt-1">Across Google, Microsoft, Blinkit, etc.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Mentorships Facilitated</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{mentorshipRequests.length}</div>
          <p className="text-xs text-slate-500 mt-1">1:1 Student-Alumni pairings</p>
        </div>
      </div>

      {/* Moderation Navigation Sub-tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-2">
        <button
          onClick={() => setActiveSubTab('opps')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'opps'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Opportunity Postings Moderation</span>
          {pendingOpportunities.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
              {pendingOpportunities.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('profiles')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'profiles'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Alumni Profile Updates Moderation</span>
          {pendingProfileUpdates.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
              {pendingProfileUpdates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('all-opps')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'all-opps'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Opportunities ({opportunities.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Opportunities Moderation */}
      {activeSubTab === 'opps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Pending Opportunities Requiring Moderation</h2>
            <p className="text-xs text-slate-500">Approving will publish this item immediately to the student feed.</p>
          </div>

          {pendingOpportunities.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              <p className="text-base font-bold text-slate-900">No Pending Opportunities</p>
              <p className="text-xs text-slate-500 mt-1">
                All submitted jobs, internships, webinars, and reunions have been moderated.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          {opp.type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Submitted by <span className="text-slate-900 font-semibold">{opp.posterName}</span> ({opp.posterCompany || 'Alumni'} - CST '{opp.posterGradYear})
                        </span>
                        <span className="text-xs text-slate-400">• {opp.createdAt.slice(0, 10)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{opp.title}</h3>
                      <p className="text-xs text-blue-700 font-semibold mt-0.5">
                        {opp.companyOrOrganizer} • {opp.location} ({opp.mode})
                      </p>
                    </div>

                    {opp.compensationOrFee && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs shrink-0">
                        {opp.compensationOrFee}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {opp.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-600 font-semibold block mb-1">Requirements:</span>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                        {opp.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-slate-600 font-semibold block mb-1">Skill Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {opp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-slate-500 text-[11px]">
                        Deadline/Event Date: <span className="text-slate-900 font-semibold">{opp.deadlineOrDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onModerateOpportunity(opp.id, 'rejected')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Reject Posting</span>
                    </button>
                    <button
                      onClick={() => onModerateOpportunity(opp.id, 'approved')}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish to Students</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Alumni Profile Updates Moderation */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Pending Profile Updates from MAIT Alumni</h2>
            <p className="text-xs text-slate-500">Verifying credentials before updating the public Alumni Directory.</p>
          </div>

          {pendingProfileUpdates.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              <p className="text-base font-bold text-slate-900">No Pending Profile Updates</p>
              <p className="text-xs text-slate-500 mt-1">All alumni credential modifications are up-to-date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfileUpdates.map((update) => (
                <div
                  key={update.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          Profile Update Request
                        </span>
                        <span className="text-xs text-slate-500">Class of {update.gradYear}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {update.alumniName} (Currently: {update.currentCompany})
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Reason: "{update.reason}"
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Submitted: {update.submittedAt.slice(0, 10)}
                    </span>
                  </div>

                  {/* Diff View */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="font-semibold text-slate-700 text-xs mb-2">Requested Profile Modifications:</div>

                    {update.requestedChanges.designation && (
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 w-28 shrink-0">New Designation:</span>
                        <span className="text-blue-700 font-bold">{update.requestedChanges.designation}</span>
                      </div>
                    )}

                    {update.requestedChanges.company && (
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 w-28 shrink-0">New Company:</span>
                        <span className="text-blue-700 font-bold">{update.requestedChanges.company}</span>
                      </div>
                    )}

                    {update.requestedChanges.location && (
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 w-28 shrink-0">New Location:</span>
                        <span className="text-slate-900 font-semibold">{update.requestedChanges.location}</span>
                      </div>
                    )}

                    {update.requestedChanges.bio && (
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 w-28 shrink-0">Updated Bio:</span>
                        <span className="text-slate-700 italic">"{update.requestedChanges.bio}"</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onModerateProfileUpdate(update.id, 'rejected', 'Requires additional verification.')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-rose-600" />
                      <span>Reject Update</span>
                    </button>
                    <button
                      onClick={() => onModerateProfileUpdate(update.id, 'approved', 'Verified by MAIT CST Placement Cell.')}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Sync to Directory</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Opportunities Oversight */}
      {activeSubTab === 'all-opps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Full Opportunities & Events Directory</h2>
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Go to Public Board →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Title & Company</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Posted By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{opp.title}</div>
                      <div className="text-slate-500 text-[11px]">{opp.companyOrOrganizer} • {opp.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {opp.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{opp.posterName}</div>
                      <div className="text-slate-500 text-[10px]">{opp.postedByRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          opp.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : opp.status === 'pending'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {opp.registeredStudentIds.length}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {opp.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onModerateOpportunity(opp.id, 'approved')}
                            className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onModerateOpportunity(opp.id, 'rejected')}
                            className="p-1.5 rounded bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Moderated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
