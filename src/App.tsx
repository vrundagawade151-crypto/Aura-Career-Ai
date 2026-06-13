import React, { useState, useEffect } from "react";
import { StudentProfile as StudentProfileType, CareerPath, ChatMessage } from "./types";
import StudentProfile from "./components/StudentProfile";
import CareerRecommendations from "./components/CareerRecommendations";
import CounselorChatbot from "./components/CounselorChatbot";
import { GraduationCap, Sparkles, MessageSquare, Compass, Award, RefreshCw, UserCheck, HelpCircle } from "lucide-react";

const LOCAL_STORAGE_KEYS = {
  PROFILE: "ai_career_guidance_profile_v1",
  RECOMMENDATIONS: "ai_career_guidance_recs_v1",
  CHAT_MESSAGES: "ai_career_guidance_chat_v1"
};

const DEFAULT_PROFILE: StudentProfileType = {
  name: "Sarah Jenkins",
  currentLevel: "Undergraduate Scholar",
  fieldOfStudy: "Information Systems",
  interests: ["Technology & AI", "Solving Complex Problems", "Data Analysis & Math"],
  skills: ["Python Coding", "Critical Thinking", "Team Collaboration"],
  strengths: ["Analytical Mindset", "Empathetic Communication", "Meticulous Attention to Detail"],
  workStyle: "Dynamic Team Environment"
};

