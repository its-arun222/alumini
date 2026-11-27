import React from 'react';
import { SuccessStory, UserRole } from '../types';
import { canSubmitSuccessStory } from '../utils/alumni-ecosystem';
import { Award, Building2, Quote, Plus, Sparkles, Clock, UserCheck } from 'lucide-react';

interface SuccessStoriesSectionProps {
  stories: SuccessStory[];
  currentRole: UserRole;
  currentAuthorName?: string;
  onOpenSubmitModal: () => void;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  stories,
  currentRole,
  currentAuthorName,
  onOpenSubmitModal,
}) => {
  const approvedStories = stories.filter((s) => s.status === 'approved');
  const myPendingStories = currentAuthorName
    ? stories.filter(
        (s) =>
          s.status === 'pending' &&
          s.authorName.toLowerCase() === currentAuthorName.toLowerCase()
      )
    : [];

  const allowSubmit = canSubmitSuccessStory(currentRole);

  return (
    <section
      aria-label="MAIT CST Success Stories"
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>MAIT CST Wall of Pride</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Student & Alumni Success Stories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified internship & FTE outcomes unlocked through MAIT CST alumni mentorship and referrals.
          </p>
        </div>

        {allowSubmit && (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Share Success Story</span>
          </button>
        )}
      </div>

      {/* Show author's own pending stories awaiting admin approval */}
      {myPendingStories.length > 0 && (
        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You have <strong>{myPendingStories.length}</strong> submitted success{' '}
              {myPendingStories.length === 1 ? 'story' : 'stories'} awaiting MAIT Admin approval:{' '}
              <span className="font-semibold">
                {myPendingStories.map((s) => `${s.company} (${s.roleTitle})`).join(', ')}
              </span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase shrink-0 self-start sm:self-center">
            Pending Review
          </span>
        </div>
      )}

      {approvedStories.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500">
          <Sparkles className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700">No published success stories yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Be the first MAIT CST student or alumnus to share a placement milestone!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedStories.map((story) => (
            <article
              key={story.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Top Badges: Company + Batch + Author Role */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{story.company}</span>
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                      Batch {story.batchYear}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold capitalize ${
                        story.authorRole === 'alumni'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {story.authorRole}
                    </span>
                  </div>
                </div>

                {/* Role & Author */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{story.roleTitle}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Shared by <span className="font-semibold text-slate-800">{story.authorName}</span>
                  </p>
                </div>

                {/* Quote */}
                <div className="relative bg-white border border-slate-200/80 rounded-lg p-3.5">
                  <Quote className="w-4 h-4 text-blue-200 absolute top-2.5 right-3" />
                  <p className="text-xs text-slate-700 leading-relaxed pr-5">
                    "{story.storyText}"
                  </p>
                </div>
              </div>

              {/* Footer: Mentor Credit + Tags */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200/80 rounded-lg px-2.5 py-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Mentored / Referred by <strong className="font-semibold">{story.mentorName}</strong>
                  </span>
                </div>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {story.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
