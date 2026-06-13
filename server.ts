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
    try {
      const { name, currentLevel, fieldOfStudy, interests, skills, strengths, workStyle } = req.body;
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
    } catch (error: any) {
      console.error("Recommendations API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // Resume Improvement endpoint
  app.post("/api/resume-tips", async (req, res) => {
    try {
      const { resumeText, targetRole } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }

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
    } catch (error: any) {
      console.error("Resume Tips API Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze resume" });
    }
  });

  // Chatbot Guidance endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile, currentPath } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

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
    console.log(`Express full-stack backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal Server Startup Error:", err);
});
