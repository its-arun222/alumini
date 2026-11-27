import {
  AlumniProfile,
  MentorshipRequest,
  Opportunity,
  StudentProfile,
  SuccessStory,
} from '../types';

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

export interface SkillReadinessDatum {
  skill: string;
  demandCount: number;
  hasSkill: boolean;
  matchedDemand: number;
  gapDemand: number;
}

export interface StudentAnalyticsSummary {
  totalOpportunitiesApplied: number;
  eventsRegistered: number;
  totalRegistrations: number;
  mentorshipRequestsSent: number;
  acceptedMentorships: number;
  acceptanceRate: number;
  mentorshipBreakdown: PieDatum[];
  registrationTypeBreakdown: PieDatum[];
  skillReadiness: SkillReadinessDatum[];
  matchedSkills: string[];
  recommendedSkillsToLearn: string[];
  readinessScore: number;
}

export interface CompanyDistributionDatum {
  company: string;
  count: number;
}

export interface BatchDistributionDatum {
  batch: string;
  year: number;
  count: number;
}

export interface PlatformEngagementDatum {
  metric: string;
  count: number;
  category: 'Opportunities' | 'Registrations' | 'Mentorship' | 'Community';
  color: string;
}

export interface InstitutionalAnalyticsSummary {
  totalAlumni: number;
  totalOpportunities: number;
  approvedOpportunities: number;
  pendingOpportunities: number;
  rejectedOpportunities: number;
  totalStudentRegistrations: number;
  totalMentorshipRequests: number;
  acceptedMentorshipRequests: number;
  pendingMentorshipRequests: number;
  declinedMentorshipRequests: number;
  approvedSuccessStories: number;
  pendingSuccessStories: number;
  alumniByCompany: CompanyDistributionDatum[];
  alumniByBatch: BatchDistributionDatum[];
  opportunityStatusBreakdown: PieDatum[];
  mentorshipStatusBreakdown: PieDatum[];
  platformEngagementOverview: PlatformEngagementDatum[];
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function normalizeCompanyName(company: string): string {
  const clean = company.trim();
  if (!clean) return 'Other';
  return clean.length > 26 ? `${clean.slice(0, 24)}…` : clean;
}

/**
 * Pure computation of Student Personal Analytics directly from live Firestore collections.
 */
export function computeStudentAnalytics(
  student: StudentProfile,
  opportunities: Opportunity[],
  mentorshipRequests: MentorshipRequest[]
): StudentAnalyticsSummary {
  const approvedOpps = opportunities.filter((o) => o.status === 'approved');
  const myRegistered = approvedOpps.filter((o) =>
    o.registeredStudentIds.includes(student.id)
  );

  const jobsCount = myRegistered.filter((o) => o.type === 'job').length;
  const internshipsCount = myRegistered.filter((o) => o.type === 'internship').length;
  const webinarsCount = myRegistered.filter((o) => o.type === 'webinar').length;
  const reunionsCount = myRegistered.filter((o) => o.type === 'reunion').length;

  const totalOpportunitiesApplied = jobsCount + internshipsCount;
  const eventsRegistered = webinarsCount + reunionsCount;
  const totalRegistrations = myRegistered.length;

  const myRequests = mentorshipRequests.filter((r) => r.studentId === student.id);
  const pendingMentorships = myRequests.filter((r) => r.status === 'pending').length;
  const acceptedMentorships = myRequests.filter((r) => r.status === 'accepted').length;
  const declinedMentorships = myRequests.filter((r) => r.status === 'declined').length;

  const acceptanceRate =
    myRequests.length > 0
      ? Math.round((acceptedMentorships / myRequests.length) * 100)
      : 0;

  const mentorshipBreakdown: PieDatum[] = [
    { name: 'Accepted', value: acceptedMentorships, color: '#059669' },
    { name: 'Pending', value: pendingMentorships, color: '#d97706' },
    { name: 'Declined', value: declinedMentorships, color: '#e11d48' },
  ];

  const registrationTypeBreakdown: PieDatum[] = [
    { name: 'Job', value: jobsCount, color: '#2563eb' },
    { name: 'Internship', value: internshipsCount, color: '#0ea5e9' },
    { name: 'Webinar', value: webinarsCount, color: '#7c3aed' },
    { name: 'Reunion', value: reunionsCount, color: '#0d9488' },
  ];

  // Aggregate top most-requested skills across all approved opportunities
  const skillFreqMap = new Map<string, { display: string; count: number }>();
  for (const opp of approvedOpps) {
    const seenInOpp = new Set<string>();
    for (const rawSkill of opp.skills || []) {
      const key = normalizeSkill(rawSkill);
      if (!key || seenInOpp.has(key)) continue;
      seenInOpp.add(key);
      const existing = skillFreqMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        skillFreqMap.set(key, { display: rawSkill.trim(), count: 1 });
      }
    }
  }

