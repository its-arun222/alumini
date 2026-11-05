import React from 'react';
import { UserRole, StudentProfile, AlumniProfile } from '../types';
import { GraduationCap, Briefcase, ShieldCheck, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  student: StudentProfile;
  alumniList: AlumniProfile[];
  selectedAlumniId: string;
  onSelectAlumniId: (id: string) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  student,
  alumniList,
  selectedAlumniId,
  onSelectAlumniId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            Portal Persona Switcher
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Select Portal Role</h2>
          <p className="text-sm text-slate-600 mt-1">
            Experience MAIT Connect from the perspective of a current CST student, an industry alumnus, or department administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Role */}
          <div
            onClick={() => {
              onSelectRole('student');
              onClose();
            }}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
              currentRole === 'student'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                {currentRole === 'student' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">Student Persona</h3>
              <p className="text-xs text-blue-700 font-semibold mt-0.5">{student.name}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                MAIT CST 3rd Year • CGPA 8.84. Seeking referrals, mock interviews, and career guidance.
              </p>
            </div>
            <button className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>Enter as Student</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alumni Role */}
          <div
            onClick={() => {
              onSelectRole('alumni');
              onClose();
            }}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
              currentRole === 'alumni'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Briefcase className="w-5 h-5" />
                </div>
                {currentRole === 'alumni' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">Alumni Persona</h3>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">Priya Goel (Google '19)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Senior SWE at Google Cloud. Mentors MAIT juniors, reviews 1:1 requests, and posts job referrals.
              </p>
            </div>
            <button className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>Enter as Alumni</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Role */}
          <div
            onClick={() => {
              onSelectRole('admin');
              onClose();
            }}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
              currentRole === 'admin'
                ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                {currentRole === 'admin' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">Admin & Faculty</h3>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">Prof. Dr. S.K. Mittal</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Head of CST Placements & Alumni Relations. Moderates opportunity postings & profile updates.
              </p>
            </div>
            <button className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>Enter as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-selector for Alumni if in Alumni role */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Active Alumni Profile:</span>
          <select
            value={selectedAlumniId}
            onChange={(e) => onSelectAlumniId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {alumniList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currentCompany} - CST '{a.gradYear.toString().slice(-2)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
