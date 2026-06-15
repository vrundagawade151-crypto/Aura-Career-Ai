import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please add it via the AI Studio UI (Settings > Secrets).");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function getMockRecommendations(name: string, currentLevel: string, fieldOfStudy: string, interests: string[] = [], skills: string[] = [], strengths: string[] = [], workStyle: string) {
  const study = fieldOfStudy || "Information Systems";
  const userInterests = interests.length ? interests : ["Technology", "Innovation"];
  const userSkills = skills.length ? skills : ["Problem Solving", "Communication"];
  const userStrengths = strengths.length ? strengths : ["Analytical Mindset", "Adaptability"];

  return {
    recommendations: [
      {
        id: "ai-solutions-architect",
        title: "AI & Education Solutions Architect",
        description: "Designs and deploys intelligent, scalable learning platforms that adapt to individual student needs, directly promoting equitable quality education (SDG 4). Integrates cloud infrastructure, machine learning pipelines, and accessible UI design.",
        matchScore: 94,
        whyMatch: `Based on your interest in ${userInterests.join(" & ")}, and your background in ${study}, you are exceptionally suited to connect technical specifications with educational needs. Your strong skills in ${userSkills.join(", ")} will help you translate client needs into robust technical requirements.`,
        coreSkills: ["Generative AI Pipelines", "Cloud Systems Architecture", "Database Modeling", "API Integration", "Accessible UX Design"],
        outlook: "High Growth (+32% annual demand)",
        potentialJobs: ["AI Solutions Specialist", "EdTech System Engineer", "Cloud Architect - Public Sector"],
        roadmap: [
          "Milestone 1: Complete foundational certifications in AWS/GCP and Python-based AI development.",
          "Milestone 2: Develop a portfolio of 3 minor applications demonstrating API integrations and machine learning models.",
          "Milestone 3: Partner with a local EdTech initiative or non-profit to shadow current systems engineers.",
          "Milestone 4: Design and build a capstone adaptive-learning web application targeting SDG 4."
        ],
        recommendedCourses: [
          {
            title: "AWS Certified Solutions Architect",
            description: "Learn core architectural design principles, cloud computing services, scalability, and security configurations.",
            platform: "Coursera",
            skillsAddressed: ["Cloud Systems Architecture", "Database Modeling"]
          },
          {
            title: "Deep Learning Specialization",
            description: "Gain hands-on experience with neural network structures, optimization algorithms, and natural language processing.",
            platform: "DeepLearning.AI",
            skillsAddressed: ["Generative AI Pipelines", "API Integration"]
          },
          {
            title: "Accessible Web Design and UX Principles",
            description: "Master WCAG 2.1 accessibility guidelines to build digital education platforms usable by everyone.",
            platform: "edX",
            skillsAddressed: ["Accessible UX Design"]
          }
        ]
      },
      {
        id: "data-analytics-educator",
        title: "Educational Data Analyst",
        description: "Translates complex student performance, demographic, and enrollment datasets into clear, actionable dashboards to help administrators optimize student success, resource allocation, and retention rates.",
        matchScore: 89,
        whyMatch: `With your strength in ${userStrengths.join(" and ")}, you possess the exact analytical depth needed to uncover patterns in large datasets. Your background in ${study} gives you a solid framework for structured data governance.`,
        coreSkills: ["Advanced SQL & ETL", "Data Visualization (Tableau/PowerBI)", "Statistical Analysis (Python/R)", "Data Privacy Compliance (FERPA/GDPR)", "Storytelling with Data"],
        outlook: "Steady High Demand (+18% growth)",
        potentialJobs: ["Institutional Research Analyst", "EdTech Product Analyst", "Academic Performance Consultant"],
        roadmap: [
          "Milestone 1: Master SQL querying, database indexing, and database administration fundamentals.",
          "Milestone 2: Create a public Tableau dashboard analyzing public education data and publish it to your portfolio.",
          "Milestone 3: Learn statistical modeling using Python pandas, numpy, and matplotlib.",
          "Milestone 4: Secure an internship or project-based opportunity at an educational institution or software provider."
        ],
        recommendedCourses: [
          {
            title: "Google Data Analytics Professional Certificate",
            description: "Covers data cleaning, analysis, visualization, and programming with R and SQL.",
            platform: "Coursera",
            skillsAddressed: ["Advanced SQL & ETL", "Data Visualization (Tableau/PowerBI)"]
          },
          {
            title: "Python for Data Science and Machine Learning",
            description: "Hands-on projects covering regression, classification, clustering, and deep learning algorithms.",
            platform: "Udemy",
            skillsAddressed: ["Statistical Analysis (Python/R)", "Storytelling with Data"]
          }
        ]
      },
      {
        id: "edtech-product-manager",
        title: "EdTech Product Manager",
        description: "Bridges the gap between business, engineering, and educators. Manages product development life cycles for digital tools, software, and content platforms aimed at boosting student engagement and narrowing the learning gap.",
        matchScore: 85,
        whyMatch: `Your preferred work style (${workStyle}) and collaborative skills make you a natural facilitator for cross-functional product teams. Your strengths like ${userStrengths.join(", ")} will allow you to manage scope, design features, and inspire team members.`,
        coreSkills: ["Product Lifecycle Management", "Agile & Scrum Methodologies", "User Research & Prototyping", "A/B Testing", "Market Analysis"],
        outlook: "Emerging/Rapid Growth (+22% growth)",
        potentialJobs: ["Associate Product Manager", "Product Owner", "Curriculum Product Manager"],
        roadmap: [
          "Milestone 1: Obtain a Scrum Alliance Certified Product Owner (CSPO) or equivalent credential.",
          "Milestone 2: Practice wireframing and interactive prototyping using modern tools like Figma.",
          "Milestone 3: Conduct informal user interviews with teachers and students to identify pain points in current remote-learning software.",
          "Milestone 4: Lead a cross-functional student project to build a prototype software application, managing the backlog from start to release."
        ],
        recommendedCourses: [
          {
            title: "Brand and Product Management",
            description: "Covers product lifecycle strategy, portfolio management, brand execution, and user research.",
            platform: "Coursera",
            skillsAddressed: ["Product Lifecycle Management", "User Research & Prototyping"]
          },
          {
            title: "Agile with Atlassian Jira",
            description: "Learn the fundamentals of Agile methodology, scrum framework, sprint planning, and managing issues.",
            platform: "Coursera",
            skillsAddressed: ["Agile & Scrum Methodologies"]
          }
        ]
      }
    ]
  };
}

