import React, { useState } from 'react';
import { StudentProfile, AlumniProfile } from '../types';
import { careerQuerySchema } from '../utils/alumni-ecosystem';
import { UserAvatar } from './UserAvatar';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Check, 
  Copy, 
  RefreshCw, 
  Compass, 
  Users, 
  ShieldAlert
} from 'lucide-react';

interface AiCareerGuidanceProps {
  student: StudentProfile;
  alumniList: AlumniProfile[];
  onRequestMentorship: (alumni: AlumniProfile) => void;
}

const SAMPLE_QUESTIONS = [
  "How can a 3rd year MAIT CST student crack Google or Microsoft off-campus referrals?",
  "Evaluate my profile: CGPA 8.84 with C++, Go, and Distributed Systems. What roles should I target?",
  "Compare preparing for high-concurrency backend roles (Blinkit) vs cloud services (AWS).",
  "How do I balance GGSIPU semester exams with LeetCode contests and open-source contributions?",
  "Should I prioritize a high-yield distributed project or competitive programming for 7th semester placement?",
];

export const AiCareerGuidance: React.FC<AiCareerGuidanceProps> = ({
  student,
  alumniList,
  onRequestMentorship,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Suggested alumni to connect with based on question keywords
  const matchedAlumni = alumniList.filter((a) => {
    const qLower = (question + (answer || '')).toLowerCase();
    return (
      qLower.includes(a.currentCompany.toLowerCase()) ||
      a.skills.some((s) => qLower.includes(s.toLowerCase()))
    );
  }).slice(0, 2);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const validation = careerQuerySchema.safeParse({ question });
    if (!validation.success) {
      setValidationError(validation.error.issues[0]?.message || 'Invalid question');
      return;
    }

    setLoading(true);
    setAnswer(null);
    setFallbackNotice(null);

    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: student,
          question: question.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      setAnswer(data.answer);
      if (data.isFallback && data.fallbackReason) {
        setFallbackNotice(data.fallbackReason);
      }
    } catch {
      // Graceful client-side fallback tailored to student's profile and current question
      setFallbackNotice('Live connection was interrupted; showing tailored MAIT CST career guidance for your profile.');
      setAnswer(`### 🎯 Strategic Advice for ${student.name} (MAIT CST, Sem ${student.currentSemester})

**Regarding your question:** *"${question.trim()}"*

Based on your skills (**${student.skills.slice(0, 5).join(', ')}**), CGPA (**${student.cgpa}**), and target companies (**${student.dreamCompanies.slice(0, 4).join(', ')}**):

1. **Target Referral Windows:** Reach out to MAIT CST alumni at ${student.dreamCompanies.slice(0, 2).join(' and ')} 4–6 weeks before early-career hiring windows open.
2. **Project Proof of Work:** Ship a measurable, deployed project using ${student.skills.slice(0, 2).join(' + ')} with benchmarks and clear architecture notes on GitHub.
3. **Core Interview Foundations:** Focus on NeetCode 150 (Graphs, Trees, Dynamic Programming) alongside OS, DBMS, and System Design fundamentals.

*Tip: Connect with verified mentors in the MAIT Mentorship Hub for a 1:1 resume and interview review.*`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer(null);
    setFallbackNotice(null);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with clean white card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stateless AI Career Guidance • Gemini 3.5 Flash Lite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Instant AI Career Guidance for MAIT CST
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Get targeted, institutional advice on technical roadmaps, tier-1 off-campus referrals, competitive programming, and placement drives. Designed as a strictly <span className="font-semibold text-slate-900">stateless</span> advisor: each prompt bundles your current student profile snapshot without storing conversational history on the server.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0 text-xs space-y-1 max-w-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Stateless Architecture</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Zero chat history persisted. Each question receives an unbiased, focused evaluation grounded in your academic snapshot.
            </p>
          </div>
        </div>
      </div>

      {/* Student Profile Snapshot Context Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Profile Context Bundled with Each Query:
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Student: <span className="text-slate-900 font-medium">{student.name}</span> • Roll: {student.rollNo}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Department & Semester</span>
            <span className="font-medium text-slate-800">CST • Semester {student.currentSemester}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Academic Standing</span>
            <span className="font-semibold text-blue-700">CGPA: {student.cgpa}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Key Skills</span>
            <span className="font-medium text-slate-800 truncate block">
              {student.skills.slice(0, 3).join(', ')}...
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Dream Targets</span>
            <span className="font-medium text-blue-700 truncate block">
              {student.dreamCompanies.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interaction Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt Input & Suggested Queries (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Ask Your Career Question</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <textarea
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  rows={4}
                  placeholder="e.g., How should I prepare for Blinkit backend interviews in 6th semester? Or: Review my project stack for Google referrals..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span>{question.length}/600 characters</span>
                  <span>Min 5 chars</span>
                </div>
                {validationError && (
                  <p className="text-xs text-rose-700 mt-1 font-medium">{validationError}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || question.trim().length === 0}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs ${
                    loading || question.trim().length === 0
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Synthesizing Advice...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Generate Guidance</span>
                    </>
                  )}
                </button>

                {answer && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                    title="Clear query and response"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sample Prompts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>MAIT CST Prompt Starters</span>
            </h3>

            <div className="space-y-2">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    setValidationError(null);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40 text-xs text-slate-700 transition-all leading-relaxed cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Guidance Answer & Alumni Pathways (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[420px] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI Career Counselor Report</h3>
                    <p className="text-[11px] text-slate-500">
                      Grounded in MAIT CST placement trends & GGSIPU academic milestones
                    </p>
                  </div>
                </div>

                {answer && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-pulse">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Analyzing profile & question...</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Evaluating tier-1 tech requirements, off-campus referral loops, and MAIT CST curriculum alignment.
                  </p>
                </div>
              ) : answer ? (
                <div className="space-y-3">
                  {fallbackNotice && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      {fallbackNotice}
                    </div>
                  )}
                  <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-5 rounded-xl border border-slate-200">
                    {answer.split('\n').map((rawLine, idx) => {
                      const line = rawLine.trim();
                      if (!line) return null;
                      if (/^-{3,}$/.test(line)) {
                        return <hr key={idx} className="border-slate-200 my-2" />;
                      }
                      const renderInline = (text: string) =>
                        text.split(/(\*\*[^*]+\*\*)/g).map((segment, segIdx) =>
                          segment.startsWith('**') && segment.endsWith('**') ? (
                            <strong key={segIdx} className="font-semibold text-slate-900">
                              {segment.slice(2, -2)}
                            </strong>
                          ) : (
                            <React.Fragment key={segIdx}>{segment}</React.Fragment>
                          )
                        );
                      if (line.startsWith('### ')) {
                        return (
                          <h4
                            key={idx}
                            className="text-sm font-bold text-slate-900 pt-2 first:pt-0"
                          >
                            {renderInline(line.replace(/^###\s+/, ''))}
                          </h4>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h3
                            key={idx}
                            className="text-sm font-bold text-blue-900 pt-2 first:pt-0"
                          >
                            {renderInline(line.replace(/^##\s+/, ''))}
                          </h3>
                        );
                      }
                      if (/^[-*•]\s+/.test(line)) {
                        return (
                          <div key={idx} className="flex items-start gap-2 pl-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span>{renderInline(line.replace(/^[-*•]\s+/, ''))}</span>
                          </div>
                        );
                      }
                      return <p key={idx}>{renderInline(line)}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <Bot className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <h4 className="text-base font-bold text-slate-800">No Query Submitted Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Type a career or preparation question on the left, or click one of the suggested MAIT CST prompt starters to receive customized advice from Gemini.
                  </p>
                </div>
              )}
            </div>

            {/* Matched Alumni Mentors Box - using UserAvatar instead of img */}
            {answer && matchedAlumni.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Relevant CST Alumni Mentors to Connect With:</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedAlumni.map((alm) => (
                    <div
                      key={alm.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar name={alm.name} size="sm" variant="alumni" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{alm.name}</p>
                          <p className="text-[11px] text-slate-600 truncate">
                            {alm.currentCompany} • CST '{alm.gradYear.toString().slice(-2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onRequestMentorship(alm)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Request 1:1
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
