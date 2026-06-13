import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, StudentProfile } from "../types";
import { Send, User, Sparkles, MessageSquare, Trash2, ArrowRight } from "lucide-react";

interface CounselorChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
  onClearHistory: () => void;
  profile: StudentProfile | null;
  activePathTitle: string | null;
}

const CHAT_PROMPTS = [
  "Can you list any fully free certifications to boost my resume?",
  "What's the best strategy to choose when having multiple conflicting interests?",
  "Recommend a weekly study roadmap to learn Python from scratch.",
  "Give me 5 mock interview questions for this career."
];

export default function CounselorChatbot({
  messages,
  onSendMessage,
  isSending,
  onClearHistory,
  profile,
  activePathTitle
}: CounselorChatbotProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handlePromptClick = (promptText: string) => {
    if (isSending) return;
    onSendMessage(promptText);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[640px]" id="chatbot-component">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl" id="chat-hdr-icon">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">GuidanceAI Counselor</h3>
            <p className="text-[11px] text-slate-500">Your conversational UN SDG 4 career development mentor</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={onClearHistory}
            id="clear_chat_btn"
            title="Clear Chat History"
            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active Profile Status Badge */}
      {profile && (
        <div className="bg-indigo-50/50 px-4 py-2 border-b border-slate-100 text-[11px] text-indigo-700 flex items-center justify-between" id="chat-active-profile-banner">
          <span>
            Connected to profile: <span className="font-semibold">{profile.name}</span> ({profile.currentLevel})
          </span>
          {activePathTitle && (
            <span className="font-semibold px-2 py-0.5 bg-indigo-100 rounded-full text-[10px]">
              Discussion Focus: {activePathTitle}
            </span>
          )}
        </div>
      )}

      {/* Messages Window */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" id="chat_messages_window">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4" id="chat-empty-panel">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Welcome to GuidanceAI Career Counseling</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Ask about industry skill gaps, get recommendations for specific subjects, or seek general advice for career growth.
            </p>

            <div className="mt-6 w-full max-w-md text-left space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 text-center">Frequently Asked Inquiries</span>
              <div className="grid grid-cols-1 gap-2">
                {CHAT_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    className="p-3 text-left bg-slate-50 hover:bg-indigo-50/50 text-xs text-slate-600 hover:text-indigo-800 rounded-xl transition border border-slate-100 flex items-center justify-between group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-indigo-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className="flex items-start space-x-2 max-w-xl">
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-xs">
                    G
                  </div>
                )}
                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none font-medium"
                        : "bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-medium text-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs animate-pulse">
                G
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5 self-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form at deep bottom */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center space-x-2">
        <input
          type="text"
          id="chat_message_input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          placeholder={
            isSending ? "GuidanceAI is formulating recommendations..." : "Ask your counselor anything (e.g. course timelines, jobs)..."
          }
          className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-xs text-slate-700"
        />
        <button
          type="submit"
          id="chat_submit_btn"
          disabled={!inputText.trim() || isSending}
          className={`p-2.5 rounded-xl text-white shadow-xs transition cursor-pointer ${
            !inputText.trim() || isSending
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xs"
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
