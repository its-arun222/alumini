import React, { useState } from 'react';
import { AlumniProfile, PendingProfileUpdate } from '../types';
import { profileUpdateSchema } from '../utils/alumni-ecosystem';
import { X, Send, ShieldCheck } from 'lucide-react';

interface RequestProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: AlumniProfile;
  onSubmitUpdate: (newUpdate: PendingProfileUpdate) => void;
}

export const RequestProfileUpdateModal: React.FC<RequestProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  alumni,
  onSubmitUpdate,
}) => {
  if (!isOpen) return null;

  const [company, setCompany] = useState(alumni.currentCompany);
  const [designation, setDesignation] = useState(alumni.designation);
  const [location, setLocation] = useState(alumni.location);
  const [skillsText, setSkillsText] = useState(alumni.skills.join(', '));
  const [bio, setBio] = useState(alumni.bio);
  const [reason, setReason] = useState('Recent promotion / role transition');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = profileUpdateSchema.safeParse({
      company,
      designation,
      location,
      skillsText,
      bio,
      reason,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your inputs.');
      return;
    }

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newUpdate: PendingProfileUpdate = {
      id: `update-${Date.now()}`,
      alumniId: alumni.id,
      alumniName: alumni.name,
      gradYear: alumni.gradYear,
      currentCompany: alumni.currentCompany,
      requestedChanges: {
        company: company !== alumni.currentCompany ? company.trim() : undefined,
        designation: designation !== alumni.designation ? designation.trim() : undefined,
        location: location !== alumni.location ? location.trim() : undefined,
        skills: skills.length > 0 ? skills : undefined,
        bio: bio !== alumni.bio ? bio.trim() : undefined,
      },
      reason: reason.trim(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    onSubmitUpdate(newUpdate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Alumni Credentials</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Request Profile Update
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            To maintain high institutional trust for MAIT CST students, profile changes are reviewed by the MAIT CST Placement Cell before updating in the directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Current Company:
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              New Designation / Job Title:
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Location:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Skills (Comma-separated):
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Bio Summary:
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Reason for Update (Min 10 chars):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promoted to Senior Engineering Manager or relocated to Redmond HQ"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Admin Moderation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
