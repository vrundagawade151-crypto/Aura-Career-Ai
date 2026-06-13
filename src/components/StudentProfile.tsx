import React, { useState } from "react";
import { StudentProfile as StudentProfileType } from "../types";
import { BookOpen, Sparkles, User, Tag, Plus, Check } from "lucide-react";
import { motion } from "motion/react";

interface StudentProfileProps {
  initialProfile: StudentProfileType;
  onSave: (profile: StudentProfileType) => void;
  isGenerating: boolean;
}

const EDUCATION_LEVELS = [
  "High School Student",
  "Vocational / Technical Student",
  "Undergraduate Scholar",
  "Graduate / Post-Graduate",
  "Career/Field Changer"
];

const WORK_STYLE_PREFERENCES = [
  "Remote-first / Digital Nomad",
  "Dynamic Team Environment",
  "Independent / Self-Directed Investigator",
  "Hands-on Lab, Workshop, or Studio"
];

// Presets to let users construct their profile with simple clicks
const PRESET_INTERESTS = [
  "Technology & AI",
  "Solving Complex Problems",
  "Creative Arts & Design",
  "Social Impact & Education",
  "Data Analysis & Math",
  "Writing & Content Creation",
  "Business & Entrepreneurship",
  "Healthcare & Biology",
  "Environmental Sustainability",
  "Finance & Economics"
];

const PRESET_SKILLS = [
  "Python Coding",
  "JavaScript & Web Dev",
  "Critical Thinking",
  "Data Analysis",
  "Project Management",
  "Public Speaking",
  "UI/UX Prototyping",
  "Technical Writing",
  "Research Methods",
  "Creative Design",
  "Financial Modeling",
  "Team Collaboration"
];

const PRESET_STRENGTHS = [
  "Analytical Mindset",
  "Empathetic Communication",
  "Creative Problem Solving",
  "High Adaptability",
  "Strategic Leadership",
  "Meticulous Attention to Detail",
  "Resilience under Pressure",
  "Innately Self-Motivated"
];

export default function StudentProfile({
  initialProfile,
  onSave,
  isGenerating
}: StudentProfileProps) {
  const [profile, setProfile] = useState<StudentProfileType>(initialProfile);
  const [customInterest, setCustomInterest] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [customStrength, setCustomStrength] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChip = (type: "interests" | "skills" | "strengths", value: string) => {
    setProfile((prev) => {
      const items = prev[type];
      const isSelected = items.includes(value);
      const updatedItems = isSelected
        ? items.filter((item) => item !== value)
        : [...items, value];
      return { ...prev, [type]: updatedItems };
    });
  };

  const handleAddCustom = (type: "interests" | "skills" | "strengths", value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setProfile((prev) => {
      const items = prev[type];
      if (items.includes(trimmed)) return prev;
      return { ...prev, [type]: [...items, trimmed] };
    });
    setter("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8" id="profile-container">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl" id="profile-icon-hdr">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Create Student Profile</h2>
          <p className="text-sm text-slate-500">Define your pathway, skills, and values to activate the AI guidance counselor.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Your Full Name</label>
            <input
              type="text"
              name="name"
              id="student_name_input"
              required
              placeholder="e.g. Sarah Jenkins"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Education Level</label>
            <select
              name="currentLevel"
              id="edu_level_input"
              value={profile.currentLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 transition bg-white"
            >
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Field of Study / Major</label>
            <input
              type="text"
              name="fieldOfStudy"
              id="field_of_study_input"
              required
              placeholder="e.g. Computer Science, Arts, Humanities"
              value={profile.fieldOfStudy}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 transition"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Key Interests</label>
              <span className="text-xs text-slate-400">Select what gets you excited or motivated to study/work.</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add custom interest"
                value={customInterest}
                id="custom_interest_input"
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom("interests", customInterest, setCustomInterest))}
                className="px-3 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 text-slate-700 w-44"
              />
              <button
                type="button"
                id="add_interest_btn"
                onClick={() => handleAddCustom("interests", customInterest, setCustomInterest)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1" id="interests-chips">
            {PRESET_INTERESTS.map((item) => {
              const selected = profile.interests.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleToggleChip("interests", item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition duration-200 flex items-center space-x-1.5 ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{item}</span>
                </button>
              );
            })}
            {profile.interests.filter(i => !PRESET_INTERESTS.includes(i)).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleToggleChip("interests", item)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Skills Section */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Current Strengths / Competencies</label>
              <span className="text-xs text-slate-400">Current skills you already possess or are studying now.</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add custom skill"
                value={customSkill}
                id="custom_skill_input"
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom("skills", customSkill, setCustomSkill))}
                className="px-3 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 text-slate-700 w-44"
              />
              <button
                type="button"
                id="add_skill_btn"
                onClick={() => handleAddCustom("skills", customSkill, setCustomSkill)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1" id="skills-chips">
            {PRESET_SKILLS.map((item) => {
              const selected = profile.skills.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleToggleChip("skills", item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition duration-200 flex items-center space-x-1.5 ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{item}</span>
                </button>
              );
            })}
            {profile.skills.filter(i => !PRESET_SKILLS.includes(i)).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleToggleChip("skills", item)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Strengths Section */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Personal Traits & Strengths</label>
              <span className="text-xs text-slate-400">Character strengths that guide how you solve challenges.</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add custom trait"
                value={customStrength}
                id="custom_strength_input"
                onChange={(e) => setCustomStrength(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom("strengths", customStrength, setCustomStrength))}
                className="px-3 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 text-slate-700 w-44"
              />
              <button
                type="button"
                id="add_strength_btn"
                onClick={() => handleAddCustom("strengths", customStrength, setCustomStrength)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1" id="strengths-chips">
            {PRESET_STRENGTHS.map((item) => {
              const selected = profile.strengths.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleToggleChip("strengths", item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition duration-200 flex items-center space-x-1.5 ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                  <span>{item}</span>
                </button>
              );
            })}
            {profile.strengths.filter(i => !PRESET_STRENGTHS.includes(i)).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleToggleChip("strengths", item)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Work Environment Prefernce Dropdown */}
        <div className="space-y-1 pt-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Preferred Professional Work Style</label>
          <select
            name="workStyle"
            id="workstyle_input"
            value={profile.workStyle}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 transition bg-white"
          >
            {WORK_STYLE_PREFERENCES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Form Submission Controls */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            id="generate_pathway_submit"
            disabled={isGenerating || profile.interests.length === 0}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm flex items-center space-x-2 transition cursor-pointer ${
              isGenerating || profile.interests.length === 0
                ? "bg-indigo-400 opacity-60 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow"
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Formulating AI Guidance...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Career Pathway Recommendations</span>
              </>
            )}
          </button>
        </div>
        {profile.interests.length === 0 && (
          <p className="text-xs text-amber-600 text-right mt-1 font-medium">Please select at least one Key Interest to unlock.</p>
        )}
      </form>
    </div>
  );
}
