import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));

const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

function generateMaitFallbackGuidance(profile: any, question: string): string {
  const name = profile?.name || 'Student';
  const semester = profile?.currentSemester || 6;
  const cgpa = profile?.cgpa || 8.5;
  const skillsList: string[] = Array.isArray(profile?.skills) && profile.skills.length > 0
    ? profile.skills
    : ['C++', 'React', 'Node.js', 'Distributed Systems'];
  const companiesList: string[] = Array.isArray(profile?.dreamCompanies) && profile.dreamCompanies.length > 0
    ? profile.dreamCompanies
    : ['Google', 'Microsoft', 'Blinkit', 'Goldman Sachs'];
  const skills = skillsList.join(', ');
  const companies = companiesList.join(', ');
  const qLower = (question || '').toLowerCase();

  let topicFocusTitle = 'DSA, System Design & Off-Campus Referrals';
  let topicSpecificSteps = `1. **Next 30 Days (Core DSA & Interview Readiness):**
   - Complete NeetCode 150 focusing on Graphs, Dynamic Programming, Sliding Window, and Trees using ${skillsList[0] || 'C++'}.
   - Target a consistent LeetCode contest rating of 1650+ while protecting your **${cgpa} CGPA** during GGSIPU mid-sems.

2. **60-Day Milestone (Production-Grade Proof of Work):**
   - Build and benchmark one flagship backend or full-stack project leveraging **${skillsList.slice(0, 3).join(', ')}** with load-testing metrics on GitHub.
   - Document architecture tradeoffs in a concise README so MAIT alumni reviewers can evaluate depth in 2 minutes.

3. **90-Day Referral Strategy for ${companiesList.slice(0, 2).join(' & ')}:**
   - Use the **MAIT Mentorship Hub** to request a targeted 1:1 resume review from verified MAIT CST alumni before asking for a referral.
   - Prepare a crisp 3-bullet pitch tying your semester ${semester} projects directly to the target team's stack.`;

  if (qLower.includes('ms') || qLower.includes('higher studies') || qLower.includes('abroad') || qLower.includes('gre') || qLower.includes('research')) {
    topicFocusTitle = 'Higher Studies (MS CS Abroad) & Research Profile';
    topicSpecificSteps = `1. **Next 30 Days (Academic & Research Positioning):**
   - Maintain your **${cgpa} CGPA** (crucial for top-30 US/EU MS CS shortlists from GGSIPU) and identify 1–2 MAIT CST faculty guides for a publishable IEEE/Springer paper.
   - Draft a shortlist of 10 universities segmented into Ambitious, Target, and Safe based on your interests in **${skillsList.slice(0, 3).join(', ')}**.

2. **60-Day Milestone (GRE/TOEFL & Research Output):**
   - Lock in GRE (target 320+, Quant 167+) and TOEFL (105+) while shipping a reproducible open-source research repo on GitHub.
   - Build strong relationships with 2 MAIT CST professors and 1 industry/internship mentor for detailed Letters of Recommendation.

3. **90-Day SOP & Alumni Review:**
   - Connect with **Ananya Singhal (MAIT CST '18, Georgia Tech MS CS & Microsoft AI)** via the Mentorship Hub for SOP and lab-selection feedback.`;
  } else if (qLower.includes('system design') || qLower.includes('backend') || qLower.includes('blinkit') || qLower.includes('distributed') || qLower.includes('scale')) {
    topicFocusTitle = 'High-Scale Backend & System Design Track';
    topicSpecificSteps = `1. **Next 30 Days (Core Concurrency & Storage Fundamentals):**
   - Master database indexing, ACID vs eventual consistency, Redis caching patterns, and Kafka event queues alongside your current stack (**${skills}**).
   - Study 10 canonical architectures: Rate Limiter, Real-Time Order Dispatch, Distributed Lock Manager, and URL Shortener.

2. **60-Day Milestone (Flagship Distributed Project):**
   - Ship a fault-tolerant microservice project (e.g., an event-driven inventory/order queue or telemetry pipeline) containerized with Docker and load-tested with k6.
   - Measure p95 latency and throughput under concurrent load and add architecture diagrams to your resume.

3. **90-Day Mock Interviews & Alumni Referrals:**
   - Book a 1:1 System Design review with **Rohan Verma (Blinkit Staff Backend Architect)** or **Priya Goel (Google Cloud L5)** through the MAIT Mentorship Hub.`;
  } else if (qLower.includes('resume') || qLower.includes('referral') || qLower.includes('off-campus') || qLower.includes('internship')) {
    topicFocusTitle = 'Resume Conversion & Off-Campus Referral Playbook';
    topicSpecificSteps = `1. **Next 30 Days (ATS-Ready 1-Page Resume Overhaul):**
   - Convert every project bullet into the XYZ formula (*Accomplished X, measured by Y, by doing Z*) highlighting **${skillsList.slice(0, 4).join(', ')}**.
   - Place CGPA (**${cgpa}**, MAIT CST Sem ${semester}), GitHub, and live deployed project links cleanly in the top header.

2. **60-Day Milestone (Targeted Referral Pipeline):**
   - Track early-career & internship openings at **${companies}** on the MAIT Opportunities Board and career portals 4–6 weeks before deadlines.
   - Send concise referral requests with the exact Job ID, resume PDF, and 2 lines showing stack alignment.

3. **90-Day Interview Conversion:**
   - Run 4 timed mock interviews covering DSA + CS fundamentals (OS, DBMS, CN) with MAIT CST mentors from **${companiesList[0] || 'Google'}**.`;
  } else if (qLower.includes('startup') || qLower.includes('founder') || qLower.includes('product')) {
    topicFocusTitle = 'Early-Stage Startup & Zero-to-One Engineering Track';
    topicSpecificSteps = `1. **Next 30 Days (Full-Stack Velocity):**
   - Sharpen rapid end-to-end shipping using **${skillsList.slice(0, 4).join(', ')}**—early-stage teams hire engineers who own database schema, APIs, and UI end-to-end.
   - Ship one live user-facing product solving a real campus or developer pain point and gather 50+ real users.

2. **60-Day Milestone (Proof of Ownership):**
   - Contribute meaningful PRs to high-growth open-source repositories or build an AI/cloud workflow demo with measurable adoption.

3. **90-Day Founder Mentorship:**
   - Connect with **Ayush Mathur (MAIT CST '16, Co-Founder & CTO, YC W22)** via the MAIT Mentorship Hub for startup engineering and founder-track advice.`;
  }

  return `### 🎯 Direct Verdict for ${name} (MAIT CST, Semester ${semester})

**Focus Area:** ${topicFocusTitle}
**Your Question:** *"${question.trim()}"*

With a **${cgpa} CGPA** and strengths in **${skills}**, you are well-positioned for competitive roles at **${companies}**. Because MAIT CST has an active alumni presence across Delhi NCR (Gurugram/Noida) and Bengaluru, pairing consistent DSA practice with verifiable engineering projects gives you the highest conversion rate.

---

### 🚀 30-60-90 Day Action Blueprint

${topicSpecificSteps}

---

### 💡 High-Yield Resources for MAIT CST Students
- **DSA & Coding Rounds:** NeetCode 150 + Striver's A2Z Sheet + weekly LeetCode/Codeforces contests.
- **System Design & CS Core:** Alex Xu's *System Design Interview (Vol. 1 & 2)*, Martin Kleppmann's *DDIA*, and GGSIPU OS/DBMS/CN fundamentals.
- **Recommended MAIT Alumni Pathways:** Explore the **Alumni Directory** and **Success Stories** to connect with MAIT CST seniors at Google, Microsoft, Blinkit, and Goldman Sachs.

*Tailored MAIT CST Career Counselor guidance generated for your current profile snapshot.*`;
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  systemInstruction: string
): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });
  return response.text?.trim();
}

