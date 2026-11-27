import { z } from 'zod';
import {
  AlumniProfile,
  Opportunity,
  MentorshipRequest,
  PendingProfileUpdate,
  OpportunityType,
  MentorshipTopic,
  UserRole,
  ModerationStatus,
} from '../types';

// Role-Based Access Control (RBAC) Permission Matrix
export function canPostOpportunity(role: UserRole): boolean {
  return role === 'alumni' || role === 'admin';
}

export function canRegisterForOpportunity(role: UserRole): boolean {
  return role === 'student';
}

export function canRequestMentorship(role: UserRole): boolean {
  return role === 'student';
}

export function canRespondToMentorship(role: UserRole): boolean {
  return role === 'alumni';
}

export function canAccessAdminModeration(role: UserRole): boolean {
  return role === 'admin';
}

export function canUseAiCareerGuidance(role: UserRole): boolean {
  return role === 'student';
}

export function canEditStudentProfile(role: UserRole): boolean {
  return role === 'student';
}

export function canRequestAlumniProfileUpdate(role: UserRole): boolean {
  return role === 'alumni';
}

export function canSubmitSuccessStory(role: UserRole): boolean {
  return role === 'student' || role === 'alumni';
}

export function getOpportunityStatusForRole(role: UserRole): ModerationStatus {
  return role === 'admin' ? 'approved' : 'pending';
}

export function canAccessTab(role: UserRole, tab: string): boolean {
  if (tab === 'admin-moderation') return canAccessAdminModeration(role);
  if (tab === 'ai-guidance') return canUseAiCareerGuidance(role);
  return ['dashboard', 'directory', 'opportunities', 'mentorship'].includes(tab);
}

// Zod Schemas
export const studentProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.').max(80),
  currentSemester: z.number().int().min(1, 'Semester must be between 1 and 8.').max(8, 'Semester must be between 1 and 8.'),
  cgpa: z.number().min(0, 'CGPA must be between 0 and 10.').max(10, 'CGPA must be between 0 and 10.'),
  skillsText: z.string().min(2, 'Add at least one technical skill (comma-separated).'),
  interestsText: z.string().optional(),
  dreamCompaniesText: z.string().optional(),
  bio: z.string().min(15, 'Bio must be at least 15 characters.').max(500),
  githubUrl: z.string().url('GitHub URL must start with https://').optional().or(z.literal('')),
  linkedinUrl: z.string().url('LinkedIn URL must start with https://').optional().or(z.literal('')),
});

export type StudentProfileUpdateFormData = z.infer<typeof studentProfileUpdateSchema>;

export const mentorshipRequestSchema = z.object({
  topic: z.enum([
    'Resume & Portfolio Review',
    'DSA & Technical Mock Interview',
    'System Design & Distributed Systems',
    'Off-Campus Referral Strategy',
    'Higher Studies & MS Abroad',
    'Early-Stage Startup & Tech Lead',
  ] as const),
  message: z.string().min(20, 'Please write at least 20 characters explaining your goals and questions.').max(1000),
  preferredMode: z.enum(['Google Meet', 'LinkedIn Voice/Chat', 'In-person @ MAIT'] as const),
});

export type MentorshipRequestFormData = z.infer<typeof mentorshipRequestSchema>;

export const opportunityPostingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  type: z.enum(['job', 'internship', 'webinar', 'reunion'] as const),
  companyOrOrganizer: z.string().min(2, 'Company or Organizer is required.'),
  location: z.string().min(2, 'Location is required.'),
  mode: z.enum(['Remote', 'Hybrid', 'On-site'] as const),
  description: z.string().min(30, 'Please provide a detailed description (at least 30 characters).'),
  requirementsText: z.string().min(10, 'List at least one requirement.'),
  skillsText: z.string().min(2, 'Enter at least one skill tag (comma-separated).'),
  deadlineOrDate: z.string().min(4, 'Valid deadline or event date is required.'),
  compensationOrFee: z.string().optional(),
  linkUrl: z.string().url('Must be a valid URL (e.g., https://...)').optional().or(z.literal('')),
});

export type OpportunityPostingFormData = z.infer<typeof opportunityPostingSchema>;

