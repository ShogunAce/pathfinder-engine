import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { PLATFORMS, buildGoogleSearchFallbackUrl } from "./src/data/platforms.ts";
import type { InnovationBrief } from "./src/types.ts";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const systemInstructionPath = path.resolve(process.cwd(), "SYSTEM_INSTRUCTION.txt");
let baseSystemInstruction = "";
try {
  baseSystemInstruction = fs.readFileSync(systemInstructionPath, "utf-8");
} catch {
  baseSystemInstruction = `You are the Innovation Engine. A user gives you a real-world problem or a vague idea. 
Your job is to turn it into a clear brief AND real, doable next steps for a NEWCOMER — 
someone with no credentials who wants to genuinely help this week.`;
}

const fullSystemInstruction = `${baseSystemInstruction}

PREFERRED PLATFORM REGISTRY:
Prefer matching problems to these known, vetted platforms when they fit. You MAY also use other real, reputable platforms found via live web search/grounding if they are a genuinely better match for the specific problem:
${JSON.stringify(PLATFORMS, null, 2)}
`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const str = String(err).toLowerCase();
  return (
    str.includes("503") ||
    str.includes("unavailable") ||
    str.includes("high demand") ||
    str.includes("429") ||
    str.includes("resource_exhausted") ||
    str.includes("quota") ||
    str.includes("rate limit") ||
    str.includes("500") ||
    str.includes("internal") ||
    str.includes("econnreset") ||
    str.includes("etimedout") ||
    str.includes("fetch failed")
  );
}

function cleanErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred while analyzing the problem.";
  const rawMsg = err instanceof Error ? err.message : String(err);

  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        const msg = String(parsed.error.message);
        if (
          parsed.error.code === 503 ||
          parsed.error.status === "UNAVAILABLE" ||
          msg.toLowerCase().includes("high demand")
        ) {
          return "The AI engine is temporarily experiencing high demand. Please try again in a few moments.";
        }
        return msg;
      }
    }
  } catch {
    // Ignore JSON parse error
  }

  const lower = rawMsg.toLowerCase();
  if (lower.includes("503") || lower.includes("high demand") || lower.includes("unavailable")) {
    return "The AI engine is temporarily experiencing high demand. Please try again in a few moments.";
  }
  if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return "The AI engine is momentarily rate-limited. Please wait a few seconds and try again.";
  }

  return rawMsg;
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

interface GroundingFinding {
  groundedText: string;
  sourceUrls: Array<{ title: string; url: string }>;
  searchQueries: string[];
}

/**
 * Step 1: Live Google Search Grounding to discover current verified opportunities & real URLs
 */
