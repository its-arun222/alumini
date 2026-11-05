import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterAlumni,
  filterOpportunities,
  createMentorshipRequest,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  toggleOpportunityRegistration,
  moderateOpportunity,
  moderateProfileUpdate,
  mentorshipRequestSchema,
  opportunityPostingSchema,
} from './alumni-ecosystem';
import { AlumniProfile, Opportunity, MentorshipRequest, PendingProfileUpdate } from '../types';

const sampleAlumni: AlumniProfile[] = [
  {
    id: 'alumni-1',
    name: 'Priya Goel',
    email: 'priya@example.com',
    branch: 'Computer Science & Technology (CST)',
    gradYear: 2019,
    currentCompany: 'Google',
    designation: 'Senior SWE',
    location: 'Bengaluru',
    skills: ['Golang', 'Kubernetes', 'Distributed Systems'],
    bio: 'Working on Google Cloud',
    avatarUrl: '',
    linkedinUrl: '',
    isAvailableForMentoring: true,
    totalMentored: 20,
    specialties: ['System Design & Distributed Systems'],
    verifiedByMait: true,
  },
  {
    id: 'alumni-2',
    name: 'Rohan Verma',
    email: 'rohan@example.com',
    branch: 'Computer Science & Technology (CST)',
    gradYear: 2021,
    currentCompany: 'Blinkit',
    designation: 'Staff Architect',
    location: 'Gurugram',
    skills: ['Java', 'Kafka', 'Redis'],
    bio: 'High concurrency systems at Blinkit',
    avatarUrl: '',
    linkedinUrl: '',
    isAvailableForMentoring: false,
    totalMentored: 15,
    specialties: ['Resume & Portfolio Review'],
    verifiedByMait: true,
  },
];

const sampleOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Google SDE-1 Referral',
    type: 'job',
    companyOrOrganizer: 'Google',
    location: 'Bengaluru',
    mode: 'Hybrid',
    description: 'Looking for sharp MAIT CST grads with DSA skills.',
    requirements: ['DSA', 'Java/C++'],
    skills: ['DSA', 'C++'],
    deadlineOrDate: '2026-05-30',
    postedByRole: 'alumni',
    posterId: 'alumni-1',
    posterName: 'Priya Goel',
    status: 'approved',
    registeredStudentIds: [],
    createdAt: '2026-11-01',
  },
  {
    id: 'opp-2',
    title: 'Sprinklr Associate Role',
    type: 'job',
    companyOrOrganizer: 'Sprinklr',
    location: 'Gurugram',
    mode: 'On-site',
    description: 'Enterprise social intelligence suite.',
    requirements: ['React'],
    skills: ['React'],
    deadlineOrDate: '2026-06-15',
    postedByRole: 'alumni',
    posterId: 'alumni-3',
    posterName: 'Tanvi',
    status: 'pending',
    registeredStudentIds: [],
    createdAt: '2026-11-02',
  },
];

test('filterAlumni filters by keyword query and company', () => {
  const result = filterAlumni(sampleAlumni, { query: 'google' });
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Priya Goel');

  const blinkitResult = filterAlumni(sampleAlumni, { company: 'Blinkit' });
  assert.equal(blinkitResult.length, 1);
  assert.equal(blinkitResult[0].name, 'Rohan Verma');
});

test('filterAlumni respects onlyAvailableForMentoring filter', () => {
  const result = filterAlumni(sampleAlumni, { onlyAvailableForMentoring: true });
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Priya Goel');
});

test('filterOpportunities filters approved opportunities and search query', () => {
  const approved = filterOpportunities(sampleOpportunities, { status: 'approved' });
  assert.equal(approved.length, 1);
  assert.equal(approved[0].id, 'opp-1');

  const queryMatch = filterOpportunities(sampleOpportunities, { query: 'sprinklr', status: 'all' });
  assert.equal(queryMatch.length, 1);
  assert.equal(queryMatch[0].id, 'opp-2');
});

