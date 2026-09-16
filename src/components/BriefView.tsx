import React, { useState } from "react";
import {
  Compass,
  Target,
  Users,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  Share2,
  Bot,
  MessageSquare,
} from "lucide-react";
import type { BriefResponse } from "../types.ts";
import { SolutionAssistantPanel } from "./SolutionAssistantPanel.tsx";

interface BriefViewProps {
  brief: BriefResponse;
  originalProblem: string;
  onReset: () => void;
  onRefine: (problem: string) => void;
  briefId?: string | null;
}

export const BriefView: React.FC<BriefViewProps> = ({
  brief,
  originalProblem,
  onReset,
  onRefine,
  briefId,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedKeywords, setCopiedKeywords] = useState<number | null>(null);
  const [copiedChip, setCopiedChip] = useState<string | null>(null);

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleCopyKeywords = (keywords: string, index: number) => {
    navigator.clipboard.writeText(keywords);
    setCopiedKeywords(index);
    setTimeout(() => {
      setCopiedKeywords(null);
    }, 2000);
  };

  const handleCopySingleChip = (kw: string, chipKey: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedChip(chipKey);
    setTimeout(() => {
      setCopiedChip(null);
    }, 1800);
  };

  const handleShareUrl = () => {
    if (!briefId) return;
    const shareableUrl = `${window.location.origin}/brief/${briefId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedSection("share");
    setTimeout(() => {
      setCopiedSection(null);
    }, 2500);
  };

  const handleCopyFullBrief = () => {
    const formatted = `
# PATHFINDER BRIEF: ${originalProblem}

## 1. THE PROBLEM, REFRAMED
${brief.problem_reframed.summary}

Sub-Problems:
${brief.problem_reframed.sub_problems.map((sp, i) => `${i + 1}. ${sp}`).join("\n")}

## 2. THE LANDSCAPE
${brief.landscape.summary}

Key Players:
${brief.landscape.key_players.map((kp) => `- ${kp.name}: ${kp.what_they_do}`).join("\n")}

## 3. THE REAL GAPS
${brief.gaps.summary}

Openings:
${brief.gaps.openings.map((o) => `- ${o}`).join("\n")}

## 4. YOUR PATHWAYS IN
${brief.pathways
  .map(
    (p, i) =>
      `### Pathway ${i + 1}: ${p.platform} (${p.category})
- Why this fits: ${p.why_fit}
- Concrete First Step: ${p.first_step}
- Link: ${p.search_url}
- Keywords: ${p.keywords}`
  )
  .join("\n\n")}

## 5. YOUR FIRST MOVE
- Action: ${brief.first_move.action}
- Why this first: ${brief.first_move.why}
- Time Estimate: ${brief.first_move.time_estimate}
    `.trim();

    handleCopyText(formatted, "full-brief");
  };

  const formatCategoryLabel = (category: string) => {
    const lower = (category || "").toLowerCase();
    if (lower === "osint" || lower.includes("osint") || lower.includes("investigat") || lower.includes("open-source") || lower.includes("open source")) {
      return "OSINT / investigation";
    }
    if (lower === "citizen-science" || lower === "citizen science") {
      return "Citizen Science";
    }
    if (lower === "hack-for-good" || lower === "hack for good") {
      return "Hack for Good";
    }
    if (lower === "skilled-volunteering" || lower === "volunteering") {
      return "Volunteering";
    }
    if (lower === "civic-tech" || lower === "open-data") {
      return "Civic Tech / Data";
    }
    if (lower === "humanitarian-mapping") {
      return "Humanitarian Mapping";
    }
    return category;
  };

  const getCategoryBadgeClass = (category: string) => {
    const lower = (category || "").toLowerCase();
    if (lower === "citizen-science" || lower === "citizen science") {
      return "bg-[#9FD0FF]/15 text-[#9FD0FF] border-[#9FD0FF]/30";
    }
    if (lower === "hack-for-good" || lower === "hack for good") {
      return "bg-[#9FE3C2]/15 text-[#9FE3C2] border-[#9FE3C2]/30";
    }
    if (lower.includes("osint") || lower.includes("investigat") || lower.includes("open-source") || lower.includes("open source")) {
      return "bg-purple-400/15 text-purple-300 border-purple-400/30";
    }
    if (lower === "volunteering" || lower === "skilled-volunteering") {
      return "bg-amber-400/15 text-amber-300 border-amber-400/30";
    }
    if (lower === "civic-tech" || lower === "open-data") {
      return "bg-cyan-400/15 text-cyan-300 border-cyan-400/30";
    }
    if (lower === "humanitarian-mapping") {
      return "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
    }
    return "bg-white/10 text-zinc-300 border-white/20";
  };

  return (
    <div id="brief-view-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top action bar and context banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--hair)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="eyebrow py-0.5 px-2.5 text-[10px]">
              <span className="dot" />
              <span>Generated Brief</span>
            </span>
            <span className="text-xs text-[var(--faint)]">&bull;</span>
            <span className="font-mono text-xs text-[var(--mute)]">Verified Pathways Loaded</span>
          </div>
          <p className="text-sm sm:text-base text-[var(--ink)] line-clamp-1 italic max-w-xl font-light">
            &ldquo;{originalProblem}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            id="btn-open-assistant"
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--void)] bg-[var(--foam)] hover:bg-[#b0ecd0] transition shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Solving with AI</span>
          </button>

          {briefId && (
            <button
              id="btn-share-brief"
              onClick={handleShareUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--foam)] bg-[var(--foam)]/10 border border-[var(--foam)]/40 hover:bg-[var(--foam)]/20 transition shadow-xs"
            >
              {copiedSection === "share" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--foam)]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-copy-full-brief"
            onClick={handleCopyFullBrief}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-200 bg-white/5 border border-[var(--hair)] hover:bg-white/10 transition shadow-xs"
          >
            {copiedSection === "full-brief" ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--foam)]" />
                <span>Copied Brief</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Brief</span>
              </>
            )}
          </button>

          <button
            id="btn-refine-problem"
            onClick={() => onRefine(originalProblem)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-200 bg-white/5 border border-[var(--hair)] hover:bg-white/10 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit Input</span>
          </button>
        </div>
      </div>

      {/* Grid of the 6 Cards */}
      <div className="space-y-8">
        {/* CARD 1: The Problem, Reframed */}
        <section id="card-1-problem-reframed" className="bezel">
          <div className="core p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--hair)] border border-[var(--hair-strong)] flex items-center justify-center text-[var(--foam)]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[var(--sky)] uppercase tracking-wider block">
                    Card 01
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--ink)] tracking-tight">
                    The Problem, Reframed
                  </h2>
                </div>
              </div>
              <button
                id="btn-copy-card-1"
                onClick={() => handleCopyText(brief.problem_reframed.summary, "card-1")}
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-full hover:bg-white/5 transition"
                title="Copy reframed summary"
              >
                {copiedSection === "card-1" ? (
                  <Check className="w-4 h-4 text-[var(--foam)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-base sm:text-lg text-[var(--ink)] leading-relaxed font-light">
              {brief.problem_reframed.summary}
            </p>

            <div className="border-t border-[var(--hair)] pt-5">
              <h3 className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider mb-4">
                Deconstructed Sub-Problems:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brief.problem_reframed.sub_problems.map((sub, i) => (
                  <li
                    key={i}
                    id={`sub-problem-item-${i}`}
                    className="flex items-start gap-3 text-sm text-zinc-300 bg-white/[0.03] rounded-xl p-3.5 border border-[var(--hair)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[var(--foam)]/20 text-[var(--foam)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[var(--foam)]/30">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CARD 2: The Landscape */}
        <section id="card-2-landscape" className="bezel">
          <div className="core p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--hair)] border border-[var(--hair-strong)] flex items-center justify-center text-[var(--sky)]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-xs text-[var(--sky)] uppercase tracking-wider block">
                  Card 02
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--ink)] tracking-tight">
                  The Landscape
                </h2>
              </div>
            </div>

            <p className="text-base text-[var(--ink)] leading-relaxed font-light">
              {brief.landscape.summary}
            </p>

            <div className="border-t border-[var(--hair)] pt-5">
              <h3 className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider mb-4">
                Who is already active on this:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brief.landscape.key_players.map((player, i) => (
                  <div
                    key={i}
                    id={`key-player-card-${i}`}
                    className="bg-white/[0.03] rounded-xl p-4 border border-[var(--hair)]"
                  >
                    <h4 className="font-semibold text-zinc-200 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--sky)] shadow-[0_0_8px_var(--sky)]" />
                      {player.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--mute)] mt-2 leading-relaxed">
                      {player.what_they_do}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CARD 3: The Real Gaps */}
        <section id="card-3-real-gaps" className="bezel">
          <div className="core p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--hair)] border border-[var(--hair-strong)] flex items-center justify-center text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider block">
                  Card 03
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--ink)] tracking-tight">
                  The Real Gaps
                </h2>
              </div>
            </div>

            <p className="text-base text-[var(--ink)] leading-relaxed font-light">
              {brief.gaps.summary}
            </p>

            <div className="border-t border-[var(--hair)] pt-5">
              <h3 className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider mb-4">
                Where a newcomer can actually matter:
              </h3>
              <div className="space-y-3">
                {brief.gaps.openings.map((opening, i) => (
                  <div
                    key={i}
                    id={`gap-opening-item-${i}`}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-amber-200 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      &bull;
                    </div>
                    <span className="leading-snug">{opening}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CARD 4: Your Pathways In */}
        <section id="card-4-pathways-in" className="bezel border-[var(--hair-strong)]">
          <div className="core p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--foam)]/20 border border-[var(--foam)]/50 flex items-center justify-center text-[var(--foam)]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[var(--foam)] uppercase tracking-wider block">
                    Card 04 &bull; High Priority
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--ink)] tracking-tight">
                    Your Pathways In
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono tracking-wider uppercase text-[var(--foam)] bg-[var(--foam)]/10 px-3 py-1 rounded-full self-start sm:self-auto border border-[var(--foam)]/30">
                {brief.pathways.length} Matched Openings
              </span>
            </div>

            <p className="text-sm sm:text-base text-[var(--mute)] font-light leading-relaxed">
              These verified pathways link directly to live listings and repositories where your help is needed immediately.
              Search keywords are included alongside each link for resilience.
            </p>

            <div className="space-y-6 pt-2">
              {brief.pathways.map((pathway, idx) => (
                <div
                  key={idx}
                  id={`pathway-item-${idx}`}
                  className="bg-white/[0.02] rounded-2xl border border-[var(--hair)] p-5 sm:p-6 transition-all hover:border-[var(--hair-strong)] space-y-4"
                >
                  {/* Platform Name and Category Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display font-semibold text-lg sm:text-xl text-[var(--ink)]">
                        {pathway.platform}
                      </h3>
                      <span
                        className={`text-xs font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                          pathway.category
                        )}`}
                      >
                        {formatCategoryLabel(pathway.category)}
                      </span>
                    </div>
                  </div>

                  {/* Why this fits you line */}
                  <p className="text-sm sm:text-base text-zinc-300 leading-normal">
                    <span className="font-medium text-white">Why this fits you: </span>
                    {pathway.why_fit}
                  </p>

                  {/* Concrete First Step Highlight */}
                  <div className="bg-white/[0.04] rounded-xl p-3.5 border border-[var(--hair)] flex items-start gap-2.5 text-zinc-200">
                    <CheckCircle2 className="w-5 h-5 text-[var(--foam)] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm leading-relaxed">
                      <span className="font-semibold text-white">Concrete First Step: </span>
                      {pathway.first_step}
                    </div>
                  </div>

                  {/* Action Row: Button + Visible Raw Keywords */}
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--hair)]">
                    <a
                      id={`btn-search-platform-${idx}`}
                      href={pathway.search_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-xs py-2 px-4 shrink-0"
                    >
                      <span>
                        {pathway.search_url &&
                        !pathway.search_url.includes("search") &&
                        !pathway.search_url.includes("?q=") &&
                        !pathway.search_url.includes("?k=")
                          ? `Explore ${pathway.platform}`
                          : `Search ${pathway.platform}`}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Raw Visible Keyword Chips - Clickable to Copy */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono text-[var(--faint)] mr-1 flex items-center gap-1">
                        <Search className="w-3 h-3 text-[var(--mute)]" /> Keywords:
                      </span>
                      {pathway.keywords.split(",").map((kw, kidx) => {
                        const cleanKw = kw.trim();
                        if (!cleanKw) return null;
                        const chipId = `${idx}-${kidx}`;
                        const isCopied = copiedChip === chipId;
                        return (
                          <button
                            key={kidx}
                            id={`chip-kw-${idx}-${kidx}`}
                            type="button"
                            onClick={() => handleCopySingleChip(cleanKw, chipId)}
                            className={`group relative text-xs font-mono px-2 py-0.5 rounded-md border transition flex items-center gap-1 cursor-pointer ${
                              isCopied
                                ? "bg-[var(--foam)]/20 text-[var(--foam)] border-[var(--foam)]/50"
                                : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12] hover:text-white border-[var(--hair)]"
                            }`}
                            title="Click to copy keyword"
                          >
                            <span>{cleanKw}</span>
                            {isCopied ? (
                              <Check className="w-3 h-3 text-[var(--foam)] inline" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition inline" />
                            )}
                          </button>
                        );
                      })}
                      <button
                        id={`btn-copy-kw-${idx}`}
                        type="button"
                        onClick={() => handleCopyKeywords(pathway.keywords, idx)}
                        className="text-zinc-400 hover:text-zinc-200 text-xs p-1 rounded hover:bg-white/10 transition ml-1"
                        title="Copy all keywords"
                      >
                        {copiedKeywords === idx ? (
                          <span className="inline-flex items-center gap-1 text-[var(--foam)] text-[11px] font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARD 5: Your First Move */}
        <section id="card-5-first-move" className="bezel">
          <div className="core p-6 sm:p-8 space-y-6 bg-gradient-to-br from-[#123048] to-[#08121C]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--foam)]/20 border border-[var(--foam)]/40 flex items-center justify-center text-[var(--foam)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[var(--foam)] uppercase tracking-wider block">
                    Card 05 &bull; Highest Leverage
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight">
                    Your First Move
                  </h2>
                </div>
              </div>

              {/* Time Estimate Badge */}
              <div
                id="badge-first-move-time"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--foam)]/15 text-[var(--foam)] border border-[var(--foam)]/30 text-xs font-mono uppercase self-start sm:self-auto"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--foam)]" />
                <span>{brief.first_move.time_estimate}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/[0.05] rounded-xl p-4 sm:p-5 border border-white/10">
                <p className="text-base sm:text-lg font-medium text-white leading-snug">
                  {brief.first_move.action}
                </p>
              </div>

              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                <span className="font-semibold text-white">Why this first: </span>
                {brief.first_move.why}
              </div>
            </div>
          </div>
        </section>

        {/* CARD 6: Build it with us (Static direct link to Skool community) */}
        <section id="card-6-build-with-us" className="bezel">
          <div className="core p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-[var(--hair)] text-[var(--foam)] text-xs font-mono uppercase">
                <span>Card 06</span>
                <span>&bull;</span>
                <span>Community Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white">
                Build it with us.
              </h2>
              <p className="text-sm sm:text-base text-[var(--mute)] leading-relaxed font-light">
                Don’t tackle complex problems in isolation. Join the{" "}
                <strong className="text-white font-medium">Innovators of Tomorrow</strong>{" "}
                community — a global network of makers, researchers, and newcomers building open solutions together.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                id="btn-join-innovators-community"
                href="https://www.skool.com/ai-solutions-strategies-7773"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full sm:w-auto text-sm justify-center"
              >
                <span>Join the Community</span>
                <span className="pip">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18 18 6M9 6h9v9" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom return bar */}
      <div className="pt-6 pb-12 flex justify-center">
        <button
          id="btn-bottom-new-search"
          onClick={onReset}
          className="btn btn-ghost text-sm"
        >
          <RotateCcw className="w-4 h-4 text-[var(--foam)]" />
          <span>Analyze another problem or idea</span>
        </button>
      </div>

      {/* Floating Bottom-Right Assistant Widget Trigger */}
      {!isAssistantOpen && (
        <aside
          id="floating-assistant-widget"
          aria-label="AI Assistant Trigger"
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            id="btn-floating-open-assistant"
            onClick={() => setIsAssistantOpen(true)}
            aria-label="Open Solution Assistant"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[var(--void)] text-[var(--foam)] border border-[var(--foam)]/50 shadow-2xl hover:bg-[var(--foam)]/10 hover:border-[var(--foam)] transition group cursor-pointer"
            style={{
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px 2px rgba(159, 227, 194, 0.25)",
            }}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--foam)]/20 border border-[var(--foam)]/40 flex items-center justify-center text-[var(--foam)] group-hover:scale-110 transition">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-white tracking-wide pr-1">
              Work on this with AI
            </span>
          </button>
        </aside>
      )}

      {/* Right-docked Solution Assistant Panel */}
      <SolutionAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        brief={brief}
        originalProblem={originalProblem}
      />
    </div>
  );
};