  const studentSkillSet = new Set((student.skills || []).map(normalizeSkill));

  const topSkills = Array.from(skillFreqMap.entries())
    .sort((a, b) => b[1].count - a[1].count || a[1].display.localeCompare(b[1].display))
    .slice(0, 10);

  const skillReadiness: SkillReadinessDatum[] = topSkills.map(([key, info]) => {
    const hasSkill = studentSkillSet.has(key);
    return {
      skill: info.display,
      demandCount: info.count,
      hasSkill,
      matchedDemand: hasSkill ? info.count : 0,
      gapDemand: hasSkill ? 0 : info.count,
    };
  });

  const matchedSkills = skillReadiness.filter((s) => s.hasSkill).map((s) => s.skill);
  const recommendedSkillsToLearn = skillReadiness
    .filter((s) => !s.hasSkill)
    .map((s) => s.skill);

  const readinessScore =
    skillReadiness.length > 0
      ? Math.round((matchedSkills.length / skillReadiness.length) * 100)
      : 0;

  return {
    totalOpportunitiesApplied,
    eventsRegistered,
    totalRegistrations,
    mentorshipRequestsSent: myRequests.length,
    acceptedMentorships,
    acceptanceRate,
    mentorshipBreakdown,
    registrationTypeBreakdown,
    skillReadiness,
    matchedSkills,
    recommendedSkillsToLearn,
    readinessScore,
  };
}

/**
 * Pure computation of Institutional Analytics for Admin Dashboard directly from live Firestore collections.
 */
