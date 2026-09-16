import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, Target, Compass, Layers } from "lucide-react";

interface LoadingStateProps {
  problemPrompt: string;
}

const STEPS = [
  { label: "Reframing the problem & isolating sub-challenges...", icon: Target },
  { label: "Mapping the ecosystem & existing key players...", icon: Layers },
  { label: "Pinpointing real newcomer openings & unaddressed gaps...", icon: Sparkles },
  { label: "Querying platform registry for verified live pathways...", icon: Compass },
  { label: "Synthesizing your single highest-leverage first move...", icon: Sparkles },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ problemPrompt }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="loading-brief-state"
      className="w-full max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8"
    >
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--hair)] border border-[var(--hair-strong)] flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--foam)]" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-display font-light tracking-tight text-[var(--ink)]">
          Synthesizing your <span className="serif grad">Pathfinder Brief</span>
        </h2>
        <p className="text-sm text-[var(--mute)] italic max-w-md mx-auto line-clamp-2">
          &ldquo;{problemPrompt}&rdquo;
        </p>
      </div>

      {/* Step progression in double bezel */}
      <div className="bezel max-w-md mx-auto text-left">
        <div className="core p-5 space-y-3.5">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-all ${
                  isCurrent
                    ? "text-[var(--foam)] font-medium"
                    : isDone
                    ? "text-[var(--mute)]"
                    : "text-zinc-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isDone
                      ? "bg-[var(--foam)]/20 text-[var(--foam)] border border-[var(--foam)]/40"
                      : isCurrent
                      ? "bg-[var(--foam)] text-zinc-950 font-bold animate-pulse"
                      : "bg-white/5 text-zinc-600 border border-white/5"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span className="flex-1">{step.label}</span>
                {isCurrent && (
                  <StepIcon className="w-3.5 h-3.5 animate-spin text-[var(--foam)] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="font-mono text-xs text-[var(--faint)]">
        Cross-referencing Zooniverse, SciStarter, Omdena, GitHub & open public interest projects...
      </p>
    </div>
  );
};
