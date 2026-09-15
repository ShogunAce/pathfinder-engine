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
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-display">
          Building your Innovation Brief
        </h2>
        <p className="text-sm text-zinc-500 italic max-w-md mx-auto line-clamp-2">
          &ldquo;{problemPrompt}&rdquo;
        </p>
      </div>

      {/* Step progression */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs max-w-md mx-auto text-left space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs sm:text-sm transition-all ${
                isCurrent
                  ? "text-emerald-700 font-semibold"
                  : isDone
                  ? "text-zinc-500"
                  : "text-zinc-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : isCurrent
                    ? "bg-emerald-600 text-white animate-pulse"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className="flex-1">{step.label}</span>
              {isCurrent && <StepIcon className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400">
        Aligning opportunities against Zooniverse, SciStarter, Omdena, GitHub, Devpost & more...
      </p>
    </div>
  );
};
