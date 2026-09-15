import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { PLATFORMS, buildPlatformSearchUrl } from "./src/data/platforms.ts";
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

PLATFORM REGISTRY (Match ONLY from this exact list, never invent another platform):
${JSON.stringify(PLATFORMS, null, 2)}
`;

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

      const promptText = `Analyze this problem/idea and produce an Innovation Brief with concrete newcomer pathways:\n\n"${problem.trim()}"`;

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction: fullSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
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
              },
            },
          });
          if (response?.text) {
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${modelName} failed or unavailable:`, err);
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      const rawText = response.text?.trim() || "";
      if (!rawText) {
        throw new Error("Empty response from AI engine");
      }

      const parsed: InnovationBrief = JSON.parse(rawText);

      // Validate & reinforce search_url strictly against PLATFORMS registry
      if (Array.isArray(parsed.pathways)) {
        parsed.pathways = parsed.pathways.map((p) => {
          // Normalize platform against registry if possible
          const matched = PLATFORMS.find(
            (reg) => reg.name.toLowerCase() === (p.platform || "").toLowerCase()
          );

          const platformName = matched ? matched.name : (p.platform || "Platform");
          const category = matched ? matched.category : (p.category || "volunteer");
          const keywords = p.keywords || "";
          const exactSearchUrl = buildPlatformSearchUrl(platformName, keywords);

          return {
            ...p,
            platform: platformName,
            category: category,
            keywords: keywords,
            search_url: exactSearchUrl,
          };
        });
      }

      res.json({ brief: parsed });
    } catch (err: unknown) {
      console.error("Error generating brief:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate innovation brief";
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
