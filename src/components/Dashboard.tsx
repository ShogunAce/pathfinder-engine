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
} from "lucide-react";

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
    <div id="dashboard-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded">
            Personal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display mt-2">
            My Involvement Journey
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Track your exploration, direct pathways, and active commitments across all your analyzed briefs.
          </p>
        </div>

        {/* Lightweight Active Commitments Counter */}
        <div
          id="stat-active-commitments"
          className="bg-white rounded-2xl border border-emerald-300/80 p-4 sm:p-5 shadow-xs flex items-center gap-4 shrink-0"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Flame className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
                {totalActiveCommitments}
              </span>
              <span className="text-xs font-semibold text-emerald-700">active</span>
            </div>
            <span className="text-xs font-medium text-zinc-500 block">
              Active commitments
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading your involvement journey...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm">
          {error}
        </div>
      ) : briefs.length === 0 ? (
        <div
          id="dashboard-empty-state"
          className="bg-white rounded-2xl border border-zinc-200/90 p-8 sm:p-12 text-center shadow-xs space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-zinc-500" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">
            No saved briefs yet
          </h2>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            Whenever you generate an innovation brief while signed in, it will automatically appear here with pathways you can track.
          </p>
          <div className="pt-2">
            <button
              id="btn-empty-create-brief"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Analyze your first problem</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Analyzed Briefs ({briefs.length})
            </h2>
            <button
              id="btn-dashboard-new-brief"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
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
              className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 shadow-xs space-y-6"
            >
              {/* Header: Original Problem + Date + Link to Brief */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-zinc-100">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400">
                      Generated {formatDate(record.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
                    &ldquo;{record.originalProblem}&rdquo;
                  </h3>
                </div>

                <button
                  id={`btn-view-brief-${record.briefId}`}
                  onClick={() => onSelectBrief(record.briefId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition shrink-0 self-start sm:self-auto"
                >
                  <span>View Full Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pathways status tracker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Pathway Commitments
                  </h4>
                  <span className="text-xs text-zinc-400">
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
                        className="bg-zinc-50/80 rounded-xl p-4 border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 max-w-lg">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-zinc-900 font-display">
                              {pathway.platform}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(
                                pathway.category
                              )}`}
                            >
                              {pathway.category}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 line-clamp-2">
                            <span className="font-semibold text-zinc-700">First Step: </span>
                            {pathway.first_step}
                          </p>
                        </div>

                        {/* Status selector (Interested → Started → Active) */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200/90 shrink-0 self-start md:self-auto shadow-2xs">
                          {(["Interested", "Started", "Active"] as PathwayStatus[]).map(
                            (stateOption) => {
                              const isSelected = currentStatus === stateOption;
                              let selectedStyle = "bg-zinc-900 text-white shadow-2xs";
                              if (stateOption === "Active") {
                                selectedStyle = "bg-emerald-600 text-white shadow-2xs";
                              } else if (stateOption === "Started") {
                                selectedStyle = "bg-amber-500 text-white shadow-2xs";
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
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    isSelected
                                      ? selectedStyle
                                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
