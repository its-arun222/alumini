import React, { useEffect, useState } from 'react';
import { StudentProfile } from '../types';
import { studentProfileUpdateSchema } from '../utils/alumni-ecosystem';
import { X, Edit3, Save } from 'lucide-react';

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
}

export const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveProfile,
}) => {
  const [name, setName] = useState(student.name);
  const [currentSemester, setCurrentSemester] = useState(String(student.currentSemester));
  const [cgpa, setCgpa] = useState(String(student.cgpa));
  const [skillsText, setSkillsText] = useState(student.skills.join(', '));
  const [interestsText, setInterestsText] = useState(student.interests.join(', '));
  const [dreamCompaniesText, setDreamCompaniesText] = useState(student.dreamCompanies.join(', '));
  const [bio, setBio] = useState(student.bio);
  const [githubUrl, setGithubUrl] = useState(student.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(student.linkedinUrl || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(student.name);
      setCurrentSemester(String(student.currentSemester));
      setCgpa(String(student.cgpa));
      setSkillsText(student.skills.join(', '));
      setInterestsText(student.interests.join(', '));
      setDreamCompaniesText(student.dreamCompanies.join(', '));
      setBio(student.bio);
      setGithubUrl(student.githubUrl || '');
      setLinkedinUrl(student.linkedinUrl || '');
      setError(null);
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const parseList = (text: string) =>
    text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedSemester = Number(currentSemester);
    const parsedCgpa = Number(cgpa);

    const validation = studentProfileUpdateSchema.safeParse({
      name: name.trim(),
      currentSemester: Number.isNaN(parsedSemester) ? -1 : parsedSemester,
      cgpa: Number.isNaN(parsedCgpa) ? -1 : parsedCgpa,
      skillsText: skillsText.trim(),
      interestsText: interestsText.trim(),
      dreamCompaniesText: dreamCompaniesText.trim(),
      bio: bio.trim(),
      githubUrl: githubUrl.trim() || '',
      linkedinUrl: linkedinUrl.trim() || '',
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please check your profile details.');
      return;
    }

    const updatedStudent: StudentProfile = {
      ...student,
      name: name.trim(),
      currentSemester: parsedSemester,
      cgpa: Number(parsedCgpa.toFixed(2)),
      skills: parseList(skillsText),
      interests: parseList(interestsText),
      dreamCompanies: parseList(dreamCompaniesText),
      bio: bio.trim(),
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    };

    onSaveProfile(updatedStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close edit student profile modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Student Academic Profile</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Edit Your Student Profile
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Keep your CST skills, CGPA, and career goals up to date for alumni mentors and the AI Career Counselor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="student-name" className="block text-slate-700 font-semibold mb-1">
              Full Name
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-semester" className="block text-slate-700 font-semibold mb-1">
                Current Semester (1–8)
              </label>
              <input
                id="student-semester"
                type="number"
                min={1}
                max={8}
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="student-cgpa" className="block text-slate-700 font-semibold mb-1">
                Current CGPA (0–10)
              </label>
              <input
                id="student-cgpa"
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="student-skills" className="block text-slate-700 font-semibold mb-1">
              Technical Skills (comma-separated)
            </label>
            <input
              id="student-skills"
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. C++, TypeScript, React, Distributed Systems"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-interests" className="block text-slate-700 font-semibold mb-1">
                Career Interests (comma-separated)
              </label>
              <input
                id="student-interests"
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="e.g. Backend Engineering, Cloud"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="student-dream-companies" className="block text-slate-700 font-semibold mb-1">
                Target Companies (comma-separated)
              </label>
              <input
                id="student-dream-companies"
                type="text"
                value={dreamCompaniesText}
                onChange={(e) => setDreamCompaniesText(e.target.value)}
                placeholder="e.g. Google, Microsoft, Amazon"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="student-bio" className="block text-slate-700 font-semibold mb-1">
              Short Bio & Goals
            </label>
            <textarea
              id="student-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-github" className="block text-slate-700 font-semibold mb-1">
                GitHub URL (Optional)
              </label>
              <input
                id="student-github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="student-linkedin" className="block text-slate-700 font-semibold mb-1">
                LinkedIn URL (Optional)
              </label>
              <input
                id="student-linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
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
              <Save className="w-3.5 h-3.5" />
              <span>Save Student Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
