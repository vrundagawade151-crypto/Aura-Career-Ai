export interface StudentProfile {
  name: string;
  currentLevel: string; // e.g. High School, Undergraduate, Graduate, Career Changer
  fieldOfStudy: string; // e.g. Computer Science, Mechanical Engineering, Fine Arts, Business
  interests: string[];
  skills: string[];
  strengths: string[];
  workStyle: string; // e.g. Remote-first, Dynamic Team, Independent, Hands-on / Lab
}

export interface RecommendedCourse {
  title: string;
  description: string;
  platform: string; // e.g. Coursera, edX, Udemy, YouTube, Other Free Resources
  skillsAddressed: string[];
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  matchScore: number; // e.g. 95 for 95% match
  whyMatch: string; // summary of fit
  coreSkills: string[]; // skills needed
  outlook: string; // e.g. High Growth, Emerging, Steady, Declining
  potentialJobs: string[];
  roadmap: string[]; // 3-4 steps/milestones
  recommendedCourses: RecommendedCourse[];
}

export interface ResumeFeedback {
  score: number; // 0-100 score
  summary: string;
  formattingSuggestions: string[];
  bulletRewrites: Array<{
    original: string;
    suggested: string;
    impactDescription: string;
  }>;
  missingKeywords: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
