/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Header } from "./components/Header.tsx";
import { LandingPage } from "./components/LandingPage.tsx";
import { LandingHero } from "./components/LandingHero.tsx";
import { BriefView } from "./components/BriefView.tsx";
import { LoadingState } from "./components/LoadingState.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { Footer } from "./components/Footer.tsx";
import {
  auth,
  signInWithGoogle,
  logOut,
  saveBrief,
  getBriefById,
} from "./lib/firebase.ts";
import type { BriefResponse, GenerateBriefResponse } from "./types.ts";
import { Compass, RotateCcw } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [problemText, setProblemText] = useState("");
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Views:
  // "landing" -> New Landing Page with 7 sections & Earth Globe
  // "workspace" -> Tool where user inputs problem (/app)
  // "loading" -> Animated step progression during Gemini generation
  // "result" -> The 6 result cards
  // "dashboard" -> My Journey dashboard
  // "fetching-brief" -> Loading /brief/:id
  // "not-found" -> 404 for invalid brief ID
  const [view, setView] = useState<
    "landing" | "workspace" | "loading" | "result" | "dashboard" | "not-found" | "fetching-brief"
  >("landing");

  const [currentRoute, setCurrentRoute] = useState<string>(
    window.location.pathname
  );

  // Router handler based on pathname
  const handleRouteChange = useCallback(
    async (pathname: string, currentUser?: User | null, isAuthDetermined = false) => {
      setCurrentRoute(pathname);

      if (pathname.startsWith("/brief/")) {
        const id = pathname.replace(/^\/brief\//, "").split("/")[0];
        if (!id) {
          setView("not-found");
          return;
        }

        // If we already have this brief loaded in memory with matching id, keep it
        if (brief && briefId === id) {
          setView("result");
          return;
        }

        setView("fetching-brief");
        try {
          const docData = await getBriefById(id);
          if (docData && docData.brief) {
            setBrief(docData.brief);
            setProblemText(docData.originalProblem || "");
            setBriefId(id);
            setView("result");
          } else {
            setView("not-found");
          }
        } catch (err) {
          console.error("Error fetching brief by ID:", err);
          setView("not-found");
        }
      } else if (pathname === "/dashboard") {
        if (!isAuthDetermined) {
          return;
        }
        if (currentUser) {
          setView("dashboard");
        } else {
          // If signed-out user tries to visit /dashboard, redirect to landing
          window.history.replaceState({}, "", "/");
          setCurrentRoute("/");
          setView("landing");
        }
      } else if (pathname === "/app" || pathname === "/tool") {
        if (view !== "loading" && view !== "result") {
          setView("workspace");
        }
      } else {
        // Default "/" -> Landing Page
        if (view !== "loading" && view !== "result") {
          setView("landing");
        }
      }
    },
    [brief, briefId, view]
  );

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      handleRouteChange(window.location.pathname, currentUser, true);
    });

    return () => unsubscribe();
  }, [handleRouteChange]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const onPopState = () => {
      handleRouteChange(window.location.pathname, user, !authLoading);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [handleRouteChange, user, authLoading]);

  // Navigate helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    handleRouteChange(path, user, !authLoading);
  };

  const handleGenerateBrief = async (problemInput: string) => {
    setProblemText(problemInput);
    setIsLoading(true);
    setErrorMessage(null);
    setView("loading");

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problem: problemInput }),
      });

      const data: GenerateBriefResponse = await response.json();

      if (!response.ok || data.error || !data.brief) {
        throw new Error(
          data.error || "Failed to generate your innovation brief. Please try again."
        );
      }

      // Persist to Firestore (available to ALL users, linked to UID if signed in)
      let savedId = "";
      try {
        savedId = await saveBrief(problemInput, data.brief, user);
      } catch (saveErr) {
        console.warn("Could not persist brief to Firestore:", saveErr);
      }

      setBrief(data.brief);
      setBriefId(savedId || null);

      if (savedId) {
        window.history.pushState({}, "", `/brief/${savedId}`);
        setCurrentRoute(`/brief/${savedId}`);
      }
      setView("result");
    } catch (err: unknown) {
      console.error("Generate brief error:", err);
      let msg =
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the problem.";

      // Sanitize any raw ApiError or JSON strings
      if (msg.includes("503") || msg.toLowerCase().includes("high demand") || msg.includes("UNAVAILABLE")) {
        msg = "The AI engine is temporarily experiencing high demand. Please try again in a moment.";
      } else if (msg.includes("429") || msg.toLowerCase().includes("rate limit") || msg.includes("RESOURCE_EXHAUSTED")) {
        msg = "The AI service is momentarily rate-limited. Please wait a few seconds and try again.";
      } else {
        try {
          const jsonMatch = msg.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error?.message) {
              msg = parsed.error.message;
            }
          }
        } catch {
          // ignore
        }
      }

      setErrorMessage(msg);
      setView("workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigateTo("/app");
    setBrief(null);
    setBriefId(null);
    setProblemText("");
    setErrorMessage(null);
    setView("workspace");
  };

  const handleRefine = (problemToRefine: string) => {
    navigateTo("/app");
    setProblemText(problemToRefine);
    setErrorMessage(null);
    setView("workspace");
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      if (currentRoute === "/dashboard") {
        navigateTo("/");
      }
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--void)] text-[var(--ink)] antialiased relative selection:bg-[#9FE3C2]/20 selection:text-[#9FE3C2]">
      {/* Background ambient field across the whole app */}
      <div className="field" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-veil" />
      </div>

      <div className="grain" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="app-gr">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#app-gr)" />
        </svg>
      </div>

      {/* When on the landing page view, render LandingPage with its dedicated floating pill nav */}
      {view === "landing" ? (
        <LandingPage
          onGetStarted={() => {
            navigateTo("/app");
            setView("workspace");
          }}
          user={user}
          authLoading={authLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateDashboard={() => navigateTo("/dashboard")}
        />
      ) : (
        /* When in workspace, result, dashboard, or loading views, render Header + Content + Footer */
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header
            onReset={handleReset}
            showReset={view === "result"}
            user={user}
            authLoading={authLoading}
            currentRoute={currentRoute}
            onNavigateHome={() => navigateTo("/")}
            onNavigateDashboard={() => navigateTo("/dashboard")}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 flex flex-col justify-start">
            {view === "workspace" && (
              <LandingHero
                onSubmit={handleGenerateBrief}
                isLoading={isLoading}
                initialValue={problemText}
                errorMessage={errorMessage}
              />
            )}

            {view === "loading" && <LoadingState problemPrompt={problemText} />}

            {view === "fetching-brief" && (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-8 h-8 border-2 border-[var(--foam)] border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--mute)]">
                  Retrieving Pathfinder brief...
                </p>
              </div>
            )}

            {view === "not-found" && (
              <div
                id="brief-not-found-state"
                className="bezel max-w-md mx-auto my-24 text-center"
              >
                <div className="core p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-[var(--hair)] text-zinc-400 flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6 text-[var(--foam)]" />
                  </div>
                  <h2 className="text-xl font-display font-medium text-[var(--ink)]">
                    This brief could not be found
                  </h2>
                  <p className="text-sm text-[var(--mute)] font-light leading-relaxed">
                    The brief link you requested does not exist or may have been removed.
                  </p>
                  <div className="pt-2">
                    <button
                      id="btn-not-found-return-home"
                      onClick={() => navigateTo("/")}
                      className="btn btn-primary text-xs"
                    >
                      <span>Return to Home</span>
                      <span className="pip">
                        <svg viewBox="0 0 24 24">
                          <path d="M6 18 18 6M9 6h9v9" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === "result" && brief && (
              <BriefView
                brief={brief}
                originalProblem={problemText}
                briefId={briefId || undefined}
                onReset={handleReset}
                onRefine={handleRefine}
              />
            )}

            {view === "dashboard" && user && (
              <Dashboard
                user={user}
                onNavigateHome={() => {
                  navigateTo("/app");
                  setView("workspace");
                }}
                onSelectBrief={(selectedId) => navigateTo(`/brief/${selectedId}`)}
              />
            )}
          </main>

          <Footer />
        </div>
      )}
    </div>
  );
}
