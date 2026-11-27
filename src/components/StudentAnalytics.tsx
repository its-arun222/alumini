import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { MentorshipRequest, Opportunity, StudentProfile } from '../types';
import { computeStudentAnalytics } from '../utils/analytics';
import {
  Briefcase,
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface StudentAnalyticsProps {
  student: StudentProfile;
  opportunities: Opportunity[];
  mentorshipRequests: MentorshipRequest[];
  onNavigateTab: (tab: string) => void;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  student,
  opportunities,
  mentorshipRequests,
  onNavigateTab,
}) => {
  const analytics = useMemo(
    () => computeStudentAnalytics(student, opportunities, mentorshipRequests),
    [student, opportunities, mentorshipRequests]
  );

  const nonZeroMentorship = useMemo(
    () => analytics.mentorshipBreakdown.filter((d) => d.value > 0),
    [analytics.mentorshipBreakdown]
  );
  const nonZeroRegistrations = useMemo(
    () => analytics.registrationTypeBreakdown.filter((d) => d.value > 0),
    [analytics.registrationTypeBreakdown]
  );

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Total Opportunities Applied
            </span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.totalOpportunitiesApplied}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Jobs & internships applied ({analytics.totalRegistrations} total sign-ups)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Events Registered
            </span>
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.eventsRegistered}</div>
          <p className="text-xs text-slate-500 mt-1">Webinars, masterclasses & reunions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Mentorship Requests Sent
            </span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.mentorshipRequestsSent}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {analytics.acceptedMentorships} accepted by CST alumni
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Acceptance Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              {analytics.acceptanceRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">mentorship conversion</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Skill match: {analytics.readinessScore}% of top roles
          </p>
        </div>
      </div>

      {/* Application & Mentorship Breakdown (Donut / Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentorship Request Status Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mentorship Requests Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Live distribution of your 1:1 alumni mentorship statuses
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {analytics.mentorshipRequestsSent} Total
            </span>
          </div>

          {nonZeroMentorship.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-200 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700">No mentorship requests yet</p>
              <button
                type="button"
                onClick={() => onNavigateTab('directory')}
                className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Explore Alumni Directory →
              </button>
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nonZeroMentorship}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                    isAnimationActive={false}
                  >
                    {nonZeroMentorship.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Opportunity Registrations by Type Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Opportunity Registrations by Type
              </h3>
              <p className="text-xs text-slate-500">
                Jobs, internships, webinars & reunions you have joined
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {analytics.totalRegistrations} Registered
            </span>
          </div>

          {nonZeroRegistrations.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-200 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700">No opportunity registrations yet</p>
              <button
                type="button"
                onClick={() => onNavigateTab('opportunities')}
                className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Browse Opportunities Board →
              </button>
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nonZeroRegistrations}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                    isAnimationActive={false}
                  >
                    {nonZeroRegistrations.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Skill Readiness Comparison Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Skill Readiness vs. Live Opportunity Demand
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compares your profile skills against the top most-requested skills across all approved opportunities in Firestore.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Readiness Score: {analytics.readinessScore}%</span>
          </div>
        </div>

        {analytics.skillReadiness.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            No approved opportunities with skill tags available yet.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.skillReadiness}
                margin={{ top: 10, right: 20, left: 0, bottom: 28 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={72}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{
                    value: 'Opportunities',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#64748b' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar
                  dataKey="matchedDemand"
                  name="Skills You Already Have"
                  stackId="demand"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="gapDemand"
                  name="Skills to Learn Next"
                  stackId="demand"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actionable Skill Breakdown Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="rounded-xl bg-emerald-50/50 border border-emerald-200/80 p-4">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Matched In-Demand Skills ({analytics.matchedSkills.length})</span>
            </h4>
            {analytics.matchedSkills.length === 0 ? (
              <p className="text-xs text-slate-500">Update your profile skills to see matches here.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analytics.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50/50 border border-amber-200/80 p-4">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Recommended Skills to Learn Next ({analytics.recommendedSkillsToLearn.length})</span>
            </h4>
            {analytics.recommendedSkillsToLearn.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium">
                Great job! Your profile already covers all top requested skills.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analytics.recommendedSkillsToLearn.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
