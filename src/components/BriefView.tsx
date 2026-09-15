import React, { useState } from "react";
import type { InnovationBrief } from "../types.ts";
import {
  ExternalLink,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Users,
  Target,
  Search,
  Compass,
  Layers,
  Sparkles,
  Share2,
} from "lucide-react";

interface BriefViewProps {
  brief: InnovationBrief;
  originalProblem: string;
  briefId?: string;
  onReset: () => void;
  onRefine: (problem: string) => void;
}

export const BriefView: React.FC<BriefViewProps> = ({
  brief,
  originalProblem,
  briefId,
  onReset,
  onRefine,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedKeywords, setCopiedKeywords] = useState<number | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleShareUrl = () => {
    if (!briefId) return;
    const shareUrl = `${window.location.origin}/brief/${briefId}`;
    handleCopyText(shareUrl, "share");
  };

  const handleCopyKeywords = (keywords: string, idx: number) => {
    navigator.clipboard.writeText(keywords);
    setCopiedKeywords(idx);
    setTimeout(() => setCopiedKeywords(null), 2000);
  };

  const handleCopyFullBrief = () => {
    const text = `INNOVATION ENGINE BRIEF
Problem: ${originalProblem}

1. THE PROBLEM, REFRAMED
Summary: ${brief.problem_reframed.summary}
Sub-problems:
${brief.problem_reframed.sub_problems.map((sp) => `  - ${sp}`).join("\n")}

2. THE LANDSCAPE
Summary: ${brief.landscape.summary}
Key Players:
${brief.landscape.key_players.map((kp) => `  - ${kp.name}: ${kp.what_they_do}`).join("\n")}

3. THE REAL GAPS
Summary: ${brief.gaps.summary}
Openings:
${brief.gaps.openings.map((op) => `  - ${op}`).join("\n")}

4. YOUR PATHWAYS IN
${brief.pathways
  .map(
    (p, i) =>
      `Pathway ${i + 1} (${p.platform} - ${p.category}):\n  Why it fits: ${p.why_fit}\n  Keywords: ${p.keywords}\n  URL: ${p.search_url}\n  First Step: ${p.first_step}`
  )
  .join("\n\n")}

5. YOUR FIRST MOVE
Action: ${brief.first_move.action}
Why: ${brief.first_move.why}
Time Estimate: ${brief.first_move.time_estimate}

6. BUILD IT WITH US
Join the Innovators of Tomorrow community to share what you find and build alongside fellow makers.
`;
    handleCopyText(text, "full-brief");
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "citizen-science":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "hack-for-good":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "open-source":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "skilled-volunteering":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "volunteering":
        return "bg-blue-50 text-blue-800 border-blue-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  return (
    <div id="brief-view-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top action bar and context banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              Generated Brief
            </span>
            <span className="text-xs text-zinc-400">&bull;</span>
            <span className="text-xs text-zinc-500">Verified Pathways Loaded</span>
          </div>
          <p className="text-sm font-medium text-zinc-800 line-clamp-1 italic max-w-xl">
            &ldquo;{originalProblem}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {briefId && (
            <button
              id="btn-share-brief"
              onClick={handleShareUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 hover:bg-emerald-100 transition shadow-2xs"
            >
              {copiedSection === "share" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Share</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-copy-full-brief"
            onClick={handleCopyFullBrief}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition shadow-2xs"
          >
            {copiedSection === "full-brief" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Brief</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Brief</span>
              </>
            )}
          </button>

          <button
            id="btn-refine-problem"
            onClick={() => onRefine(originalProblem)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Edit Input</span>
          </button>
        </div>
      </div>

      {/* Grid of the 6 Cards */}
      <div className="space-y-8">
        {/* CARD 1: The Problem, Reframed */}
        <section
          id="card-1-problem-reframed"
          className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs relative"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Card 01</span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  The Problem, Reframed
                </h2>
              </div>
            </div>
            <button
              id="btn-copy-card-1"
              onClick={() => handleCopyText(brief.problem_reframed.summary, "card-1")}
              className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-md hover:bg-zinc-100 transition"
              title="Copy reframed summary"
            >
              {copiedSection === "card-1" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-base sm:text-lg text-zinc-700 leading-relaxed font-normal mb-6">
            {brief.problem_reframed.summary}
          </p>

          <div className="border-t border-zinc-100 pt-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Deconstructed Sub-Problems:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brief.problem_reframed.sub_problems.map((sub, i) => (
                <li
                  key={i}
                  id={`sub-problem-item-${i}`}
                  className="flex items-start gap-2.5 text-sm text-zinc-700 bg-zinc-50 rounded-xl p-3 border border-zinc-100"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{sub}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CARD 2: The Landscape */}
        <section
          id="card-2-landscape"
          className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Card 02</span>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                The Landscape
              </h2>
            </div>
          </div>

          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            {brief.landscape.summary}
          </p>

          <div className="border-t border-zinc-100 pt-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Who is already active on this:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brief.landscape.key_players.map((player, i) => (
                <div
                  key={i}
                  id={`key-player-card-${i}`}
                  className="bg-zinc-50/80 rounded-xl p-4 border border-zinc-200/70"
                >
                  <h4 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {player.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    {player.what_they_do}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARD 3: The Real Gaps */}
        <section
          id="card-3-real-gaps"
          className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Card 03</span>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                The Real Gaps
              </h2>
            </div>
          </div>

          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            {brief.gaps.summary}
          </p>

          <div className="border-t border-zinc-100 pt-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Where a newcomer can actually matter:
            </h3>
            <div className="space-y-2.5">
              {brief.gaps.openings.map((opening, i) => (
                <div
                  key={i}
                  id={`gap-opening-item-${i}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-amber-950 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    &bull;
                  </div>
                  <span className="leading-snug">{opening}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARD 4: Your Pathways In (THE MOST IMPORTANT CARD) */}
        <section
          id="card-4-pathways-in"
          className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md relative overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Card 04 &bull; High Priority
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                  Your Pathways In
                </h2>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-300/60">
              {brief.pathways.length} Matched Opportunities
            </span>
          </div>

          <p className="text-sm sm:text-base text-zinc-600 mb-6">
            These verified pathways link directly to live listings and repositories where your help is needed immediately.
            Search keywords are included alongside each link for resilience.
          </p>

          <div className="space-y-6">
            {brief.pathways.map((pathway, idx) => (
              <div
                key={idx}
                id={`pathway-item-${idx}`}
                className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-5 sm:p-6 transition-all hover:border-zinc-300 hover:shadow-xs space-y-4"
              >
                {/* Platform Name and Category Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-bold text-lg text-zinc-950">
                      {pathway.platform}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                        pathway.category
                      )}`}
                    >
                      {pathway.category}
                    </span>
                  </div>
                </div>

                {/* Why this fits you line */}
                <p className="text-sm sm:text-base text-zinc-700 leading-normal">
                  <span className="font-semibold text-zinc-900">Why this fits you: </span>
                  {pathway.why_fit}
                </p>

                {/* Concrete First Step Highlight */}
                <div className="bg-white rounded-xl p-3.5 border border-zinc-200/90 flex items-start gap-2.5 text-zinc-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <span className="font-bold text-zinc-900">Concrete First Step: </span>
                    {pathway.first_step}
                  </div>
                </div>

                {/* Action Row: Button + Visible Raw Keywords */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200/60">
                  {/* Search Button linking to search_url */}
                  <a
                    id={`btn-search-platform-${idx}`}
                    href={pathway.search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs shrink-0 group"
                  >
                    <span>Search {pathway.platform}</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>

                  {/* Raw Visible Keyword Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-zinc-500 mr-1 flex items-center gap-1">
                      <Search className="w-3 h-3 text-zinc-400" /> Keywords:
                    </span>
                    {pathway.keywords.split(",").map((kw, kidx) => {
                      const cleanKw = kw.trim();
                      if (!cleanKw) return null;
                      return (
                        <span
                          key={kidx}
                          className="text-xs font-medium bg-zinc-200/80 text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-300/50"
                        >
                          {cleanKw}
                        </span>
                      );
                    })}
                    <button
                      id={`btn-copy-kw-${idx}`}
                      type="button"
                      onClick={() => handleCopyKeywords(pathway.keywords, idx)}
                      className="text-zinc-400 hover:text-zinc-600 text-xs p-1 rounded hover:bg-zinc-200/50 transition ml-1"
                      title="Copy search keywords"
                    >
                      {copiedKeywords === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 5: Your First Move */}
        <section
          id="card-5-first-move"
          className="bg-emerald-950 text-emerald-50 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Card 05 &bull; Highest Leverage
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your First Move
                </h2>
              </div>
            </div>

            {/* Time Estimate Badge */}
            <div
              id="badge-first-move-time"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 text-xs font-semibold self-start sm:self-auto"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{brief.first_move.time_estimate}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-900/40 rounded-xl p-4 sm:p-5 border border-emerald-800/60">
              <p className="text-base sm:text-lg font-semibold text-white leading-snug">
                {brief.first_move.action}
              </p>
            </div>

            <div className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              <span className="font-semibold text-white">Why this first: </span>
              {brief.first_move.why}
            </div>
          </div>
        </section>

        {/* CARD 6: Build it with us (Static CTA to Innovators of Tomorrow community) */}
        <section
          id="card-6-build-with-us"
          className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-zinc-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-800 text-emerald-400 text-xs font-semibold">
              <span>Card 06</span>
              <span>&bull;</span>
              <span>Community Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Build it with us.
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Don’t tackle complex problems in isolation. Join the{" "}
              <strong className="text-white font-semibold">Innovators of Tomorrow</strong>{" "}
              community — a global network of makers, researchers, and newcomers building open solutions together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              id="btn-join-innovators-community"
              href="https://www.skool.com/ai-solutions-strategies-7773"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-md group"
            >
              <Users className="w-4 h-4 text-zinc-950" />
              <span>Join the Community</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>

      {/* Bottom return bar */}
      <div className="pt-6 pb-12 flex justify-center">
        <button
          id="btn-bottom-new-search"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze another problem or idea</span>
        </button>
      </div>
    </div>
  );
};