// Stateless AI Career Guidance Chatbot endpoint (Profile snapshot + current question only)
app.post('/api/career-guidance', async (req, res) => {
  try {
    const { profile, question } = req.body || {};
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const cleanQuestion = question.trim().slice(0, 600);
    const ai = createGeminiClient();
    if (!ai) {
      const fallbackAdvice = generateMaitFallbackGuidance(profile, cleanQuestion);
      return res.json({
        answer: fallbackAdvice,
        modelUsed: 'mait-tailored-fallback',
        isFallback: true,
        fallbackReason: 'Live AI service is currently unavailable; showing tailored MAIT CST career guidance.',
      });
    }

    const systemInstruction = `You are the official Senior AI Career & Placement Counselor for Maharaja Agrasen Institute of Technology (MAIT), Rohini, Delhi (affiliated with GGSIPU), specifically dedicated to the Department of Computer Science & Technology (CST).

CRITICAL ARCHITECTURE:
- This counseling session is strictly STATELESS: evaluate ONLY the student's current profile snapshot and this single question. No conversation history is maintained.
- Speak with practical expertise in the Indian engineering college context, GGSIPU curriculum/exams, Delhi NCR tech hub dynamics (Gurugram/Noida), tier-1 off-campus referral realities (Google, Microsoft, Amazon, Sprinklr, Blinkit, Goldman Sachs), and balancing semesters with DSA, System Design, and Open Source.

Format your response cleanly with concise markdown sections:
1. 🎯 Direct Verdict & Strategic Assessment
2. 🚀 Step-by-Step Action Plan (30-60-90 Days)
3. 💡 High-Yield Resources & Project Ideas for MAIT CST Students
4. 🤝 Recommended MAIT Alumni Pathways (e.g. connecting with MAIT CST alumni at Google, Blinkit, Microsoft, or Goldman Sachs).

Keep it structured, concise (~350-450 words), actionable, and encouraging.`;

    const prompt = `STUDENT PROFILE SNAPSHOT:
Name: ${profile?.name || 'MAIT CST Student'}
College: Maharaja Agrasen Institute of Technology (MAIT), Delhi
Branch: ${profile?.branch || 'Computer Science & Technology (CST)'}
Semester: ${profile?.currentSemester || 6} (Batch ${profile?.batchYear || '2022 - 2026'})
CGPA: ${profile?.cgpa ?? 8.5}
Current Technical Skills: ${(Array.isArray(profile?.skills) ? profile.skills.join(', ') : '') || 'C++, React, Node.js, Distributed Systems'}
Interests: ${(Array.isArray(profile?.interests) ? profile.interests.join(', ') : '') || 'Backend Engineering, Cloud'}
Target / Dream Companies: ${(Array.isArray(profile?.dreamCompanies) ? profile.dreamCompanies.join(', ') : '') || 'Google, Microsoft, Blinkit, Goldman Sachs'}

STUDENT'S CURRENT QUESTION:
"${cleanQuestion}"

Provide targeted, high-impact career advice tailored strictly to this MAIT CST student profile and question.`;

    let text: string | undefined;
    let modelUsed = PRIMARY_GEMINI_MODEL;

    try {
      text = await generateWithModel(ai, PRIMARY_GEMINI_MODEL, prompt, systemInstruction);
    } catch (primaryErr: any) {
      const errMsg = String(primaryErr?.message || primaryErr || '');
      const status = primaryErr?.status ?? primaryErr?.code;
      // If the requested model alias returns 404/NOT_FOUND, retry once with the active flash-lite model
      if (status === 404 || errMsg.includes('NOT_FOUND') || errMsg.includes('not found')) {
        console.warn(`Primary model ${PRIMARY_GEMINI_MODEL} returned 404; retrying with ${FALLBACK_GEMINI_MODEL}.`);
        modelUsed = FALLBACK_GEMINI_MODEL;
        text = await generateWithModel(ai, FALLBACK_GEMINI_MODEL, prompt, systemInstruction);
      } else {
        throw primaryErr;
      }
    }

    if (!text) {
      const fallbackAdvice = generateMaitFallbackGuidance(profile, cleanQuestion);
      return res.json({
        answer: fallbackAdvice,
        modelUsed: 'mait-tailored-fallback',
        isFallback: true,
        fallbackReason: 'Received an empty AI response; showing tailored MAIT CST career guidance.',
      });
    }

    return res.json({
      answer: text,
      modelUsed,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error generating career guidance via Gemini API:', error?.message || error);
    const cleanQuestion = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    const fallbackAdvice = generateMaitFallbackGuidance(req.body?.profile, cleanQuestion);
    const isRateLimit =
      error?.status === 429 ||
      String(error?.message || '').includes('429') ||
      String(error?.message || '').includes('RESOURCE_EXHAUSTED');

    return res.json({
      answer: fallbackAdvice,
      modelUsed: 'mait-tailored-fallback',
      isFallback: true,
      fallbackReason: isRateLimit
        ? 'Gemini API is temporarily rate-limited; showing tailored MAIT CST guidance based on your profile and question.'
        : 'Temporarily unable to reach Gemini live; showing tailored MAIT CST guidance based on your profile and question.',
    });
  }
});

export default app;
