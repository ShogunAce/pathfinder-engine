import React, { useState } from "react";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";

interface LandingHeroProps {
  onSubmit: (problemText: string) => void;
  isLoading: boolean;
  initialValue?: string;
  errorMessage?: string | null;
}

const EXAMPLE_PROBLEMS = [
  "Urban heat islands in tree-deprived neighborhoods cook residents during heatwaves",
  "Elderly isolation in sprawling suburbs with zero public transit",
  "Synthetic microfibers from laundry shedding straight into municipal waterways",
  "Local food banks throwing away fresh produce due to last-mile transport bottlenecks",
  "Wildfire ash contamination in small community drinking water reservoirs",
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
    if (!problem.trim() || isLoading) return;
    onSubmit(problem.trim());
  };

  const handleSelectExample = (example: string) => {
    setProblem(example);
  };

  return (
    <section id="landing-hero-section" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
      <div className="flex flex-col items-center text-center space-y-6">
        
        {/* Subtle pill tag */}
        <div
          id="badge-platform-scope"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-medium border border-zinc-200/80 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real Problems &bull; Zero-Credential Pathways &bull; Active This Week</span>
        </div>

        {/* Main Headline */}
        <h1
          id="hero-main-heading"
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 max-w-3xl leading-[1.12]"
        >
          Turn a problem you care about into your first real move.
        </h1>

        {/* One-line subhead about citizen science, hack-for-good, and volunteering */}
        <p
          id="hero-subhead"
          className="text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl font-normal leading-relaxed"
        >
          Discover where citizen science, hack-for-good projects, and skilled volunteering urgently need newcomer hands right now.
        </p>

        {/* Error message banner if any */}
        {errorMessage && (
          <div
            id="error-banner"
            className="w-full max-w-2xl bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-sm flex items-start gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Unable to generate brief</p>
              <p className="text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Single Large Input Box + Button Form */}
        <form
          id="problem-input-form"
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-4 space-y-3"
        >
          <div className="relative flex flex-col sm:flex-row bg-white rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-md p-2">
            <textarea
              id="problem-input-field"
              rows={3}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe a messy real-world problem, planetary challenge, or half-formed idea you've been thinking about..."
              disabled={isLoading}
              className="w-full resize-none p-3 text-base sm:text-lg text-zinc-900 placeholder:text-zinc-400 bg-transparent border-none focus:outline-none focus:ring-0 leading-normal"
              required
            />
            <div className="flex items-end justify-end p-1 sm:p-2 sm:self-end">
              <button
                id="btn-generate-brief"
                type="submit"
                disabled={isLoading || !problem.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-all shadow-sm hover:shadow group shrink-0"
              >
                <span>{isLoading ? "Generating..." : "Generate my brief"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
            <span>Messy, unpolished thoughts welcome. No credentials required.</span>
            <span>{problem.length} chars</span>
          </div>
        </form>

        {/* Example problem prompts */}
        <div id="example-prompts-container" className="w-full max-w-2xl pt-4 text-left">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
            Or try an example to see it in action:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROBLEMS.map((example, idx) => (
              <button
                key={idx}
                id={`btn-example-${idx}`}
                type="button"
                onClick={() => handleSelectExample(example)}
                disabled={isLoading}
                className="text-xs sm:text-sm bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                &ldquo;{example.length > 55 ? example.substring(0, 52) + "..." : example}&rdquo;
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