// Default initial chatbot greeting
const INITIAL_CHAT = (name: string): ChatMessage[] => [
  {
    role: "model",
    text: `Hello ${name}! Welcome to GuidanceAI, your career advisor.

Aligning with **UN SDG Goal 4: Quality Education**, my mission is to remove structural guidance barriers and empower you with highly targeted roadmap options.

To get started:
1. Define your traits and skills in the **Student Profile** tab.
2. Click **Generate Pathways** to get tailored career options.
3. Speak with me here or paste your current CV to get real-time resume reviews!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export default function App() {
  const [profile, setProfile] = useState<StudentProfileType>(DEFAULT_PROFILE);
  const [recommendations, setRecommendations] = useState<CareerPath[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [activeTab, setActiveTab] = useState<"profile" | "pathways" | "chatbot">("profile");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
      const storedRecs = localStorage.getItem(LOCAL_STORAGE_KEYS.RECOMMENDATIONS);
      const storedChat = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedRecs) {
        setRecommendations(JSON.parse(storedRecs));
        // If they already have recommendations, they can go directly to pathways tab
        setActiveTab("pathways");
      }
      if (storedChat) {
        setChatMessages(JSON.parse(storedChat));
      } else {
        setChatMessages(INITIAL_CHAT(storedProfile ? JSON.parse(storedProfile).name : DEFAULT_PROFILE.name));
      }
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }
  }, []);

  // Save profile changes
  const handleSaveProfile = async (updatedProfile: StudentProfileType) => {
    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
    setErrorMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });

      if (!response.ok) {
        throw new Error("Pathway request declined. Please verify that server.ts is compiling and your secrets are configured correctly.");
      }

      const data = await response.json();
      const recs: CareerPath[] = data.recommendations || [];
      
      setRecommendations(recs);
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recs));
      setActiveTab("pathways");

      // Inject notification response from counselor on paths
      const pathNames = recs.map(r => r.title).join(", ");
      const newCounselMessage: ChatMessage = {
        role: "model",
        text: `Success! I have successfully processed your student profile and created 3 custom pathways:

• **${recs[0]?.title}** (Estimated matching potential: ${recs[0]?.matchScore}%)
• **${recs[1]?.title}** (Estimated matching potential: ${recs[1]?.matchScore}%)
• **${recs[2]?.title}** (Estimated matching potential: ${recs[2]?.matchScore}%)

I've unlocked the **Career Pathways Explorer** for you! Check them out, review course platforms to close any skill gaps, and feel free to ask me specifics about qualifications or salary expectations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => {
        const next = [...prev, newCounselMessage];
        localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(next));
        return next;
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unknown error prevented generating suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat Submission Handler
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updatedMessages));
    setIsChatSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(-10), // Send last 10 messages to save context space
          profile,
          currentPath: recommendations[0]?.title || null
        })
      });

      if (!response.ok) {
        throw new Error("Counseling service unresponsive. Ensure server.ts is active.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => {
        const next = [...prev, assistantMsg];
        localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(next));
        return next;
      });
    } catch (err: any) {
      console.error(err);
      const systemErrorMsg: ChatMessage = {
        role: "model",
        text: `I'm currently experiencing technical difficulties connecting to my cognitive advisor. Please verify that process.env.GEMINI_API_KEY is configured in your platform Secrets. Detailed explanation: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, systemErrorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleAskChatAboutCareer = (careerTitle: string, question: string) => {
    setActiveTab("chatbot");
    handleSendMessage(`[Focus Topic: ${careerTitle}] ${question}`);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to restore the default chat session?")) {
      const cleared = INITIAL_CHAT(profile.name);
      setChatMessages(cleared);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(cleared));
    }
  };

  const handleResetApplication = () => {
    if (window.confirm("Ready to start fresh? This will reset your profile details and remove saved pathways.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROFILE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.RECOMMENDATIONS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CHAT_MESSAGES);
      
      setProfile(DEFAULT_PROFILE);
      setRecommendations([]);
      setChatMessages(INITIAL_CHAT(DEFAULT_PROFILE.name));
      setActiveTab("profile");
      setErrorMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900" id="app-root">
      
      {/* Left Navigation Sidebar - Geometric Grid Alignment & Structure (Shown on desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0" id="left-structural-sidebar">
        <div className="p-8 border-b border-slate-200/65">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-950">Aura Career AI</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SDG 4: Quality Edu</p>
        </div>

        {/* Left Nav menu items */}
        <nav className="flex-1 px-4 py-8 space-y-1.5" id="tabs-group">
          <button
            onClick={() => setActiveTab("profile")}
            id="tab_profile_trigger"
            className={`w-full p-3.5 rounded-xl font-bold flex items-center text-xs transition-colors duration-150 ${
              activeTab === "profile"
                ? "bg-slate-50 text-indigo-700 border-none"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${activeTab === "profile" ? "bg-indigo-600" : "bg-slate-300"}`}></span>
            Student Profile
          </button>

          <button
            onClick={() => recommendations.length > 0 && setActiveTab("pathways")}
            id="tab_pathways_trigger"
            disabled={recommendations.length === 0}
            className={`w-full p-3.5 rounded-xl font-bold flex items-center text-xs transition-colors duration-150 ${
              recommendations.length === 0
                ? "opacity-35 cursor-not-allowed text-slate-400"
                : activeTab === "pathways"
                ? "bg-slate-50 text-indigo-700 border-none"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${recommendations.length === 0 ? "bg-slate-200" : activeTab === "pathways" ? "bg-indigo-600" : "bg-slate-400"}`}></span>
            Career Path Map
          </button>

          <button
            onClick={() => setActiveTab("chatbot")}
            id="tab_chatbot_trigger"
            className={`w-full p-3.5 rounded-xl font-bold flex items-center text-xs transition-colors duration-150 ${
              activeTab === "chatbot"
                ? "bg-slate-50 text-indigo-700 border-none"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${activeTab === "chatbot" ? "bg-indigo-600" : "bg-slate-300"}`}></span>
            Counselor Chat & Lab
          </button>
        </nav>

        {/* Dynamic Jordan Miller Student Profile Badge */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100/40">
            <p className="text-[10px] font-bold text-indigo-900 mb-1 tracking-wider uppercase">Active Profile</p>
            <p className="text-sm font-bold text-indigo-800 truncate">{profile.name}</p>
            <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold mt-1 truncate">{profile.currentLevel}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (Shown on mobile devices) */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shrink-0" id="mobile-top-header">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800">Aura Career AI</h2>
            <p className="text-[9px] text-slate-400 font-medium">SDG 4: Quality Education</p>
          </div>
        </div>
        
        <div className="flex space-x-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200" id="tabs-group-mobile">
          <button 
            onClick={() => setActiveTab("profile")} 
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === "profile" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500"}`}
          >
            Profile
          </button>
          <button 
            onClick={() => recommendations.length > 0 && setActiveTab("pathways")}
            disabled={recommendations.length === 0}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${recommendations.length === 0 ? "opacity-30 cursor-not-allowed" : activeTab === "pathways" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500"}`}
          >
            Explorer
          </button>
          <button 
            onClick={() => setActiveTab("chatbot")}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === "chatbot" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500"}`}
          >
            Chat
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50" id="main-content-layout">
        
        {/* Top Header - Symmetrical System Indicators */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">System Status:</span>
            <span className="flex items-center text-emerald-600 font-bold text-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              AI Recommendations Active
            </span>
          </div>
          <div className="flex space-x-6 text-xs font-bold text-slate-600 items-center">
            <span className="hidden sm:inline-block bg-slate-100/60 text-slate-500 px-2.5 py-1 rounded">React Framework Setup</span>
            {recommendations.length > 0 && (
              <button
                type="button"
                id="reset_app_btn"
                onClick={handleResetApplication}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center space-x-1.5 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Reset Map</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Box with geometric spacings */}
        <div className="p-6 md:p-10 flex-1 flex flex-col space-y-8" id="stage-main">
          
          {/* SDG 4 Quality Education Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6" id="sdg-banner">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] text-white font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-inner">SDG Goal 4</span>
                <span className="text-xs text-indigo-300 font-semibold tracking-wider">Quality Education & Integration Matrix</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">SDG 4: Equitable Professional Competence Guide</h2>
              <p className="text-xs text-slate-300/90 leading-relaxed max-w-4xl">
                Empolying state of the art models to address structural barriers in guidance. Generates direct skill gaps reports, lists open educational pathways to address goals, and evaluates text resumes against ATS requirements.
              </p>
            </div>
          </div>

          {/* Global Error message reporting */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center justify-between shadow-xs" id="global-err-box">
              <span className="font-semibold">{errorMessage}</span>
              <button onClick={() => setErrorMessage("")} className="font-extrabold underline ml-2 text-[10px] hover:text-rose-900">Dismiss</button>
            </div>
          )}

          {/* Tab Outlet */}
          <div className="grid grid-cols-1 gap-8" id="tab_views_outlet">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <StudentProfile
                    initialProfile={profile}
                    onSave={handleSaveProfile}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Left side checklist card & details info panel */}
                <div className="space-y-6" id="side-info-board">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Resume Health Blueprint</h3>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="176" strokeDashoffset="61" className="text-indigo-600" />
                        </svg>
                        <span className="absolute text-xs font-bold text-slate-900">65%</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aptitude Ready</p>
                        <p className="text-xs font-bold text-slate-700">Audit your profile to generate specialized matches.</p>
                      </div>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-start space-x-3 text-xs text-slate-600">
                        <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-lg font-extrabold text-[10px] flex items-center justify-center shrink-0">01</span>
                        <div>
                          <span className="font-bold block text-slate-800">Identify Talents</span>
                          Select active fields, interests or write bespoke traits to direct the career engine.
                        </div>
                      </li>
                      <li className="flex items-start space-x-3 text-xs text-slate-600">
                        <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-lg font-extrabold text-[10px] flex items-center justify-center shrink-0">02</span>
                        <div>
                          <span className="font-bold block text-slate-800">Track Course Platforms</span>
                          Bridges competencies with free, open curriculum resources from leading publishers.
                        </div>
                      </li>
                      <li className="flex items-start space-x-3 text-xs text-slate-600">
                        <span className="h-5 w-5 bg-slate-50 text-slate-600 rounded-lg font-extrabold text-[10px] flex items-center justify-center shrink-0">03</span>
                        <div>
                          <span className="font-bold block text-slate-800">ATS Analyzer Tool</span>
                          Provides plain text bullet rewrites with impact words to boost recruiter outreach potential.
                        </div>
                      </li>
                    </ul>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-900 shadow-md space-y-4">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-indigo-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100">Pathways Saved</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        You have 3 recommended career pathways stored. You can return directly to explore lessons or speak with the chatbot at any time!
                      </p>
                      <button
                        onClick={() => setActiveTab("pathways")}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        <span>Open Career Explorer</span>
                        <Compass className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "pathways" && (
              <CareerRecommendations
                recommendations={recommendations}
                profile={profile}
                onAskChatAboutCareer={handleAskChatAboutCareer}
              />
            )}

            {activeTab === "chatbot" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CounselorChatbot
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isSending={isChatSending}
                    onClearHistory={handleClearHistory}
                    profile={profile}
                    activePathTitle={recommendations[0] ? recommendations[0].title : null}
                  />
                </div>

                {/* Chat Sidebar Information */}
                <div className="space-y-6" id="chat-sidebar-widgets">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interactive Dialog Guidance</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Aura Career counselor is configured with custom system scopes. It understands your active profile skills, strengths, and study targets, tailoring each tutoring suggestion or milestone answer dynamically.
                    </p>
                    
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Chat Actions</span>
                      <ul className="space-y-2 text-xs text-indigo-600 pl-4 list-disc font-medium">
                        <li>Ask about local salary brackets</li>
                        <li>Inquire about the course details</li>
                        <li>Draft an outreach message for LinkedIn</li>
                        <li>Suggest non-traditional internship routes</li>
                      </ul>
                    </div>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-850 shadow-md space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest">Active Paths Saved</h4>
                      <div className="space-y-3">
                        {recommendations.map(path => (
                          <div key={path.id} className="p-3 bg-slate-850/60 rounded-xl flex items-center justify-between border border-slate-800">
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-bold block text-slate-100 truncate">{path.title}</span>
                              <span className="text-[10px] text-indigo-400 font-semibold">{path.outlook}</span>
                            </div>
                            <button
                              onClick={() => handleAskChatAboutCareer(path.title, `Tell me more about becoming a ${path.title}`)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 shrink-0 hover:underline"
                            >
                              Inquire
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Beautiful Footer Branding */}
        <footer className="bg-white border-t border-slate-200/60 mt-12 shrink-0" id="footer-branding">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <span className="font-bold text-slate-600">Aura Career AI</span>
              <span>|</span>
              <span>Quality Education Guidance (UN SDG 4)</span>
            </div>
            <span>Empolying intelligent benchmarks for equitable access.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
