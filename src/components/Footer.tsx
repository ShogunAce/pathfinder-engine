import React from "react";
import { PLATFORMS } from "../data/platforms.ts";

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="w-full border-t border-zinc-200/80 bg-white/60 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-zinc-700">The Innovation Engine</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>Verified Registry: {PLATFORMS.map(p => p.name).join(", ")}</span>
        </div>
        <div className="text-zinc-400">
          Built for zero-credential real action
        </div>
      </div>
    </footer>
  );
};