async function runGroundedSearch(ai: GoogleGenAI, problem: string): Promise<GroundingFinding | null> {
  const groundingPrompt = `You are an investigator looking for active, live opportunities tackling this real-world problem or idea:
"${problem.trim()}"

Run targeted Google Web Searches using the preferred registry platforms as targets (like Google dorks):
- site:zooniverse.org ${problem.trim()}
- site:scistarter.org ${problem.trim()}
- site:anecdata.io ${problem.trim()}
- site:inaturalist.org ${problem.trim()}
- site:drivendata.org ${problem.trim()}
- site:kaggle.com ${problem.trim()}
- site:devpost.com ${problem.trim()}
- site:omdena.com ${problem.trim()}
- site:tracelabs.org
- site:bellingcat.com ${problem.trim()}
- site:atlos.org
- site:bc-community.org
- site:citizenevidence.org
- site:gijn.org
- site:hotosm.org ${problem.trim()}
- site:catchafire.org ${problem.trim()}
- site:volunteermatch.org ${problem.trim()}
- site:data.gov ${problem.trim()}

Find ACTUAL, SPECIFIC project pages, investigations, datasets, challenges, or opportunity pages currently existing on these sites.
CRITICAL RULES:
1. Do NOT return internal search pages or search boxes (e.g. NEVER return anecdata.io/projects?q=..., zooniverse.org/projects?search=..., or search/?q=...).
2. Return the exact, direct URL of the individual project, investigation, competition, or intake page that Google search found.
3. For OSINT: focus on investigations, geolocation, video/satellite verification, or missing persons search parties (Trace Labs, Bellingcat, Atlos). Never software bugs.
4. List the discovered organizations, real specific projects, and their exact direct URLs.`;

  const groundingModels = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  for (const modelName of groundingModels) {
    try {
      console.log(`[Google Search Grounding] Running live search with ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: groundingPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundedText = response?.text?.trim() || "";
      const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const queries = response?.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      const sourceUrls: Array<{ title: string; url: string }> = [];
      for (const chunk of chunks as any[]) {
        if (chunk?.web?.uri) {
          sourceUrls.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          });
        }
      }

      if (groundedText || sourceUrls.length > 0) {
        console.log(`[Google Search Grounding] Succeeded using ${modelName}. Retrieved ${sourceUrls.length} live URLs.`);
        return {
          groundedText,
          sourceUrls,
          searchQueries: queries,
        };
      }
    } catch (err: unknown) {
      console.warn(`[Google Search Grounding] ${modelName} search attempt:`, err instanceof Error ? err.message : err);
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "The Innovation Engine" });
  });

  // Generate brief endpoint
  app.post("/api/generate-brief", async (req, res) => {
    try {
      const { problem } = req.body;
      if (!problem || typeof problem !== "string" || !problem.trim()) {
        res.status(400).json({ error: "Please enter a problem or idea to analyze." });
        return;
      }

      const ai = getGenAI();

      // Step 1: Live Web Grounding with Google Search
      let groundingData: GroundingFinding | null = null;
      try {
        groundingData = await runGroundedSearch(ai, problem);
      } catch (e) {
        console.warn("[Google Search Grounding] Grounding step error:", e);
      }

      // Step 2: Build Structured Six-Card Synthesis Prompt
      let promptText = `Analyze this problem/idea and produce an Innovation Brief with concrete newcomer pathways:\n\n"${problem.trim()}"`;

      if (groundingData && (groundingData.groundedText || groundingData.sourceUrls.length > 0)) {
        const sourceUrlList = groundingData.sourceUrls
          .slice(0, 15)
          .map((s) => `- ${s.title}: ${s.url}`)
          .join("\n");

        promptText += `\n\n=== LIVE GOOGLE SEARCH GROUNDING RESEARCH ===
${groundingData.groundedText}

VERIFIED LIVE SOURCES & WORKING OPPORTUNITY URLS:
${sourceUrlList || "None"}

CRITICAL PATHWAY INSTRUCTIONS:
- EACH PATHWAY MUST LINK TO A REAL, SPECIFIC PROJECT URL (NOT SITE SEARCH PAGES):
  Each pathway's "search_url" must be a REAL, specific, currently-existing URL that grounding found via live Google Search: an actual project page, investigation, repository, dataset, listing, or opportunity page, NOT a search-results URL.
  Look at the VERIFIED LIVE SOURCES & WORKING OPPORTUNITY URLS listed above and assign the exact matching live URL directly to "search_url".
  STRICTLY FORBIDDEN:
  - Do NOT link to a site's internal search page or query string (e.g. NEVER return anecdata.io/projects?q=..., zooniverse.org/projects?search=..., or search/?q=...).
  - Do NOT construct URLs from keyword templates.
  - Return the real individual page that currently exists.
  If no direct specific project page URL was surfaced for a pathway, return a Google search query URL targeting that platform's domain (e.g. "https://www.google.com/search?q=site%3Azooniverse.org+..."), NEVER an internal site search box.
  Never invent fake or non-existent sub-paths.
- OSINT (OPEN-SOURCE INTELLIGENCE / INVESTIGATION) CATEGORY:
  The category is "osint" (investigative research, verification, geolocation, crowdsourced OSINT). NEVER use open-source software, GitHub issues, or coding tasks.
  The "why_fit" and "first_step" for an OSINT pathway must be about contributing to real investigations, verification, geolocation, or research — NOT writing code or documentation. Example first step: joining a Trace Labs Search Party event, or applying to the Bellingcat Volunteer Community.
  Surface REAL current OSINT projects/events on these vetted sites: bellingcat.com, bc-community.org, atlos.org, tracelabs.org, citizenevidence.org, gijn.org.
- Always provide 3-5 relevant keywords for search resilience.
- PREFER matching to known platforms in the preferred registry, but you MAY use other reputable platforms found during search.`;
      } else {
        promptText += `\n\nCRITICAL PATHWAY INSTRUCTIONS:
- EACH PATHWAY MUST LINK TO A REAL, SPECIFIC PROJECT URL (NOT SITE SEARCH PAGES):
  Provide the real direct project URL to an actual project or opportunity on the platform as "search_url".
  Do NOT link to a site's internal search box or query parameter. If no specific project URL is resolved, use a Google Search site: query URL.
- OSINT CATEGORY: Use "osint" for open-source intelligence/investigation (e.g. Bellingcat bellingcat.com, Bellingcat Volunteer Community bc-community.org, Trace Labs tracelabs.org, Atlos atlos.org, Citizen Evidence Lab citizenevidence.org, GIJN gijn.org). Why it fits and first steps MUST be about real investigations, verification, or research, never software/coding.
- PREFER matching to known platforms in the preferred registry.
- Always provide 3-5 relevant keywords for search resilience.`;
      }

      // Priority list for structured synthesis
      const modelsToTry = [
        "gemini-3.8-flash",
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
      ];

      const briefSchema = {
        type: Type.OBJECT,
        properties: {
          problem_reframed: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              sub_problems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["summary", "sub_problems"],
          },
          landscape: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              key_players: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    what_they_do: { type: Type.STRING },
                  },
                  required: ["name", "what_they_do"],
                },
              },
            },
            required: ["summary", "key_players"],
          },
          gaps: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              openings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["summary", "openings"],
          },
          pathways: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                category: { type: Type.STRING },
                why_fit: { type: Type.STRING },
                keywords: { type: Type.STRING },
                search_url: { type: Type.STRING },
                first_step: { type: Type.STRING },
              },
              required: [
                "platform",
                "category",
                "why_fit",
                "keywords",
                "search_url",
                "first_step",
              ],
            },
          },
          first_move: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              why: { type: Type.STRING },
              time_estimate: { type: Type.STRING },
            },
            required: ["action", "why", "time_estimate"],
          },
        },
        required: [
          "problem_reframed",
          "landscape",
          "gaps",
          "pathways",
          "first_move",
        ],
      };

      let rawResponseText = "";
      let lastError: any = null;

      // Attempt 1: Try with structured responseSchema and exponential backoff
      for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction: fullSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: briefSchema,
            },
          });

          if (response?.text && response.text.trim()) {
            rawResponseText = response.text.trim();
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${modelName} encountered error:`, err);

          if (isTransientError(err) && i < modelsToTry.length - 1) {
            // Wait with backoff before attempting next fallback model
            const backoffMs = 1200 * (i + 1) + Math.floor(Math.random() * 500);
            await sleep(backoffMs);
          }
        }
      }

      // Attempt 2: If strict schema failed or all models rejected schema under load, try pure JSON mode
      if (!rawResponseText) {
        console.warn("Retrying with prompt-guided JSON mode as fallback...");
        for (let i = 0; i < modelsToTry.length; i++) {
          const modelName = modelsToTry[i];
          try {
            const fallbackPrompt = `${promptText}\n\nRespond with valid JSON adhering to this exact schema structure:
{
  "problem_reframed": { "summary": "...", "sub_problems": ["..."] },
  "landscape": { "summary": "...", "key_players": [{ "name": "...", "what_they_do": "..." }] },
  "gaps": { "summary": "...", "openings": ["..."] },
  "pathways": [{ "platform": "...", "category": "...", "why_fit": "...", "keywords": "...", "search_url": "...", "first_step": "..." }],
  "first_move": { "action": "...", "why": "...", "time_estimate": "..." }
}`;
            const response = await ai.models.generateContent({
              model: modelName,
              contents: fallbackPrompt,
              config: {
                systemInstruction: fullSystemInstruction,
                responseMimeType: "application/json",
              },
            });

            if (response?.text && response.text.trim()) {
              rawResponseText = response.text.trim();
              break;
            }
          } catch (err) {
            lastError = err;
            if (isTransientError(err) && i < modelsToTry.length - 1) {
              await sleep(1500 + Math.floor(Math.random() * 500));
            }
          }
        }
      }

      if (!rawResponseText) {
        if (lastError) {
          throw lastError;
        }
        throw new Error("Unable to receive analysis from AI engine. Please try again.");
      }

      const cleanedText = cleanJsonText(rawResponseText);
      const parsed: InnovationBrief = JSON.parse(cleanedText);

      // Preserve real specific project URLs found by grounding, and ensure valid links & categories
      if (Array.isArray(parsed.pathways)) {
        parsed.pathways = parsed.pathways.map((p) => {
          const rawPlatform = (p.platform || "").trim();
          // Match platform against registry
          const matched = PLATFORMS.find(
            (reg) =>
              reg.name.toLowerCase() === rawPlatform.toLowerCase() ||
              reg.domain.toLowerCase() === rawPlatform.toLowerCase() ||
              rawPlatform.toLowerCase().includes(reg.name.toLowerCase()) ||
              rawPlatform.toLowerCase().includes(reg.domain.toLowerCase())
          );

          const platformName = matched ? matched.name : (rawPlatform || "Initiative");
          // If category was open-source or github, correct to osint
          let category = (p.category || "").toLowerCase();
          if (category.includes("open-source") || category.includes("open source") || category.includes("github") || category === "open_source") {
            category = "osint";
          } else if (matched) {
            category = matched.category;
          } else if (!category) {
            category = "volunteer";
          }

          const keywords = p.keywords || "";

          // Do NOT overwrite real URLs with keyword template search URLs!
          // Filter out internal search URLs (e.g. ?search=, ?q=, /projects?search=, /finder?q=)
          let finalUrl = (p.search_url || "").trim();
          const isInternalSiteSearch =
            finalUrl.includes("?search=") ||
            finalUrl.includes("?q=") ||
            finalUrl.includes("/finder?q=") ||
            finalUrl.includes("projects?search=") ||
            finalUrl.includes("projects?q=") ||
            finalUrl.includes("explore?text=") ||
            finalUrl.includes("/search#/?k=") ||
            finalUrl.includes("/s/global-search/");

          const isRealValidUrl =
            (finalUrl.startsWith("http://") || finalUrl.startsWith("https://")) &&
            !finalUrl.includes("example.com") &&
            !finalUrl.includes("{KEYWORDS}") &&
            !isInternalSiteSearch;

          if (!isRealValidUrl) {
            // Fall back ONLY if no valid direct project URL was provided.
            // Generates a targeted Google search ("site:domain keyword") rather than an internal search box.
            finalUrl = buildGoogleSearchFallbackUrl(platformName, keywords, matched?.domain);
          }

          return {
            ...p,
            platform: platformName,
            category: category,
            keywords: keywords,
            search_url: finalUrl,
          };
        });
      }

      res.json({ brief: parsed });
    } catch (err: unknown) {
      console.error("Error generating brief:", err);
      const errorMessage = cleanErrorMessage(err);
      res.status(500).json({ error: errorMessage });
    }
  });

  // Assistant Chat API endpoint
  app.post("/api/assistant-chat", async (req, res) => {
    try {
      const { originalProblem, brief, history, message, contextMode, totalSavedBriefs } = req.body || {};

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getGenAI();

      // Format context into a clear, structured system prompt
      let contextSummary = "";
      if (brief) {
        contextSummary = `
CURRENT INNOVATION BRIEF CONTEXT:
- Original Problem: "${originalProblem || 'Not specified'}"
- Reframed Problem Summary: ${brief?.problem_reframed?.summary || 'N/A'}
- Sub-Problems:
${(brief?.problem_reframed?.sub_problems || []).map((sp: string, idx: number) => `  ${idx + 1}. ${sp}`).join("\n")}
- Landscape Overview: ${brief?.landscape?.summary || 'N/A'}
- Key Players:
${(brief?.landscape?.key_players || []).map((kp: any) => `  - ${kp.name}: ${kp.what_they_do}`).join("\n")}
- Real Gaps & Openings:
${(brief?.gaps?.openings || []).map((o: string) => `  - ${o}`).join("\n")}
- Discovered Pathways:
${(brief?.pathways || []).map((p: any) => `  - [${p.platform} (${p.category})]: First step -> ${p.first_step} (URL: ${p.search_url})`).join("\n")}
- Recommended First Move:
  Action: ${brief?.first_move?.action || 'N/A'}
  Why: ${brief?.first_move?.why || 'N/A'}
  Time Estimate: ${brief?.first_move?.time_estimate || 'N/A'}
`;
      } else {
        contextSummary = `
USER DASHBOARD CONTEXT:
- Mode: Personal Innovation Portfolio & Involvement Journey
- Total Briefs Analyzed: ${totalSavedBriefs || 'Several'}
- The user is reviewing their tracked commitments and looking to take action across their projects.
`;
      }

      const assistantSystemInstruction = `You are the Solution Assistant for the Innovation Engine.
You are a hands-on solution-building collaborator for an aspiring changemaker (someone eager with no credentials who wants to take real action this week).

YOUR CONTEXT:
${contextSummary}

YOUR MISSION & BEHAVIOR:
1. Hands-on solution collaborator: Help them break down challenges, think through approaches, plan a first prototype or project, draft real outreach messages, identify who to talk to or what to inspect, and map out concrete next steps.
2. Tone: Warm, direct, practical, encouraging, with zero corporate jargon and zero fluff.
3. Bias toward ACTION: Move them toward a real, doable move this week. Be pragmatic and grounded.
4. Keep responses focused, digestible, and well-structured with clear headings, bullet points, or step-by-step guidance when appropriate.`;

      // Convert conversation history for Gemini multi-turn contents format
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const turn of history) {
          if (turn && (turn.role === "user" || turn.role === "model") && typeof turn.content === "string") {
            contents.push({
              role: turn.role,
              parts: [{ text: turn.content }],
            });
          }
        }
      }

      // Append current user message
      contents.push({
        role: "user",
        parts: [{ text: message.trim() }],
      });

      const chatModelsToTry = [
        "gemini-3.7-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.8-flash",
      ];

      let replyText = "";
      let lastError: unknown = null;

      for (let i = 0; i < chatModelsToTry.length; i++) {
        const modelName = chatModelsToTry[i];
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: assistantSystemInstruction,
              temperature: 0.7,
            },
          });

          if (response?.text && response.text.trim()) {
            replyText = response.text.trim();
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Assistant chat model ${modelName} encountered error:`, err);
          if (isTransientError(err) && i < chatModelsToTry.length - 1) {
            await sleep(800 * (i + 1));
          }
        }
      }

      if (!replyText) {
        if (lastError) {
          throw lastError;
        }
        throw new Error("Unable to get a response from the solution assistant. Please try again.");
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      console.error("Error in assistant chat:", err);
      const errorMessage = cleanErrorMessage(err);
      res.status(500).json({ error: errorMessage });
    }
  });

  // Static/Vite Handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Innovation Engine server running at http://localhost:${PORT}`);
  });
}

startServer();
