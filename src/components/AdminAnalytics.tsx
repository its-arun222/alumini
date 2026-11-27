import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  AlumniProfile,
  MentorshipRequest,
  Opportunity,
  SuccessStory,
} from '../types';
import {
  buildInstitutionalAnalyticsCsv,
  computeInstitutionalAnalytics,
} from '../utils/analytics';
import {
  Download,
  Building2,
  GraduationCap,
  BarChart3,
  Users,
  Briefcase,
  MessageSquare,
  Award,
} from 'lucide-react';

interface AdminAnalyticsProps {
  alumniList: AlumniProfile[];
  opportunities: Opportunity[];
  mentorshipRequests: MentorshipRequest[];
  successStories: SuccessStory[];
  onExportSuccess?: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  alumniList,
  opportunities,
  mentorshipRequests,
  successStories,
  onExportSuccess,
}) => {
  const summary = useMemo(
    () =>
      computeInstitutionalAnalytics(
        alumniList,
        opportunities,
        mentorshipRequests,
        successStories
      ),
    [alumniList, opportunities, mentorshipRequests, successStories]
  );

  const handleExportCsv = () => {
    const csvContent = buildInstitutionalAnalyticsCsv(summary, opportunities);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `mait-cst-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onExportSuccess?.();
  };

  const nonZeroMentorships = useMemo(
    () => summary.mentorshipStatusBreakdown.filter((d) => d.value > 0),
    [summary.mentorshipStatusBreakdown]
  );

  return (
    <div className="space-y-6">
      {/* Header & CSV Export Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Live Cloud Firestore Metrics</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            MAIT CST Institutional Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alumni placement footprint, graduation cohort strength, and student engagement metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* Institutional Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide">Verified Alumni</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalAlumni}</div>
          <p className="text-xs text-slate-500 mt-1">
            Across {summary.alumniByCompany.length} companies & {summary.alumniByBatch.length} batches
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide">Opportunities</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summary.approvedOpportunities}{' '}
            <span className="text-xs font-semibold text-amber-700">
              (+{summary.pendingOpportunities} pending)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.totalStudentRegistrations} total student registrations
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide">Mentorship Activity</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalMentorshipRequests}</div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.acceptedMentorshipRequests} accepted · {summary.pendingMentorshipRequests} pending
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide">Success Stories</span>
            <Award className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.approvedSuccessStories}</div>
          <p className="text-xs text-slate-500 mt-1">
            Published ({summary.pendingSuccessStories} awaiting review)
          </p>
        </div>
      </div>

      {/* Row 1: Alumni by Company (Horizontal Bar) + Alumni by Graduation Batch (Vertical Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Alumni Distribution by Company</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top employers where verified MAIT CST alumni currently work
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.alumniByCompany}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 12, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="company"
                  width={135}
                  tick={{ fontSize: 11, fill: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Alumni Count"
                  fill="#2563eb"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Alumni Distribution by Graduation Batch</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Number of verified MAIT CST alumni per graduation year
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.alumniByBatch}
                margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Alumni"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Platform Engagement Overview (Bar + Mentorship Status Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Platform Engagement Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved vs. pending opportunities, total student registrations, mentorship outcomes, and published success stories
            </p>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.platformEngagementOverview}
                margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={56}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Records"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                  isAnimationActive={false}
                >
                  {summary.platformEngagementOverview.map((entry) => (
                    <Cell key={entry.metric} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Mentorship Request Statuses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accepted, pending, and declined across MAIT CST
            </p>
          </div>

          {nonZeroMentorships.length === 0 ? (
            <div className="h-[270px] flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No mentorship requests recorded yet.
            </div>
          ) : (
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nonZeroMentorships}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    isAnimationActive={false}
                  >
                    {nonZeroMentorships.map((entry) => (
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
    </div>
  );
};
