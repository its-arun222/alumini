export type UserRole = 'student' | 'alumni' | 'admin';

export interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: 'Computer Science & Technology (CST)';
  batchYear: string; // e.g. "2022 - 2026"
  currentSemester: number; // 1-8
  cgpa: number;
  skills: string[];
  interests: string[];
  dreamCompanies: string[];
  bio: string;
  avatarUrl: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  branch: 'Computer Science & Technology (CST)';
  gradYear: number;
  currentCompany: string;
  designation: string;
  location: string;
  skills: string[];
  bio: string;
  avatarUrl: string;
  linkedinUrl: string;
  githubUrl?: string;
  isAvailableForMentoring: boolean;
  totalMentored: number;
  specialties: string[];
  verifiedByMait: boolean;
}

export type OpportunityType = 'job' | 'internship' | 'webinar' | 'reunion';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  companyOrOrganizer: string;
  location: string;
  mode: 'Remote' | 'Hybrid' | 'On-site';
  description: string;
  requirements: string[];
  skills: string[];
  deadlineOrDate: string;
  postedByRole: UserRole;
  posterId: string;
  posterName: string;
  posterCompany?: string;
  posterGradYear?: number;
  status: ModerationStatus;
  registeredStudentIds: string[];
  compensationOrFee?: string;
  linkUrl?: string;
  createdAt: string;
  isReferralByAlumni?: boolean;
}

export type MentorshipTopic = 
  | 'Resume & Portfolio Review'
  | 'DSA & Technical Mock Interview'
  | 'System Design & Distributed Systems'
  | 'Off-Campus Referral Strategy'
  | 'Higher Studies & MS Abroad'
  | 'Early-Stage Startup & Tech Lead';

export type MentorshipStatus = 'pending' | 'accepted' | 'declined';

export interface MentorshipRequest {
  id: string;
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
  status: MentorshipStatus;
  requestedAt: string;
  responseNote?: string;
  meetingUrl?: string;
}

export interface PendingProfileUpdate {
  id: string;
  alumniId: string;
  alumniName: string;
  gradYear: number;
  currentCompany: string;
  requestedChanges: {
    company?: string;
    designation?: string;
    location?: string;
    skills?: string[];
    bio?: string;
  };
  reason: string;
  submittedAt: string;
  status: ModerationStatus;
  adminRemark?: string;
}
