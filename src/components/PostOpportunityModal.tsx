import React, { useState } from 'react';
import { OpportunityType, UserRole, AlumniProfile, Opportunity } from '../types';
import { opportunityPostingSchema } from '../utils/alumni-ecosystem';
import { X, Briefcase, Plus } from 'lucide-react';

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  alumni?: AlumniProfile;
  onPostSuccess: (newOpp: Opportunity) => void;
}

export const PostOpportunityModal: React.FC<PostOpportunityModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  alumni,
  onPostSuccess,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<OpportunityType>('job');
  const [title, setTitle] = useState('');
  const [companyOrOrganizer, setCompanyOrOrganizer] = useState(
    currentRole === 'alumni' && alumni ? alumni.currentCompany : 'Google'
  );
  const [location, setLocation] = useState('Bengaluru / Delhi NCR');
  const [mode, setMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');
  const [description, setDescription] = useState(
    'We are hiring enthusiastic MAIT CST engineers to work on high-throughput backend services and cloud telemetry pipelines.'
  );
  const [requirementsText, setRequirementsText] = useState(
    'Strong DSA in C++ or Java\nKnowledge of Distributed Systems or Cloud basics\nMinimum 7.5 CGPA'
  );
  const [skillsText, setSkillsText] = useState('C++, Go, Distributed Systems, Docker');
  const [deadlineOrDate, setDeadlineOrDate] = useState('2026-06-30');
  const [compensationOrFee, setCompensationOrFee] = useState('₹24 - ₹30 LPA CTC');
  const [linkUrl, setLinkUrl] = useState('https://careers.google.com');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = opportunityPostingSchema.safeParse({
      title,
      type,
      companyOrOrganizer,
      location,
      mode,
      description,
      requirementsText,
      skillsText,
      deadlineOrDate,
      compensationOrFee,
      linkUrl: linkUrl || undefined,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your inputs.');
      return;
    }

    const requirements = requirementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const isAutoApproved = currentRole === 'admin';

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: title.trim(),
      type,
      companyOrOrganizer: companyOrOrganizer.trim(),
      location: location.trim(),
      mode,
      description: description.trim(),
      requirements,
      skills,
      deadlineOrDate,
      postedByRole: currentRole,
      posterId: currentRole === 'alumni' && alumni ? alumni.id : 'admin-mait',
      posterName: currentRole === 'alumni' && alumni ? alumni.name : 'Prof. Dr. S.K. Mittal',
      posterCompany: currentRole === 'alumni' && alumni ? alumni.currentCompany : 'MAIT CST Placement Cell',
      posterGradYear: currentRole === 'alumni' && alumni ? alumni.gradYear : undefined,
      status: isAutoApproved ? 'approved' : 'pending',
      registeredStudentIds: [],
      compensationOrFee: compensationOrFee ? compensationOrFee.trim() : undefined,
      linkUrl: linkUrl ? linkUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
      isReferralByAlumni: currentRole === 'alumni',
    };

    onPostSuccess(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities & Events Board</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Post an Opportunity or Community Event
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {currentRole === 'admin'
              ? 'As Admin, this posting will immediately go live on the student feed.'
              : 'As Alumni, your posting will be routed to the MAIT CST Admin Moderation queue for review.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Opportunity Type */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Opportunity Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'job', label: 'Job Opening' },
                { id: 'internship', label: 'Internship' },
                { id: 'webinar', label: 'Webinar / Talk' },
                { id: 'reunion', label: 'Alumni Reunion' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id as OpportunityType)}
                  className={`py-2 px-3 rounded-xl text-center font-semibold transition-all cursor-pointer ${
                    type === item.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Title / Position Name:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Development Engineer - 1 (CST Referral Pool)"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Company & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Company / Organizing Host:
              </label>
              <input
                type="text"
                value={companyOrOrganizer}
                onChange={(e) => setCompanyOrOrganizer(e.target.value)}
                placeholder="e.g. Google, Blinkit, MAIT ACM Chapter"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Location & City:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gurugram, Delhi NCR, Remote"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Mode & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Work / Event Mode:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Application Deadline or Event Date:
              </label>
              <input
                type="date"
                value={deadlineOrDate}
                onChange={(e) => setDeadlineOrDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Compensation & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Compensation / Stipend / Fee (Optional):
              </label>
              <input
                type="text"
                value={compensationOrFee}
                onChange={(e) => setCompensationOrFee(e.target.value)}
                placeholder="e.g. ₹22 - ₹28 LPA, ₹60,000/mo, or Free"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                External Link or Career Portal (Optional):
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Description (Min 30 characters):
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline role responsibilities, team scope, or event agenda..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Requirements (newline separated) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Requirements (One per line):
            </label>
            <textarea
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              rows={2}
              placeholder="e.g. CST Batch 2026&#10;Proficiency in Java or C++&#10;Min 7.5 CGPA"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Skill tags */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Skill Tags (Comma-separated):
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. C++, Distributed Systems, Kafka, React"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {currentRole === 'admin' ? 'Publish Opportunity' : 'Submit for Admin Moderation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