export const profileUpdateSchema = z.object({
  company: z.string().min(2, 'Company name is required.').optional(),
  designation: z.string().min(2, 'Designation is required.').optional(),
  location: z.string().min(2, 'Location is required.').optional(),
  skillsText: z.string().optional(),
  bio: z.string().min(20, 'Bio must be at least 20 characters.').optional(),
  reason: z.string().min(10, 'Please state the reason for update (e.g. recent promotion, relocation).'),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const careerQuerySchema = z.object({
  question: z.string().min(5, 'Please enter a clear question (at least 5 characters).').max(600),
});

export type CareerQueryFormData = z.infer<typeof careerQuerySchema>;

export const successStorySchema = z.object({
  company: z.string().min(2, 'Company name must be at least 2 characters.').max(120),
  roleTitle: z.string().min(2, 'Role or internship title is required.').max(120),
  batchYear: z.string().min(4, 'Enter a valid graduation/batch year (e.g. 2026).').max(32),
  mentorName: z.string().min(2, 'Credit the MAIT alumni mentor or faculty advisor.').max(100),
  storyText: z.string().min(20, 'Please share at least 20 characters about your journey.').max(1500),
  tagsText: z.string().min(2, 'Add at least one tag (comma-separated, e.g. Google Referral, DSA).'),
});

export type SuccessStoryFormData = z.infer<typeof successStorySchema>;

// Semantic & Keyword Alumni Filtering
export interface AlumniFilterOptions {
  query?: string;
  company?: string;
  gradYearMin?: number;
  gradYearMax?: number;
  selectedSkills?: string[];
  onlyAvailableForMentoring?: boolean;
}

export function filterAlumni(
  alumniList: AlumniProfile[],
  filters: AlumniFilterOptions
): AlumniProfile[] {
  const normalizedQuery = (filters.query || '').trim().toLowerCase();
  const normalizedCompany = (filters.company || '').trim().toLowerCase();

  return alumniList
    .map(alumni => {
      let score = 0;
      let matches = true;

      // Mentoring availability
      if (filters.onlyAvailableForMentoring && !alumni.isAvailableForMentoring) {
        return { alumni, matches: false, score: 0 };
      }

      // Grad year range
      if (filters.gradYearMin && alumni.gradYear < filters.gradYearMin) {
        matches = false;
      }
      if (filters.gradYearMax && alumni.gradYear > filters.gradYearMax) {
        matches = false;
      }

      // Company filter
      if (normalizedCompany && normalizedCompany !== 'all') {
        if (!alumni.currentCompany.toLowerCase().includes(normalizedCompany)) {
          matches = false;
        }
      }

      // Skill tags filter (must have at least one of the selected skills if any are selected)
      if (filters.selectedSkills && filters.selectedSkills.length > 0) {
        const hasSkill = filters.selectedSkills.some(skill =>
          alumni.skills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        if (!hasSkill) {
          matches = false;
        }
      }

      // Search Query Matching (Name, Company, Designation, Bio, Skills, Specialties)
      if (normalizedQuery) {
        const nameMatch = alumni.name.toLowerCase().includes(normalizedQuery);
        const compMatch = alumni.currentCompany.toLowerCase().includes(normalizedQuery);
        const desigMatch = alumni.designation.toLowerCase().includes(normalizedQuery);
        const bioMatch = alumni.bio.toLowerCase().includes(normalizedQuery);
        const skillMatch = alumni.skills.some(s => s.toLowerCase().includes(normalizedQuery));
        const specMatch = alumni.specialties.some(sp => sp.toLowerCase().includes(normalizedQuery));
        const yearMatch = alumni.gradYear.toString().includes(normalizedQuery);

        if (nameMatch || compMatch || desigMatch || bioMatch || skillMatch || specMatch || yearMatch) {
          // Calculate semantic weight
          if (nameMatch) score += 10;
          if (compMatch) score += 8;
          if (desigMatch) score += 6;
          if (skillMatch) score += 5;
          if (specMatch) score += 4;
          if (bioMatch) score += 2;
        } else {
          matches = false;
        }
      }

      return { alumni, matches, score };
    })
    .filter(item => item.matches)
    .sort((a, b) => b.score - a.score || b.alumni.gradYear - a.alumni.gradYear)
    .map(item => item.alumni);
}

// Filter Opportunities Board
export interface OpportunityFilterOptions {
  type?: OpportunityType | 'all';
  query?: string;
  mode?: 'all' | 'Remote' | 'Hybrid' | 'On-site';
  status?: 'approved' | 'all';
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilterOptions
): Opportunity[] {
  const normQuery = (filters.query || '').trim().toLowerCase();

  return opportunities.filter(opp => {
    // Status check (default only approved unless 'all' is requested, e.g. for admin or preview)
    if (filters.status && filters.status !== 'all' && opp.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all' && opp.type !== filters.type) {
      return false;
    }

    // Mode filter
    if (filters.mode && filters.mode !== 'all' && opp.mode !== filters.mode) {
      return false;
    }

    // Query match
    if (normQuery) {
      const matchTitle = opp.title.toLowerCase().includes(normQuery);
      const matchComp = opp.companyOrOrganizer.toLowerCase().includes(normQuery);
      const matchDesc = opp.description.toLowerCase().includes(normQuery);
      const matchSkills = opp.skills.some(s => s.toLowerCase().includes(normQuery));
      const matchLoc = opp.location.toLowerCase().includes(normQuery);
      if (!matchTitle && !matchComp && !matchDesc && !matchSkills && !matchLoc) {
        return false;
      }
    }

    return true;
  });
}

// Mentorship Logic
export function createMentorshipRequest(
  existingRequests: MentorshipRequest[],
  newRequestData: {
    studentId: string;
    studentName: string;
    studentBranch: string;
    studentSemester: number;
    studentCgpa: number;
    alumniId: string;
    alumniName: string;
    alumniCompany: string;
    alumniDesignation: string;
    topic: MentorshipTopic;
    message: string;
    preferredMode: 'Google Meet' | 'LinkedIn Voice/Chat' | 'In-person @ MAIT';
  }
): MentorshipRequest[] {
  const newRequest: MentorshipRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...newRequestData,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  return [newRequest, ...existingRequests];
}

export function acceptMentorshipRequest(
  requests: MentorshipRequest[],
  requestId: string,
  responseNote?: string,
  meetingUrl?: string
): MentorshipRequest[] {
  return requests.map(req => {
    if (req.id === requestId) {
      return {
        ...req,
        status: 'accepted',
        responseNote: responseNote || 'Looking forward to our mentorship session! Please find meeting details.',
        meetingUrl: meetingUrl || 'https://meet.google.com/mait-alumni-session',
      };
    }
    return req;
  });
}

export function declineMentorshipRequest(
  requests: MentorshipRequest[],
  requestId: string,
  responseNote?: string
): MentorshipRequest[] {
  return requests.map(req => {
    if (req.id === requestId) {
      return {
        ...req,
        status: 'declined',
        responseNote: responseNote || 'Currently at capacity for new 1:1 mentees this month. Please reach out again next semester!',
      };
    }
    return req;
  });
}

// Student Registration for Opportunities
export function toggleOpportunityRegistration(
  opportunities: Opportunity[],
  opportunityId: string,
  studentId: string
): Opportunity[] {
  return opportunities.map(opp => {
    if (opp.id === opportunityId) {
      const isRegistered = opp.registeredStudentIds.includes(studentId);
      const updatedIds = isRegistered
        ? opp.registeredStudentIds.filter(id => id !== studentId)
        : [...opp.registeredStudentIds, studentId];
      return {
        ...opp,
        registeredStudentIds: updatedIds,
      };
    }
    return opp;
  });
}

// Admin Moderation
export function moderateOpportunity(
  opportunities: Opportunity[],
  opportunityId: string,
  action: 'approved' | 'rejected'
): Opportunity[] {
  return opportunities.map(opp => {
    if (opp.id === opportunityId) {
      return {
        ...opp,
        status: action,
      };
    }
    return opp;
  });
}

export function moderateProfileUpdate(
  pendingUpdates: PendingProfileUpdate[],
  alumniList: AlumniProfile[],
  updateId: string,
  action: 'approved' | 'rejected',
  adminRemark?: string
): { updatedPendingUpdates: PendingProfileUpdate[]; updatedAlumniList: AlumniProfile[] } {
  let targetUpdate: PendingProfileUpdate | undefined;

  const updatedPendingUpdates = pendingUpdates.map(u => {
    if (u.id === updateId) {
      targetUpdate = u;
      return {
        ...u,
        status: action,
        adminRemark,
      };
    }
    return u;
  });

  let updatedAlumniList = alumniList;

  if (action === 'approved' && targetUpdate) {
    updatedAlumniList = alumniList.map(alumni => {
      if (alumni.id === targetUpdate?.alumniId) {
        return {
          ...alumni,
          currentCompany: targetUpdate.requestedChanges.company || alumni.currentCompany,
          designation: targetUpdate.requestedChanges.designation || alumni.designation,
          location: targetUpdate.requestedChanges.location || alumni.location,
          bio: targetUpdate.requestedChanges.bio || alumni.bio,
          skills: targetUpdate.requestedChanges.skills || alumni.skills,
        };
      }
      return alumni;
    });
  }

  return { updatedPendingUpdates, updatedAlumniList };
}
