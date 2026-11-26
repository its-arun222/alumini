import React, { useState, useMemo } from 'react';
import { Opportunity, OpportunityType, UserRole, StudentProfile } from '../types';
import {
  filterOpportunities,
  canPostOpportunity,
  canRegisterForOpportunity,
} from '../utils/alumni-ecosystem';
import confetti from 'canvas-confetti';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Building2, 
  X
} from 'lucide-react';

interface EventsOpportunitiesBoardProps {
  opportunities: Opportunity[];
  currentRole: UserRole;
  student: StudentProfile;
  onToggleRegistration: (opportunityId: string) => void;
  onOpenPostModal: () => void;
}

export const EventsOpportunitiesBoard: React.FC<EventsOpportunitiesBoardProps> = ({
  opportunities,
  currentRole,
  student,
  onToggleRegistration,
  onOpenPostModal,
}) => {
  const [selectedType, setSelectedType] = useState<OpportunityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'On-site'>('all');
  const [selectedOppForModal, setSelectedOppForModal] = useState<Opportunity | null>(null);

  const canPost = canPostOpportunity(currentRole);
  const canRegister = canRegisterForOpportunity(currentRole);

  // Filter approved opportunities (or all if admin)
  const filteredOpps = useMemo(() => {
    return filterOpportunities(opportunities, {
      type: selectedType,
      query: searchQuery,
      mode: modeFilter,
      status: currentRole === 'admin' ? 'all' : 'approved',
    });
  }, [opportunities, selectedType, searchQuery, modeFilter, currentRole]);

  const handleRegister = (opp: Opportunity) => {
    if (!canRegister) return;
    onToggleRegistration(opp.id);
    const isCurrentlyRegistered = opp.registeredStudentIds.includes(student.id);

    if (!isCurrentlyRegistered) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#1d4ed8', '#64748b', '#0f172a'],
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const getTypeBadge = (type: OpportunityType) => {
    switch (type) {
      case 'job':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'internship':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'webinar':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'reunion':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with clean white card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
              Combined Opportunities & Events Board
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              MAIT CST Careers & Community Feed
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Explore off-campus alumni referrals, summer internships, live tech webinars with industry engineers, and annual alumni reunions in one unified board.
            </p>
          </div>

          {canPost && (
            <div className="shrink-0">
              <button
                onClick={onOpenPostModal}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Opportunity / Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company (Google, Blinkit), skills, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'All Postings' },
            { id: 'job', label: 'Full-Time Jobs' },
            { id: 'internship', label: 'Internships' },
            { id: 'webinar', label: 'Webinars & Talks' },
            { id: 'reunion', label: 'Reunions' },
          ].map((tab) => {
            const isSelected = selectedType === tab.id;
            const count = tab.id === 'all'
              ? opportunities.filter(o => currentRole === 'admin' || o.status === 'approved').length
              : opportunities.filter(o => o.type === tab.id && (currentRole === 'admin' || o.status === 'approved')).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id as any)}
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

      {/* Postings Grid */}
      {filteredOpps.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
          <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpps.map((opp) => {
            const isRegistered = canRegister && opp.registeredStudentIds.includes(student.id);

            return (
              <div
                key={opp.id}
                className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-sm relative group"
              >
                {/* Header tags */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeBadge(opp.type)}`}>
                        {opp.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {opp.mode}
                      </span>
                    </div>

                    {isRegistered && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </span>
                    )}

                    {currentRole === 'admin' && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          opp.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : opp.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {opp.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Organization */}
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{opp.companyOrOrganizer}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>

                  {/* Alumni Referral Banner if posted by alumni */}
                  {opp.isReferralByAlumni && (
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-800 flex items-center gap-1.5 font-medium">
                      <span>Alumni Referral by {opp.posterName} ({opp.posterCompany || 'CST'} '{opp.posterGradYear})</span>
                    </div>
                  )}

                  {/* Description preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-3">
                    {opp.description}
                  </p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {opp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    {opp.compensationOrFee && (
                      <div className="font-semibold text-slate-900 text-xs">
                        {opp.compensationOrFee}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Deadline: {opp.deadlineOrDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOppForModal(opp)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {canRegister && (
                      <button
                        onClick={() => handleRegister(opp)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isRegistered
                            ? 'bg-slate-900 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRegistered ? 'Registered' : 'Register / Apply'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOppForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOppForModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getTypeBadge(selectedOppForModal.type)}`}>
                  {selectedOppForModal.type}
                </span>
                <span className="text-xs text-slate-500">
                  Mode: {selectedOppForModal.mode} • Deadline: {selectedOppForModal.deadlineOrDate}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {selectedOppForModal.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{selectedOppForModal.companyOrOrganizer}</span>
                <span>•</span>
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{selectedOppForModal.location}</span>
              </div>
            </div>

            {selectedOppForModal.isReferralByAlumni && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
                <div>
                  <span className="font-bold">Verified MAIT Alumni Referral:</span> Posted by {selectedOppForModal.posterName} ({selectedOppForModal.posterCompany || 'Alumni'} - CST '{selectedOppForModal.posterGradYear})
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1">
                  Full Overview & Opportunity Description
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed text-slate-800 whitespace-pre-line">
                  {selectedOppForModal.description}
                </div>
              </div>

              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1.5">
                  Key Requirements & Eligibility
                </h4>
                <ul className="list-disc list-inside space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-800">
                  {selectedOppForModal.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1.5">
                  Desired Tech Stack & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOppForModal.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedOppForModal.compensationOrFee && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Compensation / Package / Fee:</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {selectedOppForModal.compensationOrFee}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedOppForModal.registeredStudentIds.length} MAIT CST students registered
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOppForModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>

                {canRegister && (
                  <button
                    onClick={() => {
                      handleRegister(selectedOppForModal);
                      setSelectedOppForModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              registeredStudentIds: prev.registeredStudentIds.includes(student.id)
                                ? prev.registeredStudentIds.filter((id) => id !== student.id)
                                : [...prev.registeredStudentIds, student.id],
                            }
                          : null
                      );
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedOppForModal.registeredStudentIds.includes(student.id)
                        ? 'bg-slate-900 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedOppForModal.registeredStudentIds.includes(student.id)
                        ? 'Registered (Click to Cancel)'
                        : 'Register / Apply Now'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
