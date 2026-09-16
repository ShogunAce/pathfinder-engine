import React, { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import type { UserBriefRecord, PathwayStatus } from "../types.ts";
import {
  getUserBriefs,
  updateUserPathwayStatus,
} from "../lib/firebase.ts";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Plus,
  Bot,
} from "lucide-react";
import { SolutionAssistantPanel } from "./SolutionAssistantPanel.tsx";

interface DashboardProps {
  user: User;
  onNavigateHome: () => void;
  onSelectBrief: (briefId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigateHome,
  onSelectBrief,
}) => {
  const [briefs, setBriefs] = useState<UserBriefRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedBriefForAssistant, setSelectedBriefForAssistant] = useState<UserBriefRecord | null>(null);

  useEffect(() => {
    async function loadUserBriefs() {
      setIsLoading(true);
      setError(null);
      try {
        const records = await getUserBriefs(user.uid);
        setBriefs(records);
      } catch (err: unknown) {
        console.error("Error loading user briefs:", err);
        setError("Could not load your saved briefs. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserBriefs();
  }, [user.uid]);

  const handleStatusChange = async (
    briefId: string,
    pathwayIdx: number,
    newStatus: PathwayStatus
  ) => {
    const key = pathwayIdx.toString();

    // Optimistically update local state
    setBriefs((prev) =>
      prev.map((b) => {
        if (b.briefId === briefId) {
          const updatedStatuses = {
            ...b.pathwayStatuses,
            [key]: newStatus,
          };
          return { ...b, pathwayStatuses: updatedStatuses };
        }
        return b;
      })
    );

    // Save to Firestore
    const currentBrief = briefs.find((b) => b.briefId === briefId);
    const updatedStatuses = {
      ...(currentBrief?.pathwayStatuses || {}),
      [key]: newStatus,
    };

    try {
      await updateUserPathwayStatus(user.uid, briefId, updatedStatuses);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Calculate total active commitments across all briefs
  const totalActiveCommitments = briefs.reduce((acc, brief) => {
    const statuses = Object.values(brief.pathwayStatuses || {});
    const activeCount = statuses.filter((s) => s === "Active").length;
    return acc + activeCount;
  }, 0);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Recently";
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
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
    <div id="dashboard-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--hair)]">
        <div>
          <span className="eyebrow py-0.5 px-2.5 text-[10px]">
            <span className="dot" />
            <span>Personal Dashboard</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-light text-[var(--ink)] tracking-tight mt-3">
            My Involvement Journey
          </h1>
          <p className="text-sm text-[var(--mute)] mt-1 max-w-xl font-light">
            Track your exploration, direct pathways, and active commitments across all your analyzed briefs.
          </p>
        </div>

        {/* Lightweight Active Commitments Counter */}
        <div
          id="stat-active-commitments"
          className="bezel shrink-0"
        >
          <div className="core p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--foam)]/15 text-[var(--foam)] flex items-center justify-center border border-[var(--foam)]/30">
              <Flame className="w-6 h-6 text-[var(--foam)]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-display">
                  {totalActiveCommitments}
                </span>
                <span className="text-xs font-mono uppercase text-[var(--foam)]">active</span>
              </div>
              <span className="text-xs font-mono tracking-wider uppercase text-[var(--mute)] block">
                Commitments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-8 h-8 border-2 border-[var(--foam)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--mute)] font-mono">Loading your involvement journey...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm">
          {error}
        </div>
      ) : briefs.length === 0 ? (
        <div
          id="dashboard-empty-state"
          className="bezel"
        >
          <div className="core p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-[var(--hair)] text-zinc-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-[var(--foam)]" />
            </div>
            <h2 className="text-lg font-display font-medium text-[var(--ink)]">
              No saved briefs yet
            </h2>
            <p className="text-sm text-[var(--mute)] max-w-md mx-auto font-light leading-relaxed">
              Whenever you generate a Pathfinder brief while signed in, it will automatically appear here with pathways you can track.
            </p>
            <div className="pt-3">
              <button
                id="btn-empty-create-brief"
                onClick={onNavigateHome}
                className="btn btn-primary text-sm"
              >
                <span>Analyze your first problem</span>
                <span className="pip">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18 18 6M9 6h9v9" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="tag m-0 text-xs">
              Analyzed Briefs ({briefs.length})
            </h2>
            <button
              id="btn-dashboard-new-brief"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--foam)] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Problem Brief</span>
            </button>
          </div>

          {/* List of briefs */}
          {briefs.map((record) => (
            <section
              key={record.briefId}
              id={`brief-card-${record.briefId}`}
              className="bezel"
            >
              <div className="core p-6 sm:p-7 space-y-6">
                {/* Header: Original Problem + Date + Link to Brief */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[var(--hair)]">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--faint)]">
                        Generated {formatDate(record.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-[var(--ink)] leading-snug">
                      &ldquo;{record.originalProblem}&rdquo;
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                    <button
                      id={`btn-chat-brief-${record.briefId}`}
                      onClick={() => {
                        setSelectedBriefForAssistant(record);
                        setIsAssistantOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--void)] bg-[var(--foam)] hover:bg-[#b0ecd0] transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Solve with AI</span>
                    </button>

                    <button
                      id={`btn-view-brief-${record.briefId}`}
                      onClick={() => onSelectBrief(record.briefId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--foam)] bg-[var(--foam)]/10 hover:bg-[var(--foam)]/20 border border-[var(--foam)]/40 transition cursor-pointer"
                    >
                      <span>View Full Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pathways status tracker */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider">
                      Pathway Commitments
                    </h4>
                    <span className="text-xs font-mono text-[var(--faint)]">
                      Click status to update immediately
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {record.brief.pathways.map((pathway, pIdx) => {
                      const statusKey = pIdx.toString();
                      const currentStatus =
                        record.pathwayStatuses?.[statusKey] || "Interested";

                      return (
                        <div
                          key={pIdx}
                          id={`pathway-item-${record.briefId}-${pIdx}`}
                          className="bg-white/[0.02] rounded-xl p-4 border border-[var(--hair)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-lg">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[var(--ink)] font-display">
                                {pathway.platform}
                              </span>
                              <span
                                className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                  pathway.category
                                )}`}
                              >
                                {formatCategoryLabel(pathway.category)}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--mute)] line-clamp-2">
                              <span className="font-medium text-zinc-200">First Step: </span>
                              {pathway.first_step}
                            </p>
                          </div>

                          {/* Status selector (Interested → Started → Active) */}
                          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-[var(--hair)] shrink-0 self-start md:self-auto">
                            {(["Interested", "Started", "Active"] as PathwayStatus[]).map(
                              (stateOption) => {
                                const isSelected = currentStatus === stateOption;
                                let selectedStyle = "bg-white/10 text-white border border-white/20";
                                if (stateOption === "Active") {
                                  selectedStyle = "bg-[var(--foam)] text-zinc-950 font-bold";
                                } else if (stateOption === "Started") {
                                  selectedStyle = "bg-amber-400 text-zinc-950 font-bold";
                                }

                                return (
                                  <button
                                    key={stateOption}
                                    id={`btn-status-${record.briefId}-${pIdx}-${stateOption.toLowerCase()}`}
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(
                                        record.briefId,
                                        pIdx,
                                        stateOption
                                      )
                                    }
                                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                                      isSelected
                                        ? selectedStyle
                                        : "text-[var(--mute)] hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    {stateOption}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Floating Bottom-Right Assistant Widget Trigger for Dashboard */}
      {!isAssistantOpen && (
        <aside
          id="floating-dashboard-assistant-widget"
          aria-label="AI Assistant Trigger"
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            id="btn-floating-dashboard-assistant"
            onClick={() => {
              // Default to the first brief if available, or general dashboard context
              if (briefs.length > 0 && !selectedBriefForAssistant) {
                setSelectedBriefForAssistant(briefs[0]);
              }
              setIsAssistantOpen(true);
            }}
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
              AI Solution Assistant
            </span>
          </button>
        </aside>
      )}

      {/* Right-docked Solution Assistant Panel on Dashboard */}
      <SolutionAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setSelectedBriefForAssistant(null);
        }}
        brief={selectedBriefForAssistant ? selectedBriefForAssistant.brief : (briefs[0]?.brief || null)}
        originalProblem={selectedBriefForAssistant ? selectedBriefForAssistant.originalProblem : (briefs[0]?.originalProblem || "")}
        contextMode={selectedBriefForAssistant ? "brief" : "dashboard"}
        totalSavedBriefs={briefs.length}
      />
    </div>
  );
};
