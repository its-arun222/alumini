import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole, userPayload?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [emailOrRoll, setEmailOrRoll] = useState('aarav.sharma.cst22@mait.ac.in');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch default credentials based on role tab
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'student') {
      setEmailOrRoll('aarav.sharma.cst22@mait.ac.in');
      setPassword('student123');
    } else if (role === 'alumni') {
      setEmailOrRoll('priya.goel@alumni.mait.ac.in');
      setPassword('alumni123');
    } else {
      setEmailOrRoll('admin.cst@mait.ac.in');
      setPassword('admin123');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrRoll.trim()) {
      setError('Please enter your email or roll number.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter a valid password (minimum 4 characters).');
      return;
    }

    onLogin(selectedRole, { email: emailOrRoll });
  };

  const quickDemoLogin = (role: UserRole) => {
    handleRoleTabChange(role);
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top University Header */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Maharaja Agrasen Institute of Technology (MAIT)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">
              Department of Computer Science & Technology
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px]">
            <span>Affiliated with GGSIPU</span>
            <span>·</span>
            <span>Rohini, Delhi</span>
          </div>
        </div>
      </header>

      {/* Center Auth Container */}
      <main className="max-w-md w-full mx-auto px-4 py-10 sm:py-14">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-700 text-white font-bold text-xl mb-3 shadow-xs">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            MAIT Connect
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Alumni Ecosystem & Career Gateway
          </p>
        </div>

        {/* Clean Segmented Role Selector Tabs */}
        <div className="bg-slate-200/70 p-1 rounded-xl grid grid-cols-3 gap-1 mb-5">
          <button
            type="button"
            onClick={() => handleRoleTabChange('student')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('alumni')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'alumni'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>Alumni</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              {selectedRole === 'student' && 'Student Sign In'}
              {selectedRole === 'alumni' && 'Alumni Portal Sign In'}
              {selectedRole === 'admin' && 'Faculty & Admin Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Email / ID Field */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                {selectedRole === 'student' ? 'Student Email or Roll Number' : 'Official Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={emailOrRoll}
                  onChange={(e) => setEmailOrRoll(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'e.g. 04214803122 or student@mait.ac.in'
                      : selectedRole === 'alumni'
                      ? 'priya.goel@alumni.mait.ac.in'
                      : 'admin.cst@mait.ac.in'
                  }
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Normal Clean Submit CTA */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-slate-500 text-[11px] font-medium mb-2.5">
              One-Click Demo Credentials:
            </p>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => quickDemoLogin('student')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-blue-700">Aarav Sharma</span>
                  <span className="text-[11px] text-slate-500 ml-2">CST 3rd Year · pwd: student123</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  Student
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('alumni')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-700">Priya Goel</span>
                  <span className="text-[11px] text-slate-500 ml-2">Google SWE '19 · pwd: alumni123</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  Alumni
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('admin')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-800">Prof. Dr. S.K. Mittal</span>
                  <span className="text-[11px] text-slate-500 ml-2">Placement HOD · pwd: admin123</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Maharaja Agrasen Institute of Technology · Sector 22, Rohini, Delhi 110086
      </footer>
    </div>
  );
};
