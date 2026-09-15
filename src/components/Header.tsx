import React from "react";
import { Compass, RotateCcw, LogIn, LogOut, Map } from "lucide-react";
import type { User } from "firebase/auth";

interface HeaderProps {
  onReset: () => void;
  showReset?: boolean;
  user: User | null;
  authLoading: boolean;
  currentRoute: string;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  showReset,
  user,
  authLoading,
  currentRoute,
  onNavigateHome,
  onNavigateDashboard,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header
      id="app-header"
      className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-all"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <button
          id="btn-brand-home"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-display font-bold text-zinc-950 tracking-tight text-lg leading-tight block">
              The Innovation Engine
            </span>
            <span className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase block -mt-0.5">
              Actionable Problem Intelligence
            </span>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Problem Reset Button if applicable */}
          {showReset && (
            <button
              id="btn-new-brief-nav"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-zinc-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Problem</span>
            </button>
          )}

          {/* My Journey link ONLY when signed in */}
          {user && (
            <button
              id="btn-nav-my-journey"
              onClick={onNavigateDashboard}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                currentRoute === "/dashboard"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                  : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200"
              }`}
            >
              <Map className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Journey</span>
            </button>
          )}

          {/* Auth State Control */}
          {authLoading ? (
            <div className="w-24 h-8 bg-zinc-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-zinc-200/80">
              {/* User Avatar / Name */}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    id="user-avatar-img"
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full border border-zinc-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <span
                  id="user-display-name"
                  className="text-xs font-medium text-zinc-700 hidden md:inline-block max-w-[120px] truncate"
                  title={user.displayName || user.email || ""}
                >
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </div>

              {/* Sign out button */}
              <button
                id="btn-sign-out"
                onClick={onSignOut}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-google-sign-in"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