export function computeInstitutionalAnalytics(
  alumniList: AlumniProfile[],
  opportunities: Opportunity[],
  mentorshipRequests: MentorshipRequest[],
  successStories: SuccessStory[] = []
): InstitutionalAnalyticsSummary {
  const companyMap = new Map<string, number>();
  const batchMap = new Map<number, number>();

  for (const alm of alumniList) {
    const company = normalizeCompanyName(alm.currentCompany);
    companyMap.set(company, (companyMap.get(company) || 0) + 1);
    batchMap.set(alm.gradYear, (batchMap.get(alm.gradYear) || 0) + 1);
  }

  const alumniByCompany: CompanyDistributionDatum[] = Array.from(companyMap.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
    .slice(0, 10);

  const alumniByBatch: BatchDistributionDatum[] = Array.from(batchMap.entries())
    .map(([year, count]) => ({ batch: `Batch ${year}`, year, count }))
    .sort((a, b) => a.year - b.year);

  const approvedOpportunities = opportunities.filter((o) => o.status === 'approved').length;
  const pendingOpportunities = opportunities.filter((o) => o.status === 'pending').length;
  const rejectedOpportunities = opportunities.filter((o) => o.status === 'rejected').length;

  const totalStudentRegistrations = opportunities.reduce(
    (sum, opp) => sum + (Array.isArray(opp.registeredStudentIds) ? opp.registeredStudentIds.length : 0),
    0
  );

  const acceptedMentorshipRequests = mentorshipRequests.filter((r) => r.status === 'accepted').length;
  const pendingMentorshipRequests = mentorshipRequests.filter((r) => r.status === 'pending').length;
  const declinedMentorshipRequests = mentorshipRequests.filter((r) => r.status === 'declined').length;

  const approvedSuccessStories = successStories.filter((s) => s.status === 'approved').length;
  const pendingSuccessStories = successStories.filter((s) => s.status === 'pending').length;

  const opportunityStatusBreakdown: PieDatum[] = [
    { name: 'Approved', value: approvedOpportunities, color: '#059669' },
    { name: 'Pending', value: pendingOpportunities, color: '#d97706' },
    { name: 'Rejected', value: rejectedOpportunities, color: '#e11d48' },
  ];

  const mentorshipStatusBreakdown: PieDatum[] = [
    { name: 'Accepted', value: acceptedMentorshipRequests, color: '#059669' },
    { name: 'Pending', value: pendingMentorshipRequests, color: '#d97706' },
    { name: 'Declined', value: declinedMentorshipRequests, color: '#e11d48' },
  ];

  const platformEngagementOverview: PlatformEngagementDatum[] = [
    { metric: 'Approved Opps', count: approvedOpportunities, category: 'Opportunities', color: '#2563eb' },
    { metric: 'Pending Opps', count: pendingOpportunities, category: 'Opportunities', color: '#f59e0b' },
    { metric: 'Registrations', count: totalStudentRegistrations, category: 'Registrations', color: '#0ea5e9' },
    { metric: 'Accepted Mentors', count: acceptedMentorshipRequests, category: 'Mentorship', color: '#059669' },
    { metric: 'Pending Mentors', count: pendingMentorshipRequests, category: 'Mentorship', color: '#d97706' },
    { metric: 'Success Stories', count: approvedSuccessStories, category: 'Community', color: '#7c3aed' },
  ];

  return {
    totalAlumni: alumniList.length,
    totalOpportunities: opportunities.length,
    approvedOpportunities,
    pendingOpportunities,
    rejectedOpportunities,
    totalStudentRegistrations,
    totalMentorshipRequests: mentorshipRequests.length,
    acceptedMentorshipRequests,
    pendingMentorshipRequests,
    declinedMentorshipRequests,
    approvedSuccessStories,
    pendingSuccessStories,
    alumniByCompany,
    alumniByBatch,
    opportunityStatusBreakdown,
    mentorshipStatusBreakdown,
    platformEngagementOverview,
  };
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a clean RFC-4180 CSV analytics report summarizing alumni, opportunities, registrations, and mentorship metrics.
 */
export function buildInstitutionalAnalyticsCsv(
  summary: InstitutionalAnalyticsSummary,
  opportunities: Opportunity[],
  generatedAtIso: string = new Date().toISOString()
): string {
  const lines: string[] = [];
  const pushRow = (...cells: (string | number)[]) => {
    lines.push(cells.map(escapeCsvCell).join(','));
  };

  pushRow('MAIT CST Alumni Connect — Institutional Analytics Report');
  pushRow('Generated At', generatedAtIso);
  pushRow('');

  pushRow('SECTION 1: EXECUTIVE SUMMARY', 'VALUE');
  pushRow('Total Verified Alumni', summary.totalAlumni);
  pushRow('Total Opportunities Posted', summary.totalOpportunities);
  pushRow('Approved Opportunities', summary.approvedOpportunities);
  pushRow('Pending Opportunities', summary.pendingOpportunities);
  pushRow('Rejected Opportunities', summary.rejectedOpportunities);
  pushRow('Total Student Registrations', summary.totalStudentRegistrations);
  pushRow('Total Mentorship Requests', summary.totalMentorshipRequests);
  pushRow('Accepted Mentorships', summary.acceptedMentorshipRequests);
  pushRow('Pending Mentorships', summary.pendingMentorshipRequests);
  pushRow('Declined Mentorships', summary.declinedMentorshipRequests);
  pushRow('Approved Success Stories', summary.approvedSuccessStories);
  pushRow('');

  pushRow('SECTION 2: ALUMNI BY COMPANY', 'ALUMNI COUNT');
  for (const row of summary.alumniByCompany) {
    pushRow(row.company, row.count);
  }
  pushRow('');

  pushRow('SECTION 3: ALUMNI BY GRADUATION BATCH', 'ALUMNI COUNT');
  for (const row of summary.alumniByBatch) {
    pushRow(row.year, row.count);
  }
  pushRow('');

  pushRow('SECTION 4: OPPORTUNITIES & REGISTRATIONS', 'TYPE', 'COMPANY / ORGANIZER', 'STATUS', 'REGISTRATIONS', 'DEADLINE');
  for (const opp of opportunities) {
    pushRow(
      opp.title,
      opp.type,
      opp.companyOrOrganizer,
      opp.status,
      opp.registeredStudentIds.length,
      opp.deadlineOrDate
    );
  }

  return lines.join('\n');
}
