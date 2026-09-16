import React, { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LandingHeroProps {
  onSubmit: (problemText: string) => void;
  isLoading: boolean;
  initialValue?: string;
  errorMessage?: string | null;
}

const EXAMPLE_PROBLEMS = [
  "Microplastics are showing up in our local water supply but there's no cheap way for regular people to test for them.",
  "Open-source investigators keep re-finding the same geolocation tools from scratch because there's no maintained, verified list.",
  "Small clinics in underserved areas can't predict patient demand, so they're always over- or under-staffed.",
  "A tiny nonprofit I know has years of donor data but no one who can turn it into a fundraising strategy.",
  "I care about my community and want to help, but I honestly don't know where to start.",
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSubmit,
  isLoading,
  initialValue = "",
  errorMessage,
}) => {
  const [problem, setProblem] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!problem.trim()) {
      const textarea = document.getElementById("problem-input-field") as HTMLTextAreaElement | null;
      textarea?.focus();
      return;
    }
    onSubmit(problem.trim());
  };

  const handleSelectExample = (example: string) => {
    setProblem(example);
  };

  return (
    <section
      id="landing-hero-section"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Subtle pill tag */}
        <div id="badge-platform-scope">
          <span className="eyebrow">
            <span className="dot" />
            <span>Pathfinder Workspace &bull; Zero Credentials &bull; Active Openings</span>
          </span>
        </div>

        {/* Main Headline */}
        <h1
          id="hero-main-heading"
          className="text-3xl sm:text-5xl font-display font-light tracking-tight text-[var(--ink)] max-w-3xl leading-[1.1]"
        >
          Turn a problem you care about into{" "}
          <span className="serif grad block sm:inline">your first real move</span>.
        </h1>

        {/* Subhead */}
        <p
          id="hero-subhead"
          className="lede text-base sm:text-lg text-[var(--mute)] max-w-2xl font-light leading-relaxed"
        >
          Enter a messy real-world or planetary problem. We will reframe it, map who is working on it, pinpoint the openings, and connect you with live pathways.
        </p>

        {/* Error message banner if any */}
        {errorMessage && (
          <div
            id="error-banner"
            className="w-full max-w-2xl bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-rose-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Unable to generate brief</p>
                <p className="text-rose-300/80 text-xs sm:text-sm mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            {problem.trim() && (
              <button
                id="btn-retry-brief"
                type="button"
                onClick={() => onSubmit(problem.trim())}
                disabled={isLoading}
                className="self-end sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-100 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-600/40 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Double-bezel input card */}
        <form
          id="problem-input-form"
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-4 text-left"
        >
          <div className="bezel">
            <div className="core p-4 sm:p-5 flex flex-col gap-4">
              <textarea
                id="problem-input-field"
                rows={4}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe a messy real-world problem, planetary challenge, or half-formed idea you've been thinking about..."
                disabled={isLoading}
                style={{ color: "#F4F7FA" }}
                className="w-full resize-none text-base sm:text-lg text-[#F4F7FA] placeholder:text-zinc-500 bg-transparent border-none focus:outline-none focus:ring-0 leading-relaxed font-light"
                required
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[var(--hair)]">
                <span className="text-xs text-[var(--mute)] font-light">
                  Messy, unpolished thoughts welcome. No credentials required.
                </span>

                <button
                  id="btn-generate-brief"
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full sm:w-auto text-sm shrink-0 cursor-pointer disabled:cursor-wait"
                >
                  <span className="font-semibold tracking-tight">
                    {isLoading ? "Generating brief..." : "Generate my brief"}
                  </span>
                  <span className="pip">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[2.5] fill-none stroke-current">
                      <path d="M6 18 18 6M9 6h9v9" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Example problem prompts */}
        <div id="example-prompts-container" className="w-full max-w-2xl pt-4 text-left">
          <p className="tag text-[11px] mb-3">
            Or select an example to see it in action:
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            {EXAMPLE_PROBLEMS.map((example, idx) => (
              <button
                key={idx}
                id={`btn-example-${idx}`}
                type="button"
                onClick={() => handleSelectExample(example)}
                disabled={isLoading}
                className="example-pill w-full sm:w-auto"
              >
                <span className="text-[var(--foam)] font-serif text-base leading-none select-none shrink-0">&ldquo;</span>
                <span className="flex-1 text-xs sm:text-[13px] font-normal leading-snug">
                  {example}
                </span>
                <span className="text-[var(--foam)] font-serif text-base leading-none select-none shrink-0">&rdquo;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
