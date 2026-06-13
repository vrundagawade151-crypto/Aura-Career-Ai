import React, { useState } from "react";
import { CareerPath, StudentProfile, ResumeFeedback } from "../types";
import {
  TrendingUp,
  Compass,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  FileText,
  BadgeAlert,
  GraduationCap
} from "lucide-react";

interface CareerRecommendationsProps {
  recommendations: CareerPath[];
  profile: StudentProfile;
  onAskChatAboutCareer: (careerTitle: string, question: string) => void;
}

const SAMPLE_RESUMES = {
  student: `Sarah Jenkins
Email: sarah@email.com | Phone: (555) 123-4567

Education:
Undergraduate Student in Information Systems (GPA: 3.6/4.0)
Expected Graduation: 2027

Skills:
- Basic coding (HTML, CSS, lightweight Python)
- Good verbal speaker
- MS Office Suite, Excel
- Highly organized

Experience:
University Library Assistant (2025 - Present)
- Organized physical books and catalogs.
- Addressed search queries from visitors.
- Conducted inventory assessments weekly.

Retail Sales Associate (2024 - 2025)
- Served retail customers at checkouts.
- Resolved complaints.
- Stocked items on shelves.`,

  careerChanger: `Alex Mercer
Phone: (555) 987-6543 | City: Boston, MA

Education:
B.A. in English Literature, 2020

Skills:
- Copywriting, Editing, Content Creation
- Creative problem solving
- High adaptability
- Communication & Blogging

Experience:
Social Media Intern (2023 - Present)
- Managed daily posts across Instagram and Facebook.
- Drafted weekly blog submissions.
- Responded to simple comments online.

High School English Tutor (2021 - 2023)
- Instructed teenagers in composition.
- Drafted session guides.
- Evaluated regular essays.`
};

