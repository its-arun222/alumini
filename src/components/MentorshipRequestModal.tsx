import React, { useState } from 'react';
import { AlumniProfile, StudentProfile, MentorshipTopic } from '../types';
import { mentorshipRequestSchema } from '../utils/alumni-ecosystem';
import { UserAvatar } from './UserAvatar';
import { X, Send, MessageSquare } from 'lucide-react';

interface MentorshipRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  alumniList: AlumniProfile[];
  initialAlumni?: AlumniProfile | null;
  onSubmitRequest: (data: {
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
  }) => void;
}

const TOPICS: MentorshipTopic[] = [
  'Resume & Portfolio Review',
  'DSA & Technical Mock Interview',
  'System Design & Distributed Systems',
  'Off-Campus Referral Strategy',
  'Higher Studies & MS Abroad',
  'Early-Stage Startup & Tech Lead',
];

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  isOpen,
  onClose,
  student,
  alumniList,
  initialAlumni,
  onSubmitRequest,
}) => {
  if (!isOpen) return null;

  const availableAlumni = alumniList.filter((a) => a.isAvailableForMentoring);
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>(
    initialAlumni?.id || availableAlumni[0]?.id || ''
  );
  const [topic, setTopic] = useState<MentorshipTopic>('Resume & Portfolio Review');
  const [preferredMode, setPreferredMode] = useState<'Google Meet' | 'LinkedIn Voice/Chat' | 'In-person @ MAIT'>('Google Meet');
  const [message, setMessage] = useState(
    'Hello! I am a 6th semester CST student at MAIT. I would love your advice on preparing for technical interviews and refining my project portfolio.'
  );
  const [error, setError] = useState<string | null>(null);

  const selectedAlumni = alumniList.find((a) => a.id === selectedAlumniId) || initialAlumni || availableAlumni[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = mentorshipRequestSchema.safeParse({
      topic,
      message,
      preferredMode,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please fix errors in the form.');
      return;
    }

    if (!selectedAlumni) {
      setError('Please select a valid alumni mentor.');
      return;
    }

    onSubmitRequest({
      studentId: student.id,
      studentName: student.name,
      studentBranch: `CST Sem ${student.currentSemester}`,
      studentSemester: student.currentSemester,
      studentCgpa: student.cgpa,
      alumniId: selectedAlumni.id,
      alumniName: selectedAlumni.name,
      alumniCompany: selectedAlumni.currentCompany,
      alumniDesignation: selectedAlumni.designation,
      topic,
      message: message.trim(),
      preferredMode,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
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
            <MessageSquare className="w-3.5 h-3.5" />
            <span>1:1 Mentorship Request</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Connect with a MAIT CST Alumnus
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Submit your goals and questions. The alumnus will review and solely Accept or Decline your request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select Mentor */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Alumni Mentor:
            </label>
            <select
              value={selectedAlumniId}
              onChange={(e) => setSelectedAlumniId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {availableAlumni.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.designation} at {a.currentCompany} (CST '{a.gradYear.toString().slice(-2)})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Mentor Card Preview with UserAvatar */}
          {selectedAlumni && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <UserAvatar name={selectedAlumni.name} size="md" variant="alumni" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 truncate">{selectedAlumni.name}</p>
                <p className="text-[11px] text-slate-600 truncate">
                  {selectedAlumni.designation} at {selectedAlumni.currentCompany}
                </p>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                Verified Mentor
              </span>
            </div>
          )}

          {/* Mentorship Topic */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mentorship Topic:
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as MentorshipTopic)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Communication Mode */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Preferred Discussion Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Google Meet', 'LinkedIn Voice/Chat', 'In-person @ MAIT'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPreferredMode(mode)}
                  className={`py-2 px-2 rounded-xl text-center font-semibold transition-all cursor-pointer ${
                    preferredMode === mode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Your Message & Specific Questions (Min 20 characters):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Introduce your current projects, skills, target companies, and the specific guidance you are hoping to get..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>{message.length} characters</span>
              <span>Minimum 20 characters required</span>
            </div>
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
              <span>Submit Mentorship Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
