import React, { useState } from 'react';
import { AlumniProfile, SuccessStory } from '../types';
import { successStorySchema } from '../utils/alumni-ecosystem';
import { Award, X, Send, CheckCircle2 } from 'lucide-react';

interface SubmitSuccessStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
  authorRole: 'student' | 'alumni';
  defaultBatchYear: string;
  alumniList: AlumniProfile[];
  onSubmitStory: (story: SuccessStory) => Promise<void> | void;
}

export const SubmitSuccessStoryModal: React.FC<SubmitSuccessStoryModalProps> = ({
  isOpen,
  onClose,
  authorName,
  authorRole,
  defaultBatchYear,
  alumniList,
  onSubmitStory,
}) => {
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [batchYear, setBatchYear] = useState(defaultBatchYear);
  const [mentorName, setMentorName] = useState('');
  const [storyText, setStoryText] = useState('');
  const [tagsText, setTagsText] = useState('Alumni Referral, Mentorship, Placement');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = successStorySchema.safeParse({
      company: company.trim(),
      roleTitle: roleTitle.trim(),
      batchYear: batchYear.trim(),
      mentorName: mentorName.trim(),
      storyText: storyText.trim(),
      tagsText: tagsText.trim(),
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Please complete all required fields.');
      return;
    }

    const tags = parsed.data.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    const newStory: SuccessStory = {
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorName,
      authorRole,
      batchYear: parsed.data.batchYear,
      company: parsed.data.company,
      roleTitle: parsed.data.roleTitle,
      mentorName: parsed.data.mentorName,
      storyText: parsed.data.storyText,
      tags: tags.length > 0 ? tags : ['MAIT CST'],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSubmitStory(newStory);
      setCompany('');
      setRoleTitle('');
      setMentorName('');
      setStoryText('');
      setTagsText('Alumni Referral, Mentorship, Placement');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to submit success story right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close success story modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Submit Placement / Mentorship Milestone</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Share Your Success Story</h2>
          <p className="text-xs text-slate-500 mt-1">
            Posting as <strong className="text-slate-800">{authorName}</strong> ({authorRole}). Stories are saved to Cloud Firestore as <strong className="text-amber-700">pending</strong> until approved by MAIT CST Admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="story-company" className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization *
              </label>
              <input
                id="story-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft, Atlassian"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label htmlFor="story-role" className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Offer Title *
              </label>
              <input
                id="story-role"
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., SWE Intern, SDE-1 (FTE)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="story-batch" className="block text-xs font-semibold text-slate-700 mb-1">
                MAIT CST Batch Year *
              </label>
              <input
                id="story-batch"
                type="text"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="e.g., 2026 or 2022 - 2026"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label htmlFor="story-mentor" className="block text-xs font-semibold text-slate-700 mb-1">
                Alumni Mentor / Referrer Name *
              </label>
              <input
                id="story-mentor"
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="e.g., Priya Goel"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Quick-select verified MAIT alumni mentors */}
          {alumniList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Quick-credit mentor:</span>
              {alumniList.slice(0, 4).map((alm) => (
                <button
                  key={alm.id}
                  type="button"
                  onClick={() => setMentorName(alm.name)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {alm.name} ({alm.currentCompany.split(' ')[0]})
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="story-text" className="block text-xs font-semibold text-slate-700 mb-1">
              Your Journey & How MAIT Alumni Helped *
            </label>
            <textarea
              id="story-text"
              rows={4}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Share how mock interviews, resume reviews, referrals, or project feedback from MAIT CST mentors helped you land this offer..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="story-tags" className="block text-xs font-semibold text-slate-700 mb-1">
              Topic Tags (comma-separated) *
            </label>
            <input
              id="story-tags"
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g., Off-Campus Referral, System Design, DSA"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Moderated by MAIT CST Faculty</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Submit Story for Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
