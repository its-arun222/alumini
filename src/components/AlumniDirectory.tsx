import React, { useState, useMemo } from 'react';
import { AlumniProfile, UserRole } from '../types';
import { filterAlumni, canRequestMentorship } from '../utils/alumni-ecosystem';
import { UserAvatar } from './UserAvatar';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  X, 
  MessageSquare, 
  Github, 
  Linkedin 
} from 'lucide-react';

interface AlumniDirectoryProps {
  alumniList: AlumniProfile[];
  currentRole: UserRole;
  onRequestMentorship: (alumni: AlumniProfile) => void;
}

const COMMON_SKILLS = [
  'Distributed Systems',
  'Golang',
  'Kubernetes',
  'Java',
  'C++',
  'Generative AI',
  'System Design',
  'React',
  'Kafka',
  'Low Latency',
];

const COMPANIES = [
  'All',
  'Google',
  'Microsoft',
  'Amazon',
  'Adobe',
  'Blinkit',
  'Goldman Sachs',
  'Sprinklr',
  'AgrasenTech',
];

export const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({
  alumniList,
  currentRole,
  onRequestMentorship,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [onlyMentors, setOnlyMentors] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [gradYearMin, setGradYearMin] = useState<number>(2015);
  const [selectedAlumniForDetail, setSelectedAlumniForDetail] = useState<AlumniProfile | null>(null);
  const allowRequestMentorship = canRequestMentorship(currentRole);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filteredAlumni = useMemo(() => {
    return filterAlumni(alumniList, {
      query: searchQuery,
      company: selectedCompany === 'All' ? undefined : selectedCompany,
      onlyAvailableForMentoring: onlyMentors,
      selectedSkills: selectedSkills.length > 0 ? selectedSkills : undefined,
      gradYearMin: gradYearMin,
    });
  }, [alumniList, searchQuery, selectedCompany, onlyMentors, selectedSkills, gradYearMin]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('All');
    setOnlyMentors(false);
    setSelectedSkills([]);
    setGradYearMin(2015);
  };

  return (
    <div className="space-y-6">
      {/* Directory Banner with clean white card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            MAIT CST Alumni Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Searchable CST Alumni Directory
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Discover and connect with Maharaja Agrasen Institute of Technology alumni thriving at top global engineering firms, tech startups, and research labs. Filter by skills, graduation year, or mentoring availability.
          </p>
        </div>

        {/* Search Bar with semantic support */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills (e.g. Distributed Systems, GenAI), company, or graduation year..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-xs"
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
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3.5 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {COMPANIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Companies' : c}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOnlyMentors(!onlyMentors)}
              className={`px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap ${
                onlyMentors
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${onlyMentors ? 'text-white' : 'text-slate-400'}`} />
              <span>Open to Mentor</span>
            </button>
          </div>
        </div>

        {/* Skill Tag Filters */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Popular Skill Filters:</span>
          </span>
          {COMMON_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {skill}
              </button>
            );
          })}

          {(selectedSkills.length > 0 || searchQuery || selectedCompany !== 'All' || onlyMentors) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-auto flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredAlumni.length}</span> of {alumniList.length} MAIT CST Alumni
        </div>
        <div className="flex items-center gap-2">
          <span>Batch from:</span>
          <select
            value={gradYearMin}
            onChange={(e) => setGradYearMin(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value={2015}>2015+</option>
            <option value={2018}>2018+</option>
            <option value={2020}>2020+</option>
            <option value={2022}>2022+</option>
          </select>
        </div>
      </div>

      {/* Alumni Card Grid (Zero people photos - clean monograms with names!) */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No CST Alumni matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try loosening your search query, clearing skill pills, or resetting company filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlumni.map((alumni) => (
            <div
              key={alumni.id}
              className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-sm group"
            >
              <div>
                {/* Header: Monogram Avatar, Name, CST Batch */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative shrink-0">
                    <UserAvatar name={alumni.name} size="lg" variant="alumni" />
                    {alumni.verifiedByMait && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 rounded-full text-white shadow-xs" title="Verified CST Alumni">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-slate-900 text-base truncate">{alumni.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        CST '{alumni.gradYear.toString().slice(-2)}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                      {alumni.designation}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-700">{alumni.currentCompany}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{alumni.location}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {alumni.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {alumni.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {alumni.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                      +{alumni.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div>
                  {alumni.isAvailableForMentoring ? (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Open to Mentor
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Mentoring Full</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAlumniForDetail(alumni)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  {allowRequestMentorship && (
                    <button
                      onClick={() => onRequestMentorship(alumni)}
                      disabled={!alumni.isAvailableForMentoring}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        alumni.isAvailableForMentoring
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Request 1:1</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alumni Detail Modal (Clean initials, no person photo) */}
      {selectedAlumniForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900">
            <button
              onClick={() => setSelectedAlumniForDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <UserAvatar name={selectedAlumniForDetail.name} size="xl" variant="alumni" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{selectedAlumniForDetail.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    CST '{selectedAlumniForDetail.gradYear}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {selectedAlumniForDetail.designation} at {selectedAlumniForDetail.currentCompany}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedAlumniForDetail.location}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1">
                  About & Career Journey
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedAlumniForDetail.bio}
                </p>
              </div>

              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1.5">
                  Technical Expertise & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumniForDetail.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-1.5">
                  Mentorship Specialties
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumniForDetail.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {selectedAlumniForDetail.linkedinUrl && (
                  <a
                    href={selectedAlumniForDetail.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedAlumniForDetail.githubUrl && (
                  <a
                    href={selectedAlumniForDetail.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Activity</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mentored: <span className="text-slate-900 font-semibold">{selectedAlumniForDetail.totalMentored} students</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAlumniForDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                {allowRequestMentorship && (
                  <button
                    onClick={() => {
                      const alm = selectedAlumniForDetail;
                      setSelectedAlumniForDetail(null);
                      onRequestMentorship(alm);
                    }}
                    disabled={!selectedAlumniForDetail.isAvailableForMentoring}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs ${
                      selectedAlumniForDetail.isAvailableForMentoring
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Request Mentorship Session</span>
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
