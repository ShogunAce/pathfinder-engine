import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="w-full border-t border-[var(--hair)] bg-[rgba(5,7,10,0.85)] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--mute)]">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="mark-bead w-2.5 h-2.5" />
          <span className="font-mono tracking-wider uppercase font-semibold text-zinc-300">
            Pathfinder Engine
          </span>
        </div>
        <div className="font-mono text-[11px] text-[var(--faint)]">
          Built for the innovators of tomorrow
        </div>
      </div>
    </footer>
  );
};
