# Pathfinder Engine

**Turn a problem you care about into your first real move.**

Live app: https://pathfinder-engine-107857618906.us-west1.run.app
Repository: https://github.com/ShogunAce/pathfinder-engine

Pathfinder Engine is a generative AI web app that takes any real-world or planetary problem and turns it into two things: a clear, structured brief on the problem, and real, live, matched ways to actually get involved this week. It closes the gap between caring about a problem and knowing where to start, and then it gives you an AI collaborator to help you begin.

---

## The Problem

People want to help with the problems they care about, from microplastics in local water to missing persons to communities that are not yet on any map. But they hit a wall between "I care about this" and "here is where I actually start." The path in is invisible.

Most AI tools that engage with big problems stop at analysis. They diagnose, summarize, and reframe, and then they leave the person exactly where they began: informed, but with no doorway. Diagnosis without a doorway does not create action. The result is that motivated people, often the exact newcomers a cause needs most, bounce off the entry barrier and do nothing.

## The Solution

Pathfinder Engine is built around the doorway, not just the diagnosis.

A person enters a problem or a half-formed idea in plain language. The app returns a six-part brief:

1. **The Problem, Reframed.** A clear summary and a breakdown of the real sub-problems inside it.
2. **The Landscape.** Who is already working on this, so the user sees they are joining a field, not starting alone.
3. **The Real Gaps.** Where a newcomer with no credentials can actually contribute.
4. **Your Pathways In.** The core of the app: real, live opportunities matched to the problem, each with why it fits, a direct link to an actual existing project or listing, visible keywords, and a concrete first step.
5. **Your First Move.** The single highest-leverage action to take right now, with a realistic time estimate.
6. **Build It With Us.** An invitation into Innovators of Tomorrow, a community where people turn first moves into ongoing contribution.

After the brief, the user can open an AI assistant that already knows their problem and helps them start building toward a solution in a real back-and-forth conversation.

## What Makes It Different

Two things set Pathfinder Engine apart from a generic "AI analyzes your problem" tool.

**Live, verified pathways.** The app does not guess what opportunities might exist. It uses live Google Search grounding to find real, currently existing projects, investigations, and listings, and it links the user directly to them. The pathways span citizen science, hack-for-good, OSINT and open-source investigation, skilled volunteering, civic and open data, and humanitarian mapping, so the match reflects the real shape of the problem.

**From diagnosis to action to collaboration.** Most tools stop at the brief. Pathfinder Engine gives the user a highest-leverage first move and an AI collaborator to work through it with, carrying the person all the way from "I care about this" to "here is what I am doing about it."

## Technology Used

Pathfinder Engine is a full-stack web application built and deployed entirely on Google infrastructure.

- **Frontend:** React with TypeScript, built with Vite, styled with Tailwind CSS. A dark, planetary visual theme built around Earth blues and greens.
- **Backend:** Node.js with Express, serving both the API and the built frontend from a single service.
- **AI:** Google Gemini, called server-side, using two capabilities. First, structured JSON output against a strict schema, so every brief conforms to the six-card format and renders reliably. Second, Google Search grounding, so the model runs live web searches during generation and returns real, current sources and URLs rather than guesses.
- **AI assistant:** A separate server-side Gemini conversation, seeded with the full context of the user's generated brief, that helps them work toward a solution in a multi-turn chat.
- **Data persistence:** Google Cloud Firestore. Generated briefs are saved and retrievable by a shareable link, and signed-in users get a personal dashboard of their saved briefs and an involvement tracker.
- **Authentication:** Firebase Authentication with Sign in with Google. Sign-in is optional. The core experience and shareable briefs work with no account.
- **Deployment:** Google Cloud Run, built with Cloud Build buildpacks from a GitHub repository. The container scales automatically and serves a public URL. The Gemini API key is held as a server-side secret and is never exposed to the client.

## How It Works

Pathfinder Engine is a single-shot generative pipeline with an optional conversational follow-up. It is not an autonomous agent. One problem in, one structured brief out, and then a chat if the user wants to go deeper. This is a deliberate design choice: it keeps the core experience fast, predictable, and reliable to demonstrate live.

When a user submits a problem, the server sends it to Gemini with a system instruction, a strict response schema, and Google Search grounding enabled. Gemini reframes the problem, maps the landscape and gaps, runs live searches to find real current opportunities across a preferred registry of vetted platforms, and returns two to four matched pathways with real links. The server validates the response against the six-card schema. If grounding does not return a usable direct link for a given pathway, the app falls back to a keyword search link and always shows the raw keywords, so every pathway remains actionable.

The preferred registry spans six categories. Citizen science includes Zooniverse, SciStarter, iNaturalist, eBird, CitSci, Anecdata, GLOBE, and EU-Citizen.Science. Hack-for-good includes Omdena, Devpost, Kaggle, DrivenData, and Zindi. OSINT and open-source investigation includes Bellingcat, the Bellingcat Volunteer Community, Atlos, Trace Labs, the Citizen Evidence Lab, and GIJN. Volunteering includes VolunteerMatch, Idealist, Catchafire, All for Good, Points of Light, Taproot Plus, and Volunteer.gov. Civic and open data includes Code.org, Code for America, and Data.gov. Humanitarian mapping includes Humanitarian OpenStreetMap, Missing Maps, and UN-SPIDER.

## Real-World Impact

Pathfinder Engine turns intent into action. Its entire design is measured by one outcome: does the user take a real first step. The First Move card, the completable-this-week constraint on every suggestion, and the live links to real projects are all built to produce action rather than just understanding.

It also serves as the onboarding front door for Innovators of Tomorrow, a community dedicated to connecting people to meaningful problem-solving. Each brief ends by inviting the user from a solo first step into a community of citizen scientists, investigators, builders, and organizers. The app is both a standalone tool and the seed of a larger engine for channeling human energy toward real problems.

## What's Next

- Deepen the AI assistant into a longer-term solution workspace, with saved threads per problem.
- Expand the involvement tracker so users can move each pathway from Interested to Started to Active and see their contribution history over time.
- Broaden the preferred registry with more regional and niche platforms.
- Community features that connect users working on the same problem.

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/ShogunAce/pathfinder-engine.git
cd pathfinder-engine

# 2. Install dependencies
npm install

# 3. Set environment variables
#    Create a .env file in the project root with:
#    GEMINI_API_KEY=your_gemini_api_key
#    (Firebase web config is set in the client Firebase init.)

# 4. Run in development
npm run dev

# 5. Build and run in production mode
npm run build
npm run start
```

The app reads `GEMINI_API_KEY` from the server environment and expects `NODE_ENV=production` when running the built output, so it serves the static build rather than the dev server. Google Search grounding uses the same Gemini key and requires no separate search credentials.

## Team

Ace (Cole Slay), Cole Slay Holdings. Solo build.

## License

Built for the AI Builders Hackathon 2026.
