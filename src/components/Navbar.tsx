import React from 'react';
import { UserRole, StudentProfile, AlumniProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Repeat,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  student: StudentProfile;
  alumni: AlumniProfile;
  pendingModerationCount: number;
  onOpenRoleModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  student,
  alumni,
  pendingModerationCount,
  onOpenRoleModal,
  onLogout,
}) => {
  const currentName = 
    currentRole === 'student'
      ? student.name
      : currentRole === 'alumni'
      ? alumni.name
      : 'Prof. Dr. S.K. Mittal';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Top institutional banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-1.5 text-xs text-slate-600 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Maharaja Agrasen Institute of Technology (MAIT), Delhi</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600 hidden sm:inline">Department of Computer Science & Technology</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Affiliated with GGSIPU</span>
            <span>·</span>
            <span className="text-blue-700 font-medium">Alumni Relations Cell</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">MAIT Connect</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  CST
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Alumni & Placement Network</p>
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alumni Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'opportunities'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Opportunities</span>
            </button>

            <button
              onClick={() => setActiveTab('mentorship')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mentorship'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mentorship</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-guidance')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-guidance'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Advisor</span>
            </button>

            {/* Admin Moderation Tab */}
            <button
              onClick={() => setActiveTab('admin-moderation')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'admin-moderation'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Moderation</span>
              {pendingModerationCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingModerationCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Persona & Role Switcher + Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors cursor-pointer"
              title="Click to switch persona (Student, Alumni, Admin)"
            >
              <UserAvatar name={currentName} size="sm" variant={currentRole} />

              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {currentName}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded capitalize ${
                      currentRole === 'student'
                        ? 'bg-blue-50 text-blue-700'
                        : currentRole === 'alumni'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {currentRole}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentRole === 'student'
                    ? 'CST Sem 6'
                    : currentRole === 'alumni'
                    ? `${alumni.currentCompany}`
                    : 'Faculty Admin'}
                </p>
              </div>

              <div className="flex items-center text-slate-400 pl-0.5">
                <Repeat className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sign Out to Login Page"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 overflow-x-auto space-x-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'directory' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'opportunities' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Opportunities
          </button>
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'mentorship' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Mentorship
          </button>
          <button
            onClick={() => setActiveTab('ai-guidance')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'ai-guidance' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            AI Advisor
          </button>
          <button
            onClick={() => setActiveTab('admin-moderation')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'admin-moderation' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Moderation ({pendingModerationCount})
          </button>
        </div>
      </div>
    </header>
  );
};