export default function CareerRecommendations({
  recommendations,
  profile,
  onAskChatAboutCareer
}: CareerRecommendationsProps) {
  const [activeTabInd, setActiveTabInd] = useState<number>(0);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState<ResumeFeedback | null>(null);
  const [errorText, setErrorText] = useState("");

  const activePath = recommendations[activeTabInd];

  const handleLoadSampleResume = (type: "student" | "careerChanger") => {
    setResumeText(SAMPLE_RESUMES[type]);
    if (activePath) {
      setTargetRole(activePath.title);
    }
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzingResume(true);
    setResumeFeedback(null);
    setErrorText("");

    try {
      const response = await fetch("/api/resume-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          targetRole: activePath ? activePath.title : targetRole || "Recommended Profession"
        })
      });

      if (!response.ok) {
        throw new Error("Could not process resume response. Please verify that server.ts and GEMINI_API_KEY are configured.");
      }

      const data = await response.json();
      setResumeFeedback(data);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An error occurred while evaluating your resume.");
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center" id="no-recommendations">
        <Compass className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No recommendations activated yet.</p>
        <p className="text-slate-400 text-sm mt-1">Submit your profile on the left to activate AI guidance counselors.</p>
      </div>
    );
  }

  // Calculate gaps for the current active path
  const ownedSkillsLocal = profile.skills.map(s => s.toLowerCase().trim());
  const coreSkillsNeeded = activePath.coreSkills;

  const possessedSkills = coreSkillsNeeded.filter(skill =>
    ownedSkillsLocal.some(owned => owned.includes(skill.toLowerCase()) || skill.toLowerCase().includes(owned))
  );

  const missingSkills = coreSkillsNeeded.filter(skill =>
    !ownedSkillsLocal.some(owned => owned.includes(skill.toLowerCase()) || skill.toLowerCase().includes(owned))
  );

  return (
    <div className="space-y-6" id="rec-outer-container">
      {/* 3 Career Choices Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="paths-tabs-grid">
        {recommendations.map((path, idx) => {
          const isActive = idx === activeTabInd;
          return (
            <button
              key={path.id}
              onClick={() => {
                setActiveTabInd(idx);
                setResumeFeedback(null); // Clear previous feedback on tab switch
              }}
              className={`text-left p-5 rounded-2xl border transition duration-200 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-slate-900 border-slate-950 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
              }`}
              id={`path-tab-${path.id}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/10 text-indigo-200" : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    Match #{idx + 1}
                  </span>
                  {/* Circle score indicator */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-9 h-9 transform -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke={isActive ? "rgba(255,255,255,0.1)" : "#f1f5f9"}
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={94}
                        strokeDashoffset={94 - (94 * path.matchScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold mt-0.5">{path.matchScore}%</span>
                  </div>
                </div>

                <h3 className="font-semibold text-base leading-snug tracking-tight mb-1">{path.title}</h3>
                <p className={`text-xs line-clamp-2 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                  {path.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-slate-200/20 flex items-center justify-between">
                <span className="text-[11px] font-medium flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-indigo-400" />
                  <span className={isActive ? "text-slate-300" : "text-slate-500"}>{path.outlook}</span>
                </span>
                <span className="text-xs font-semibold text-indigo-500 flex items-center hover:underline">
                  Analyze <ChevronRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Path Core Details Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8" id="active-path-pane">
        {/* Header and Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight" id="active-path-hdr">{activePath.title}</h2>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                <span>{activePath.outlook}</span>
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">{activePath.description}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-50 text-center min-w-[140px]">
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">Match Potential</span>
            <span className="text-3xl font-extrabold text-indigo-700">{activePath.matchScore}%</span>
            <span className="text-[10px] text-slate-500 mt-1">Based on student profile</span>
          </div>
        </div>

        {/* Why Match Analysis */}
        <div className="space-y-2 bg-gradient-to-r from-indigo-50/30 to-slate-50 p-5 rounded-2xl border border-indigo-50/20">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Why This Fits Your Strengths & Values</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">{activePath.whyMatch}</p>
        </div>

        {/* Competencies & Skill Gap Analysis (Geometric Visualization) */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-6" id="geometric-gap-analysis">
          <div>
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">Geometrical Profiler</span>
            <h3 className="text-lg font-bold text-slate-105 tracking-tight mt-0.5">Skill Gap Analysis & Competency Matrix</h3>
            <p className="text-xs text-slate-400">Comparing your active traits with industry standard blueprints for {activePath.title}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Possessed Competencies list with progress bars */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block border-b border-slate-800 pb-2">
                Established Strengths ({possessedSkills.length})
              </span>
              
              {possessedSkills.length > 0 ? (
                <div className="space-y-4">
                  {possessedSkills.map((skill, index) => {
                    const progressVal = 85 + (index * 4) % 15; // 85% to 95%
                    return (
                      <div className="space-y-2" key={skill}>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-350">
                          <span className="truncate">{skill}</span>
                          <span className="text-emerald-400 font-mono">Expert ({progressVal}%)</span>
                        </div>
                        <div className="h-2 bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progressVal}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic pt-2">No overlapping skills registered yet. Start drafting your tags or goals to align!</p>
              )}
            </div>

            {/* Gap Competencies list with progress bars */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block border-b border-slate-800 pb-2">
                Development Gaps Targeted ({missingSkills.length})
              </span>
              
              {missingSkills.length > 0 ? (
                <div className="space-y-4">
                  {missingSkills.map((skill, index) => {
                    const progressVal = 20 + (index * 7) % 25; // 20% to 45%
                    return (
                      <div className="space-y-2" key={skill}>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-350">
                          <span className="truncate">{skill}</span>
                          <span className="text-indigo-400 font-mono">Curriculum Target ({progressVal}%)</span>
                        </div>
                        <div className="h-2 bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progressVal}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/45 text-emerald-400 rounded-xl border border-emerald-900/30 text-xs font-semibold">
                  ✓ Core competencies complete! Your profile is highly aligned with {activePath.title}!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SDG 4 Quality Education Course Recommendations */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-semibold text-slate-800">Targeted Curriculum & Resource Maps (SDG 4)</h3>
            </div>
            <p className="text-xs text-slate-500">Free/Open educational modules carefully curated to close your active skill gaps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="course-cards-row">
            {activePath.recommendedCourses.map((course, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-sm transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {course.platform}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1">{course.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{course.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Bridges Skill Gaps:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.skillsAddressed.map(skill => (
                      <span key={skill} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career Transition Timeline / Step-by-Step Roadmap */}
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Your Actionable Career Roadmap</h3>
            <p className="text-xs text-slate-500">A clear milestone sequence designed to build your skills, portfolio, and credentials.</p>
          </div>

          <div className="relative border-l border-slate-100 ml-4 py-2 space-y-6" id="roadmap-timeline">
            {activePath.roadmap.map((step, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Visual Circle Indicator */}
                <span className="absolute -left-3 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 border-2 border-indigo-100 text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-xs font-semibold text-slate-700 tracking-tight">Milestone {idx + 1}</p>
                <p className="text-xs text-slate-600 mt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Resume Optimizer */}
        <div className="pt-6 border-t border-slate-100 space-y-5" id="resume_optimizer_panel">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-semibold text-slate-800">AI Resume Optimizer & ATS Matcher</h3>
            </div>
            <p className="text-xs text-slate-500">Analyze your current resume against the <span className="font-semibold text-slate-700">"{activePath.title}"</span> profile. Find improvements and key industry keywords.</p>
          </div>

          <form onSubmit={handleAnalyzeResume} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-500 self-center">Quick Templates:</span>
              <button
                type="button"
                id="load_student_resume_btn"
                onClick={() => handleLoadSampleResume("student")}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition"
              >
                Load Sample Student Resume
              </button>
              <button
                type="button"
                id="load_changer_resume_btn"
                onClick={() => handleLoadSampleResume("careerChanger")}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition"
              >
                Load Career Changer Resume
              </button>
            </div>

            <div className="space-y-1">
              <textarea
                rows={6}
                value={resumeText}
                id="resume_textarea"
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain-text resume here (e.g. details, professional headers, jobs, projects, skills list)..."
                className="w-full p-4 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 placeholder-slate-400 font-mono leading-relaxed"
                required
              />
            </div>

            {errorText && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs flex items-start space-x-2" id="resume-err-box">
                <BadgeAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                id="submit_resume_anlyz_btn"
                disabled={isAnalyzingResume || !resumeText.trim()}
                className={`px-5 py-2 rounded-lg text-xs font-bold text-white flex items-center space-x-2 shadow-sm transition cursor-pointer ${
                  isAnalyzingResume || !resumeText.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isAnalyzingResume ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing Bullet Points & Keywords...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Compare Resume Fit & Optimize</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resume Feedback Display */}
          {resumeFeedback && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6" id="resume_feedback_results">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">ATS Alignment Score</h4>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-extrabold text-indigo-600" id="resume_score">{resumeFeedback.score}</span>
                    <span className="text-slate-400 font-medium text-xs">/ 100</span>
                  </div>
                </div>

                <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 max-w-xl">
                  <p className="text-xs text-slate-600 italic">"{resumeFeedback.summary}"</p>
                </div>
              </div>

              {/* Formatting & Keyword Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Critical Keywords to Introduce</span>
                  <div className="flex flex-wrap gap-1.5" id="keywords_inject_list">
                    {resumeFeedback.missingKeywords.map((kw, i) => (
                      <span key={i} className="text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded font-medium">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Formatting Recommendations</span>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc" id="formatting_suggestions_list">
                    {resumeFeedback.formattingSuggestions.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bullet Rewrites */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Recommended Impact-First Bullet Point Rewrites</span>
                <div className="space-y-4" id="bullet_rewrites_list">
                  {resumeFeedback.bulletRewrites.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 space-y-2.5 shadow-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Standard/Original Phrase:</span>
                          <p className="text-xs text-slate-500 italic mt-0.5 font-mono">"{item.original}"</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-500 uppercase tracking-wider block font-bold">Action-Oriented Metric Upgrade:</span>
                          <p className="text-xs text-slate-800 font-medium mt-0.5 font-mono">"{item.suggested}"</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-indigo-600 bg-indigo-50/50 p-2 rounded-lg">
                        <span className="font-semibold">Counsellor Insight: </span>{item.impactDescription}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Help Prompts to Chat Counselor */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Inquiries for guidance counselor:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAskChatAboutCareer(activePath.title, `What are the average entry-level ranges for a ${activePath.title} role?`)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-slate-100 hover:text-indigo-700 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-50 transition"
            >
              💼 What is the average salary range?
            </button>
            <button
              onClick={() => onAskChatAboutCareer(activePath.title, `What type of hands-on project should I build first to stand out as a ${activePath.title}?`)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-slate-100 hover:text-indigo-700 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-50 transition"
            >
              🛠️ Suggest a Capstone Project
            </button>
            <button
              onClick={() => onAskChatAboutCareer(activePath.title, `How can I network with professional ${activePath.title} mentors online or via LinkedIn?`)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-slate-100 hover:text-indigo-700 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-50 transition"
            >
              🤝 How do I network/find mentors?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