function getMockResumeTips(resumeText: string, targetRole: string) {
  const length = resumeText.length;
  const keywords = ["Python", "SQL", "Machine Learning", "Product", "Agile", "Architecture", "Cloud", "Data Analysis", "Management", "Design"];
  const matchedKeywords = keywords.filter(kw => new RegExp(`\\b${kw}\\b`, "i").test(resumeText));
  
  let score = Math.min(95, Math.max(45, 50 + matchedKeywords.length * 5 + Math.min(10, Math.floor(length / 200))));
  
  const missingKeywords = keywords.filter(kw => !matchedKeywords.includes(kw)).slice(0, 4);
  if (missingKeywords.length === 0) {
    missingKeywords.push("SDG 4 Education Metrics", "Inclusive UX Design");
  }

  return {
    score,
    summary: `Your resume demonstrates a solid foundational background, but can be improved to better target the role of "${targetRole}". There is a strong need to shift from passive, duty-focused descriptions to active, achievement-based bullet points using the X-Y-Z formula. Adding more industry-standard technical keywords will also help clear ATS screening filters.`,
    formattingSuggestions: [
      "Keep the document to exactly one page to maximize impact for junior/mid-level roles.",
      "Remove personal statements or generic objectives; replace them with a concise Technical Summary section.",
      "Ensure all project/work experience descriptions start with strong action verbs (e.g., Developed, Orchestrated, Optimized).",
      "Format dates consistently in the right-hand margin to keep the layout clean and scan-friendly."
    ],
    bulletRewrites: [
      {
        original: "Responsible for writing Python scripts for data cleaning.",
        suggested: "Engineered 12+ Python-based ETL scripts, reducing manual data-cleaning overhead by 35% and increasing data pipeline reliability for cross-functional analysis.",
        impactDescription: "Uses the X-Y-Z formula to prove productivity gains and quantifiable business impact, appealing to both technical lead recruiters and ATS scanners."
      },
      {
        original: "Helped team members finish class projects on time.",
        suggested: "Coordinated project milestones for a 5-member Agile development squad using Jira, leading to the on-time delivery of 3 full-stack academic prototypes.",
        impactDescription: "Shows active leadership, project management, and methodology-specific experience (Agile, Jira) rather than passive participation."
      },
      {
        original: "Worked on UI designs for a mobile app.",
        suggested: "Created 20+ high-fidelity interactive Figma wireframes and conducted usability testing with 15 users, increasing user satisfaction ratings by 24%.",
        impactDescription: "Specifies tools (Figma), quantifies testing scope (15 users), and highlights client-facing design validation outcomes."
      }
    ],
    missingKeywords
  };
}

