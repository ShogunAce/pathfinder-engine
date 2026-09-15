/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Header } from "./components/Header.tsx";
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
import type { InnovationBrief, GenerateBriefResponse } from "./types.ts";
import { Compass } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [problemText, setProblemText] = useState("");
  const [brief, setBrief] = useState<InnovationBrief | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<
    "landing" | "loading" | "result" | "dashboard" | "not-found" | "fetching-brief"
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
        // If auth hasn't settled yet, wait
        if (!isAuthDetermined) {
          return;
        }
        if (currentUser) {
          setView("dashboard");
        } else {
          // If signed-out user tries to visit /dashboard, redirect them to the landing page
          window.history.replaceState({}, "", "/");
          setCurrentRoute("/");
          setView("landing");
        }
      } else {
        // Default / landing
        if (view !== "loading") {
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
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the problem.";
      setErrorMessage(msg);
      setView("landing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigateTo("/");
    setBrief(null);
    setBriefId(null);
    setErrorMessage(null);
    setView("landing");
  };

  const handleRefine = (problemToRefine: string) => {
    navigateTo("/");
    setProblemText(problemToRefine);
    setErrorMessage(null);
    setView("landing");
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
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
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
        {view === "landing" && (
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
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-500">
              Retrieving innovation brief...
            </p>
          </div>
        )}

        {view === "not-found" && (
          <div
            id="brief-not-found-state"
            className="max-w-md mx-auto px-4 py-24 text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-zinc-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 font-display">
              This brief could not be found
            </h2>
            <p className="text-sm text-zinc-600">
              The brief link you requested does not exist or may have been removed.
            </p>
            <div className="pt-2">
              <button
                id="btn-not-found-return-home"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold transition shadow-xs"
              >
                <span>Return to Home</span>
              </button>
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
            onNavigateHome={() => navigateTo("/")}
            onSelectBrief={(selectedId) => navigateTo(`/brief/${selectedId}`)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