test('mentorship state transitions: create, accept, and decline', () => {
  const initial: MentorshipRequest[] = [];
  const created = createMentorshipRequest(initial, {
    studentId: 'student-1',
    studentName: 'Aarav',
    studentBranch: 'CST 3rd Year',
    studentSemester: 6,
    studentCgpa: 8.8,
    alumniId: 'alumni-1',
    alumniName: 'Priya Goel',
    alumniCompany: 'Google',
    alumniDesignation: 'Senior SWE',
    topic: 'Resume & Portfolio Review',
    message: 'Hello Priya, looking for advice on my resume.',
    preferredMode: 'Google Meet',
  });

  assert.equal(created.length, 1);
  assert.equal(created[0].status, 'pending');

  const accepted = acceptMentorshipRequest(created, created[0].id, 'Accepted!', 'https://meet.google.com/test');
  assert.equal(accepted[0].status, 'accepted');
  assert.equal(accepted[0].meetingUrl, 'https://meet.google.com/test');

  const declined = declineMentorshipRequest(created, created[0].id, 'Unavailable this month.');
  assert.equal(declined[0].status, 'declined');
  assert.equal(declined[0].responseNote, 'Unavailable this month.');
});

test('toggleOpportunityRegistration registers and unregisters student', () => {
  const step1 = toggleOpportunityRegistration(sampleOpportunities, 'opp-1', 'student-123');
  assert.equal(step1[0].registeredStudentIds.includes('student-123'), true);

  const step2 = toggleOpportunityRegistration(step1, 'opp-1', 'student-123');
  assert.equal(step2[0].registeredStudentIds.includes('student-123'), false);
});

test('admin moderation approves opportunity and updates profile', () => {
  const moderatedOpps = moderateOpportunity(sampleOpportunities, 'opp-2', 'approved');
  assert.equal(moderatedOpps.find(o => o.id === 'opp-2')?.status, 'approved');

  const pendingUpdates: PendingProfileUpdate[] = [
    {
      id: 'update-1',
      alumniId: 'alumni-2',
      alumniName: 'Rohan Verma',
      gradYear: 2021,
      currentCompany: 'Blinkit',
      requestedChanges: {
        designation: 'VP of Engineering',
      },
      reason: 'Promotion',
      submittedAt: '2026-11-04',
      status: 'pending',
    },
  ];

  const { updatedPendingUpdates, updatedAlumniList } = moderateProfileUpdate(
    pendingUpdates,
    sampleAlumni,
    'update-1',
    'approved'
  );

  assert.equal(updatedPendingUpdates[0].status, 'approved');
  assert.equal(updatedAlumniList.find(a => a.id === 'alumni-2')?.designation, 'VP of Engineering');
});

test('Zod schemas validate mentorship requests and opportunity postings', () => {
  const validMentorship = mentorshipRequestSchema.safeParse({
    topic: 'DSA & Technical Mock Interview',
    message: 'I would love to get your mentorship on dynamic programming and system design!',
    preferredMode: 'Google Meet',
  });
  assert.equal(validMentorship.success, true);

  const invalidMentorship = mentorshipRequestSchema.safeParse({
    topic: 'DSA & Technical Mock Interview',
    message: 'Too short',
    preferredMode: 'Google Meet',
  });
  assert.equal(invalidMentorship.success, false);

  const validOpp = opportunityPostingSchema.safeParse({
    title: 'Google SDE-1 Referral 2026',
    type: 'job',
    companyOrOrganizer: 'Google',
    location: 'Bengaluru',
    mode: 'Hybrid',
    description: 'Exclusive referral pool for MAIT CST 2026 batch candidates.',
    requirementsText: 'DSA proficiency, C++ or Java.',
    skillsText: 'DSA, Distributed Systems',
    deadlineOrDate: '2026-05-30',
  });
  assert.equal(validOpp.success, true);
});