function getMockChatResponse(messages: any[], profile: any, currentPath: string | null) {
  const lastMessage = messages[messages.length - 1]?.text || "";
  const name = profile?.name || "Student";
  
  let reply = "";
  
  if (/salary|pay|compensation|earn/i.test(lastMessage)) {
    reply = `Based on current industry benchmarks, here is the entry-level salary outlook for the pathways we discussed:
    
1. **AI & Education Solutions Architect**: 
   - **Entry Level**: $95,000 - $115,000 / year
   - **Growth Potential**: Senior roles exceed $160,000+ as demand for specialized AI skills skyrockets.

2. **Educational Data Analyst**:
   - **Entry Level**: $70,000 - $85,000 / year
   - **Growth Potential**: Can advance to Director of Analytics or Senior Data Scientist ($130,000+).

3. **EdTech Product Manager**:
   - **Entry Level**: $85,000 - $105,000 / year
   - **Growth Potential**: Product Director levels easily scale to $150,000+ with strong technical product backgrounds.

*Note: These figures vary by location (e.g., remote vs. major tech hubs) and local currency. Would you like some tips on how to negotiate your first package?*`;
  } else if (/course|study|learn|certif|platform/i.test(lastMessage)) {
    reply = `Excellent question, ${name}! The fastest way to bridge your skill gaps is through structured online learning. Here are my top recommended platforms and strategies:

• **Coursera**: Best for university-affiliated professional certificates. Look into the *Google Data Analytics Certificate* or the *AWS Cloud Architecture Specialization*. Many of these have financial aid options!
• **edX / Harvard Online**: Fantastic for computer science foundations (such as the famous CS50).
• **YouTube**: Highly underrated for practical code-alongs. Channels like *freeCodeCamp* offer full 10-hour courses on Python, SQL, and Git.

**Study Tip**: Never just watch videos. Build a small repository on GitHub for every course you complete, writing a custom README that summarizes what you learned. This becomes your portfolio!`;
  } else if (/resume|cv|ats|rewrite|tips/i.test(lastMessage)) {
    reply = `A strong resume is your ticket to the interview. Here is a quick 3-step checklist to optimize yours right now:

1. **Shift to the X-Y-Z Formula**: Instead of saying "Wrote Python code," write "Developed 5+ Python automation scripts (Z), saving 10 hours per week (Y) for the project team (X)."
2. **Technical Skills Grid**: Place your technical skills (Languages, Tools, Frameworks) right at the top so ATS software and busy recruiters can see them in 3 seconds.
3. **No Fluff**: Remove words like "passionate learner" or "hard worker." Let your projects and metrics prove it.

*If you want, you can paste your raw resume text directly into the Resume Health check on the Pathways page or in this chat, and I'll give you customized suggestions!*`;
  } else {
    reply = `I would love to help you with that, ${name}! As your GuidanceAI advisor, I'm here to support your career journey aligned with SDG 4 (Quality Education). 

Based on your profile (field of study: **${profile?.fieldOfStudy || "Information Systems"}** and interests: **${profile?.interests?.join(", ") || "Technology"}**), we can explore:
1. Recommended certs and courses to boost your skillset.
2. Industry salary ranges and what skills are valued most.
3. Hands-on projects you can build to show recruiters.

What would you like to discuss next? You can ask me about **courses**, **salaries**, or **resume tips**!`;
  }

  reply += `\n\n*(Note: Running in offline/mock mode because GEMINI_API_KEY is not configured. Configure it in .env to enable live AI responses.)*`;
  
  return { reply };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  });

  // Career Recommendations endpoint
  app.post("/api/recommendations", async (req, res) => {
    const { name, currentLevel, fieldOfStudy, interests, skills, strengths, workStyle } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const useMock = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YourActualKeyGoesHere") || apiKey === "";

      if (useMock) {
        console.log("Using Mock Career Recommendations (No GEMINI_API_KEY set or placeholder used)...");
        const mockRecommendations = getMockRecommendations(name, currentLevel, fieldOfStudy, interests, skills, strengths, workStyle);
        return res.json(mockRecommendations);
      }

      try {
        const ai = getGeminiClient();

        // Formulate a structured prompt
        const prompt = `Analyze this student profile and suggest exactly 3 target career paths aligned with UN SDG 4 (Quality Education):
        Student Details:
        - Name: ${name || "Student"}
        - Current Education/Level: ${currentLevel}
        - Field of Study/Major: ${fieldOfStudy}
        - Interests: ${interests?.join(", ") || "None specified"}
        - Current Skills: ${skills?.join(", ") || "None specified"}
        - Main Strengths: ${strengths?.join(", ") || "None specified"}
        - Work Style preference: ${workStyle}

        Please return exactly three recommended career paths in detail, including match % evaluation, customized why, skill gap analysis (core skills to build), structured course topics, and roadmap milestones. Go into high-quality detail.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an elite academic counselor and career success coach. Your goal is to provide deep, high-value, precise guidance aligning with SDG 4 (Quality Education). Give specific course topics and actionable, realistic suggestions.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["recommendations"],
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  description: "List of exactly 3 recommended career paths.",
                  items: {
                    type: Type.OBJECT,
                    required: ["id", "title", "description", "matchScore", "whyMatch", "coreSkills", "outlook", "potentialJobs", "roadmap", "recommendedCourses"],
                    properties: {
                      id: { type: Type.STRING, description: "A unique slug, e.g. 'data-scientist', 'curriculum-developer'" },
                      title: { type: Type.STRING, description: "Career title" },
                      description: { type: Type.STRING, description: "Clear definition of the career" },
                      matchScore: { type: Type.INTEGER, description: "Out of 100 on how well it fits their profile interests and traits" },
                      whyMatch: { type: Type.STRING, description: "A detailed paragraph explaining how their strengths and skills tie directly to this path" },
                      coreSkills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Core skillsets they absolutely need to thrive in this role"
                      },
                      outlook: { type: Type.STRING, description: "Market demand, e.g. 'High Growth (+24% growth)', 'Steady', 'Emerging'" },
                      potentialJobs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of 3 related job titles they can pursue"
                      },
                      roadmap: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A 4-step sequence of actionable milestones to transition into this career"
                      },
                      recommendedCourses: {
                        type: Type.ARRAY,
                        description: "Study resources / courses tailored to close their specific gaps",
                        items: {
                          type: Type.OBJECT,
                          required: ["title", "description", "platform", "skillsAddressed"],
                          properties: {
                            title: { type: Type.STRING, description: "Course title (realistic, e.g. 'Introduction to Python & Data Science')" },
                            description: { type: Type.STRING, description: "What key concepts are covered" },
                            platform: { type: Type.STRING, description: "E.g. Coursera, edX, Harvard Online, Udemy, YouTube" },
                            skillsAddressed: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Which specific skills are acquired here"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response received from GenAI");
        }

        const parsedData = JSON.parse(responseText);
        res.json(parsedData);
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to mock recommendations. Error:", geminiError.message || geminiError);
        const mockRecommendations = getMockRecommendations(name, currentLevel, fieldOfStudy, interests, skills, strengths, workStyle);
        res.json(mockRecommendations);
      }
    } catch (error: any) {
      console.error("Recommendations API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // Resume Improvement endpoint
  app.post("/api/resume-tips", async (req, res) => {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const useMock = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YourActualKeyGoesHere") || apiKey === "";

      if (useMock) {
        console.log("Using Mock Resume Tips (No GEMINI_API_KEY set or placeholder used)...");
        const mockTips = getMockResumeTips(resumeText, targetRole);
        return res.json(mockTips);
      }

      try {
        const ai = getGeminiClient();
        const prompt = `Evaluate the following resume text against the target role: "${targetRole || "their recommended career path"}".
        Analyze grammar, impact, ATS suitability, and structure. Provide actionable rewrites for at least 3 bullet points, missing keywords, scoring out of 100, and formatting suggestions.
        
        Resume text:
        ${resumeText}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an expert HR recruiter and professional resume writer. Your feedback must be constructive, direct, and focused on showcasing accomplishment and impact (using the X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z]). Avoid vague generalities.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["score", "summary", "formattingSuggestions", "bulletRewrites", "missingKeywords"],
              properties: {
                score: { type: Type.INTEGER, description: "Target role fit score from 0 to 100" },
                summary: { type: Type.STRING, description: "High-level summary of strengths and core critical improvements" },
                formattingSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3-4 actionable tips for layout, length, formatting, or styling improvements"
                },
                bulletRewrites: {
                  type: Type.ARRAY,
                  description: "List of 3 suggested bullet rewrites",
                  items: {
                    type: Type.OBJECT,
                    required: ["original", "suggested", "impactDescription"],
                    properties: {
                      original: { type: Type.STRING, description: "A summary of the candidate's original phrasing" },
                      suggested: { type: Type.STRING, description: "An optimized version showing high business or technical impact" },
                      impactDescription: { type: Type.STRING, description: "Why this rewrite stands out to hiring managers and ATS filters" }
                    }
                  }
                },
                missingKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Keywords, skills, and tools that are crucial to add to match this target career path"
                }
              }
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response received from GenAI for resume analyzer");
        }

        const parsedData = JSON.parse(responseText);
        res.json(parsedData);
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to mock resume tips. Error:", geminiError.message || geminiError);
        const mockTips = getMockResumeTips(resumeText, targetRole);
        res.json(mockTips);
      }
    } catch (error: any) {
      console.error("Resume Tips API Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze resume" });
    }
  });

  // Chatbot Guidance endpoint
  app.post("/api/chat", async (req, res) => {
    const { messages, profile, currentPath } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const useMock = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YourActualKeyGoesHere") || apiKey === "";

      if (useMock) {
        console.log("Using Mock Chat Response (No GEMINI_API_KEY set or placeholder used)...");
        const mockChat = getMockChatResponse(messages, profile, currentPath);
        return res.json(mockChat);
      }

      try {
        const ai = getGeminiClient();

        // Build context from user profile
        let profileContext = "";
        if (profile) {
          profileContext = `
          Active Student Profile:
          - Name: ${profile.name || "Student"}
          - Education Level: ${profile.currentLevel}
          - Field: ${profile.fieldOfStudy}
          - Current skills: ${profile.skills?.join(", ") || "None listed"}
          - Interests: ${profile.interests?.join(", ") || "None listed"}
          - Strengths: ${profile.strengths?.join(", ") || "None listed"}
          - Work style: ${profile.workStyle}
          `;
        }
        if (currentPath) {
          profileContext += `\n- Actively reviewing / asking about the recommended path: "${currentPath}"`;
        }

        const systemInstruction = `You are a warm, supportive, and extremely knowledgeable AI Career Counselor named GuidanceAI.
        You are dedicated to SDG Goal 4: Quality Education, helping students discover their path, close skill gaps, align with industry needs, and build structural roadmaps.
        Always be conversational, direct, and practical. Suggest actual platforms (Coursera, edX, YouTube, LinkedIn Learning), techniques, projects, and career advice.
        Keep your answers clear, supportive, and segmented with headers/lists for easy reading.
        Use this student profile context to personalize your responses:
        ${profileContext}
        Let's have a conversational career dialog!`;

        // Map messages array to Gemini contents
        // Each message should have role 'user' or 'model' and parts with text
        const contents = messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
          }
        });

        const replyText = response.text || "I'm sorry, I couldn't formulate a suggestion. Let's try restructuring your question!";
        res.json({ reply: replyText });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to mock chat response. Error:", geminiError.message || geminiError);
        const mockChat = getMockChatResponse(messages, profile, currentPath);
        res.json(mockChat);
      }
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "Failed to complete chat query" });
    }
  });

  // Serve Frontend with Vite dynamic middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack backend running at:`);
    console.log(`  > Local:   http://localhost:${PORT}/`);
    console.log(`  > Network: http://0.0.0.0:${PORT}/`);
  });
}

startServer().catch(err => {
  console.error("Fatal Server Startup Error:", err);
});
