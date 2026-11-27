import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStudentAnalytics,
  computeInstitutionalAnalytics,
  buildInstitutionalAnalyticsCsv,
} from './analytics';
import { canSubmitSuccessStory, successStorySchema } from './alumni-ecosystem';
import {
  CURRENT_STUDENT,
  ALUMNI_DATA,
  INITIAL_OPPORTUNITIES,
  INITIAL_MENTORSHIP_REQUESTS,
  INITIAL_SUCCESS_STORIES,
} from '../data/seedData';

test('computeStudentAnalytics accurately derives KPIs, breakdowns, and skill readiness', () => {
  const result = computeStudentAnalytics(
    CURRENT_STUDENT,
    INITIAL_OPPORTUNITIES,
    INITIAL_MENTORSHIP_REQUESTS
  );

  // Aarav is registered for 1 job (opp-google-sde1-2026) and 1 webinar (opp-webinar-system-design)
  assert.equal(result.totalOpportunitiesApplied, 1);
  assert.equal(result.eventsRegistered, 1);
  assert.equal(result.totalRegistrations, 2);

  // Aarav sent 2 mentorship requests: 1 accepted, 1 pending => 50% acceptance rate
  assert.equal(result.mentorshipRequestsSent, 2);
  assert.equal(result.acceptedMentorships, 1);
  assert.equal(result.acceptanceRate, 50);

  // Skill readiness identifies matched skills (e.g., C++, Distributed Systems, Node.js, PostgreSQL) vs gaps (e.g., DSA, Kafka)
  assert.ok(result.skillReadiness.length > 0);
  assert.ok(result.matchedSkills.some((s) => s.toLowerCase() === 'c++'));
  assert.ok(result.recommendedSkillsToLearn.length > 0);
  assert.ok(result.readinessScore > 0 && result.readinessScore <= 100);
});

test('computeInstitutionalAnalytics aggregates companies, batches, engagement, and stories', () => {
  const result = computeInstitutionalAnalytics(
    ALUMNI_DATA,
    INITIAL_OPPORTUNITIES,
    INITIAL_MENTORSHIP_REQUESTS,
    INITIAL_SUCCESS_STORIES
  );

  assert.equal(result.totalAlumni, ALUMNI_DATA.length);
  assert.equal(result.approvedOpportunities, 4);
  assert.equal(result.pendingOpportunities, 2);
  assert.equal(result.totalStudentRegistrations, 2);
  assert.equal(result.approvedSuccessStories, 4);
  assert.equal(result.alumniByCompany.length, 8);
  assert.ok(result.alumniByBatch[0].year < result.alumniByBatch[result.alumniByBatch.length - 1].year);
});

test('buildInstitutionalAnalyticsCsv exports properly escaped CSV rows', () => {
  const summary = computeInstitutionalAnalytics(
    ALUMNI_DATA,
    INITIAL_OPPORTUNITIES,
    INITIAL_MENTORSHIP_REQUESTS,
    INITIAL_SUCCESS_STORIES
  );
  const csv = buildInstitutionalAnalyticsCsv(summary, INITIAL_OPPORTUNITIES, '2026-11-26T00:00:00Z');

  assert.ok(csv.includes('SECTION 1: EXECUTIVE SUMMARY'));
  assert.ok(csv.includes('SECTION 2: ALUMNI BY COMPANY'));
  assert.ok(csv.includes('SECTION 3: ALUMNI BY GRADUATION BATCH'));
  assert.ok(csv.includes('SECTION 4: OPPORTUNITIES & REGISTRATIONS'));
  assert.ok(csv.includes('Google'));
  assert.ok(csv.includes('Blinkit (Zomato Group)'));
});

test('success story RBAC and Zod validation enforce Student/Alumni submissions only', () => {
  assert.equal(canSubmitSuccessStory('student'), true);
  assert.equal(canSubmitSuccessStory('alumni'), true);
  assert.equal(canSubmitSuccessStory('admin'), false);

  const valid = successStorySchema.safeParse({
    company: 'Atlassian',
    roleTitle: 'Software Engineering Intern',
    batchYear: '2026',
    mentorName: 'Priya Goel',
    storyText: 'Priya helped me refine my distributed systems project and ran two mock interviews before referrals.',
    tagsText: 'Atlassian, Referral, Mock Interviews',
  });
  assert.equal(valid.success, true);

  const invalid = successStorySchema.safeParse({
    company: 'A',
    roleTitle: 'S',
    batchYear: '26',
    mentorName: 'P',
    storyText: 'Too short',
    tagsText: '',
  });
  assert.equal(invalid.success, false);
});
