import React, { useState } from "react";
import { motion } from "motion/react";
import type { User } from "firebase/auth";
import { EarthGlobe } from "./EarthGlobe.tsx";
import changemakerImg from "../assets/images/changemaker_portrait_1789523755481.jpg";
import citizenScienceImg from "../assets/images/citizen_science_team_1789523766114.jpg";
import {
  Sparkles,
  MapPin,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Layers,
  Users,
  Compass,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onNavigateDashboard,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--void)] text-[var(--ink)] overflow-x-hidden">
      {/* Background ambient field */}
      <div className="field" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-veil" />
      </div>

      <div className="grain" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="gr">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#gr)" />
        </svg>
      </div>

      {/* Floating Pill Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
        <div className="nav-pill pointer-events-auto flex items-center justify-between gap-3 sm:gap-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mark flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <span className="mark-bead" />
            <span className="font-mono text-xs sm:text-sm tracking-wider uppercase font-semibold text-zinc-100">
              Pathfinder Engine
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm text-[var(--mute)]">
            <button
              onClick={() => scrollToSection("what")}
              className="hover:text-[var(--ink)] transition-colors"
            >
              What it does
            </button>
            <button
              onClick={() => scrollToSection("who")}
              className="hover:text-[var(--ink)] transition-colors"
            >
              Who it is for
            </button>
            <button
              onClick={() => scrollToSection("pathways")}
              className="hover:text-[var(--ink)] transition-colors"
            >
              Pathways
            </button>
          </nav>

          {/* Nav Controls */}
          <div className="flex items-center gap-2.5">
            {/* User Auth controls */}
            {authLoading ? (
              <div className="w-16 h-7 bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--hair)]">
                <button
                  id="btn-nav-journey"
                  onClick={onNavigateDashboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--hair)] text-[var(--sky)] hover:bg-[var(--hair-strong)] transition-all border border-[var(--hair)]"
                >
                  <MapPin className="w-3 h-3 text-[var(--foam)]" />
                  <span className="hidden sm:inline">My Journey</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-google-signin"
                onClick={onSignIn}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>Sign in</span>
              </button>
            )}

            {/* Primary Get Started Button */}
            <button
              id="btn-nav-get-started"
              onClick={onGetStarted}
              className="btn btn-primary text-xs sm:text-sm"
            >
              <span>Get Started</span>
              <span className="pip">
                <svg viewBox="0 0 24 24">
                  <path d="M6 18 18 6M9 6h9v9" />
                </svg>
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full text-zinc-300 bg-white/5 border border-white/10"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--void)]/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-6 p-8 md:hidden">
          <button
            onClick={() => scrollToSection("what")}
            className="text-2xl font-display font-medium text-zinc-200"
          >
            What it does
          </button>
          <button
            onClick={() => scrollToSection("who")}
            className="text-2xl font-display font-medium text-zinc-200"
          >
            Who it is for
          </button>
          <button
            onClick={() => scrollToSection("pathways")}
            className="text-2xl font-display font-medium text-zinc-200"
          >
            Pathways
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onGetStarted();
            }}
            className="btn btn-primary btn-lg mt-4"
          >
            <span>Get Started</span>
            <span className="pip">
              <svg viewBox="0 0 24 24">
                <path d="M6 18 18 6M9 6h9v9" />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* MAIN SHELL */}
      <main className="shell">
        {/* HERO */}
        <section className="min-h-screen flex items-center pt-28 pb-16 wrap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            <div className="max-w-xl space-y-6">
              <div>
                <span className="eyebrow">
                  <span className="dot" />
                  <span>For the innovators of tomorrow</span>
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-light tracking-tight leading-[1.05] text-[var(--ink)]">
                Turn a problem you care about into{" "}
                <span className="serif grad block sm:inline">your first real move</span>.
              </h1>

              <p className="lede text-base sm:text-lg text-[var(--mute)] leading-relaxed font-light">
                Name any real world or planetary problem. Pathfinder Engine returns a clear
                brief and real, matched ways to get involved this week, from citizen
                science to hack for good, volunteering and open source.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="btn-hero-get-started"
                  onClick={onGetStarted}
                  className="btn btn-primary btn-lg"
                >
                  <span>Get Started</span>
                  <span className="pip">
                    <svg viewBox="0 0 24 24">
                      <path d="M6 18 18 6M9 6h9v9" />
                    </svg>
                  </span>
                </button>
                <span className="mono text-[var(--mute)]">Free to explore</span>
              </div>

              {/* Hero metadata pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[var(--hair)]">
                <div>
                  <strong className="block text-sm font-medium text-[var(--ink)]">
                    Citizen science
                  </strong>
                  <span className="small block text-xs text-[var(--faint)]">
                    Contribute real data
                  </span>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-[var(--ink)]">
                    Hack for good
                  </strong>
                  <span className="small block text-xs text-[var(--faint)]">
                    Build with a team
                  </span>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-[var(--ink)]">
                    Volunteering
                  </strong>
                  <span className="small block text-xs text-[var(--faint)]">
                    Show up locally
                  </span>
                </div>
                <div>
                  <strong className="block text-sm font-medium text-[var(--ink)]">
                    Open source
                  </strong>
                  <span className="small block text-xs text-[var(--faint)]">
                    Ship a first commit
                  </span>
                </div>
              </div>
            </div>

            {/* Procedural Canvas Earth Globe */}
            <div className="flex justify-center items-center">
              <EarthGlobe />
            </div>
          </div>
        </section>

        {/* WHAT IT DOES */}
        <section id="what" className="py-24 wrap border-t border-[var(--hair)]">
          <div className="max-w-2xl space-y-4 mb-16">
            <p className="tag m-0">What it does</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight text-[var(--ink)]">
              Three steps from <span className="serif grad">caring to doing</span>.
            </h2>
            <p className="lede text-base sm:text-lg text-[var(--mute)]">
              No endless research. No guesswork about where to begin. One clear path from
              concern to contribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Step 01 */}
            <motion.article
              className="step bezel flex flex-col cursor-default"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -8,
                transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <div className="core p-7 sm:p-8 flex flex-col justify-start gap-5 flex-1 min-h-[15.5rem]">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hair)] border border-[var(--hair-strong)]">
                    <svg
                      className="w-5 h-5 text-[var(--foam)] stroke-current fill-none stroke-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 7h16M4 12h10M4 17h6" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs tracking-widest text-[var(--foam)]">
                    01
                  </span>
                </div>
                <div className="h-0.5 w-14 bg-gradient-to-r from-[var(--foam)] to-transparent" />
                <div className="space-y-2.5">
                  <h3 className="text-xl font-display font-medium text-[var(--ink)]">
                    Enter a problem
                  </h3>
                  <p className="text-sm text-[var(--mute)] leading-relaxed">
                    Coral bleaching, food deserts, air quality on your street. Write it in
                    your own words.
                  </p>
                </div>
              </div>
            </motion.article>

            {/* Step 02 */}
            <motion.article
              className="step bezel flex flex-col cursor-default"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -8,
                transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <div className="core p-7 sm:p-8 flex flex-col justify-start gap-5 flex-1 min-h-[15.5rem]">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hair)] border border-[var(--hair-strong)]">
                    <svg
                      className="w-5 h-5 text-[var(--foam)] stroke-current fill-none stroke-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 4h7l4 4v12H7z" />
                      <path d="M14 4v4h4M10 13h5M10 16h5" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs tracking-widest text-[var(--foam)]">
                    02
                  </span>
                </div>
                <div className="h-0.5 w-14 bg-gradient-to-r from-[var(--foam)] to-transparent" />
                <div className="space-y-2.5">
                  <h3 className="text-xl font-display font-medium text-[var(--ink)]">
                    Get your brief
                  </h3>
                  <p className="text-sm text-[var(--mute)] leading-relaxed">
                    A short, clear read on what is happening, who is working on it, and
                    where the leverage sits.
                  </p>
                </div>
              </div>
            </motion.article>

            {/* Step 03 */}
            <motion.article
              className="step bezel flex flex-col cursor-default"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -8,
                transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <div className="core p-7 sm:p-8 flex flex-col justify-start gap-5 flex-1 min-h-[15.5rem]">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hair)] border border-[var(--hair-strong)]">
                    <svg
                      className="w-5 h-5 text-[var(--foam)] stroke-current fill-none stroke-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.5 14.2 9l5.8.4-4.5 3.8 1.5 5.7L12 15.9 7 18.9l1.5-5.7L4 9.4 9.8 9 12 3.5Z" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs tracking-widest text-[var(--foam)]">
                    03
                  </span>
                </div>
                <div className="h-0.5 w-14 bg-gradient-to-r from-[var(--foam)] to-transparent" />
                <div className="space-y-2.5">
                  <h3 className="text-xl font-display font-medium text-[var(--ink)]">
                    Take your first move
                  </h3>
                  <p className="text-sm text-[var(--mute)] leading-relaxed">
                    Matched, real openings you can start this week. Named platforms, not
                    vague advice.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </section>

        {/* WHO IT IS FOR */}
        <section id="who" className="py-24 wrap border-t border-[var(--hair)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Changemaker image */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bezel">
                <div className="core p-2.5 sm:p-3 overflow-hidden rounded-[1.35rem]">
                  <div className="relative aspect-[1/1.16] w-full rounded-xl overflow-hidden border border-white/10 group">
                    <img
                      src={changemakerImg}
                      alt="Changemaker working on innovative technology"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Subtle atmospheric vignette and brand accent overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--void)]/85 via-[var(--void)]/20 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-xl pointer-events-none" />
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="font-mono text-[11px] tracking-widest text-[var(--foam)] uppercase drop-shadow-md">
                        Innovators of Tomorrow
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[var(--foam)] shadow-[0_0_8px_var(--foam)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <p className="tag m-0">Who it is for</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight text-[var(--ink)]">
                You already care. This is the part where you{" "}
                <span className="serif grad">begin</span>.
              </h2>
              <p className="lede text-base sm:text-lg text-[var(--mute)] leading-relaxed">
                For students, engineers, designers, scientists and quiet worriers. For
                anyone who reads the news, feels the weight of it, and wants somewhere to
                put that energy.
              </p>
              <p className="lede text-base sm:text-lg text-[var(--mute)] leading-relaxed">
                Being a Pathfinder is not a credential. It is a first contribution, then
                another.
              </p>

              <div className="border-t border-[var(--hair)] pt-2 mt-6">
                <div className="grid grid-cols-12 gap-4 py-3.5 border-b border-[var(--hair)] items-start">
                  <span className="col-span-1 font-mono text-xs tracking-widest text-[var(--foam)] pt-1">
                    01
                  </span>
                  <p className="col-span-11 text-sm text-[var(--mute)] leading-relaxed m-0">
                    Students and early career builders looking for work that means
                    something beyond a resume line.
                  </p>
                </div>
                <div className="grid grid-cols-12 gap-4 py-3.5 border-b border-[var(--hair)] items-start">
                  <span className="col-span-1 font-mono text-xs tracking-widest text-[var(--foam)] pt-1">
                    02
                  </span>
                  <p className="col-span-11 text-sm text-[var(--mute)] leading-relaxed m-0">
                    Innovators of Tomorrow who want a real problem to point their skills
                    at, not a hypothetical one.
                  </p>
                </div>
                <div className="grid grid-cols-12 gap-4 py-3.5 border-b border-[var(--hair)] items-start">
                  <span className="col-span-1 font-mono text-xs tracking-widest text-[var(--foam)] pt-1">
                    03
                  </span>
                  <p className="col-span-11 text-sm text-[var(--mute)] leading-relaxed m-0">
                    Anyone who has bookmarked a cause for months and never found a door
                    that was actually open.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <motion.div
              className="p-6 rounded-2xl border border-[var(--hair-strong)] bg-gradient-to-br from-[#9FD0FF]/10 to-transparent cursor-default transition-colors duration-300 hover:border-[var(--sky)]/70 hover:shadow-[0_20px_40px_-15px_rgba(159,208,255,0.22)]"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -7,
                transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <p className="text-base sm:text-lg font-normal text-white mb-2 leading-snug">
                &#8220;I want to help with ocean plastic.&#8221;
              </p>
              <p className="font-mono text-xs text-[var(--foam)] tracking-wider uppercase m-0">
                3 openings found near you
              </p>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl border border-[var(--hair-strong)] bg-gradient-to-br from-[#7ED6A8]/10 to-transparent cursor-default transition-colors duration-300 hover:border-[var(--foam)]/70 hover:shadow-[0_20px_40px_-15px_rgba(126,214,168,0.22)]"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -7,
                transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <p className="text-base sm:text-lg font-normal text-white mb-2 leading-snug">
                &#8220;Heat in my city is getting dangerous.&#8221;
              </p>
              <p className="font-mono text-xs text-[var(--foam)] tracking-wider uppercase m-0">
                Sensor mapping project, starts Saturday
              </p>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl border border-[var(--hair-strong)] bg-gradient-to-br from-[#9FD0FF]/10 to-transparent cursor-default transition-colors duration-300 hover:border-[var(--sky)]/70 hover:shadow-[0_20px_40px_-15px_rgba(159,208,255,0.22)]"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -7,
                transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <p className="text-base sm:text-lg font-normal text-white mb-2 leading-snug">
                &#8220;I can code, I just do not know where.&#8221;
              </p>
              <p className="font-mono text-xs text-[var(--foam)] tracking-wider uppercase m-0">
                4 good first issues, matched to you
              </p>
            </motion.div>
          </div>
        </section>

        {/* YOUR PATHWAYS IN */}
        <section id="pathways" className="py-24 wrap border-t border-[var(--hair)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl space-y-3">
              <p className="tag m-0">Your pathways in</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight text-[var(--ink)]">
                Real platforms, real work, <span className="serif grad">open right now</span>.
              </h2>
            </div>
            <p className="text-sm text-[var(--mute)] max-w-sm">
              Every match points to a live opening on an existing platform, with the
              commitment stated up front.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Citizen science (Tall) */}
            <motion.article
              className="lg:col-span-7 bezel cursor-default flex flex-col"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, delay: 0, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -8,
                transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <div className="core p-8 flex flex-col justify-between gap-6 h-full flex-1">
                <div className="flex items-center justify-between">
                  <span className="bead bead-1" />
                  <span className="font-mono text-xs tracking-wider uppercase text-[var(--sky)]">
                    From 20 minutes
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-medium text-[var(--ink)]">
                    Citizen science
                  </h3>
                  <p className="text-sm text-[var(--mute)] leading-relaxed">
                    Count, measure, classify. Contribute observations that researchers
                    actually use. Reef surveys, bird counts, air and water sampling, sky
                    watching.
                  </p>
                </div>
                <div className="relative aspect-[16/10] w-full mt-4 rounded-xl overflow-hidden border border-white/10 group">
                  <img
                    src={citizenScienceImg}
                    alt="Citizen science community collaborating together"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--void)]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-xl pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="font-mono text-[11px] tracking-widest text-[var(--sky)] uppercase drop-shadow-md">
                      Community Fieldwork &bull; Live Observations
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[var(--sky)] shadow-[0_0_8px_var(--sky)]" />
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Right column: Hack for good + Volunteering */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Hack for good */}
              <motion.article
                className="bezel flex-1 cursor-default flex flex-col"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
                }}
              >
                <div className="core p-8 flex flex-col justify-between gap-6 h-full flex-1">
                  <div className="flex items-center justify-between">
                    <span className="bead bead-2" />
                    <span className="font-mono text-xs tracking-wider uppercase text-[var(--foam)]">
                      One weekend
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-medium text-[var(--ink)]">
                      Hack for good
                    </h3>
                    <p className="text-sm text-[var(--mute)] leading-relaxed">
                      Weekend builds and challenges where a prototype turns into
                      something used.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="plat">Climate sprints</span>
                    <span className="plat">Civic tech jams</span>
                  </div>
                </div>
              </motion.article>

              {/* Volunteering */}
              <motion.article
                className="bezel flex-1 cursor-default flex flex-col"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: 0.22, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
                }}
              >
                <div className="core p-8 flex flex-col justify-between gap-6 h-full flex-1">
                  <div className="flex items-center justify-between">
                    <span className="bead bead-3" />
                    <span className="font-mono text-xs tracking-wider uppercase text-[var(--sky)]">
                      Near you
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-medium text-[var(--ink)]">
                      Volunteering
                    </h3>
                    <p className="text-sm text-[var(--mute)] leading-relaxed">
                      Local organisations that need hands, skills or steady hours this
                      month.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="plat">Local action</span>
                    <span className="plat">Remote support</span>
                  </div>
                </div>
              </motion.article>
            </div>

            {/* Open Source (Wide) */}
            <motion.article
              className="lg:col-span-12 bezel cursor-default"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{
                y: -6,
                transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              <div className="core p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="bead bead-4" />
                      <h3 className="text-2xl font-display font-medium text-[var(--ink)]">
                        Open source
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--mute)] leading-relaxed pt-2">
                      Good first issues on climate, health and public interest software,
                      flagged so your first contribution is something you can actually
                      finish.
                    </p>
                  </div>
                  <div className="flex flex-col lg:items-end gap-3 shrink-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="plat">Good first issue</span>
                      <span className="plat">Docs and data</span>
                      <span className="plat">Active maintainers</span>
                    </div>
                    <span className="font-mono text-xs tracking-wider uppercase text-[var(--sky)]">
                      At your pace
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </section>

        {/* CLOSING CTA WITH HORIZON ARC */}
        <section className="relative overflow-hidden py-36 border-t border-[var(--hair)]">
          <div className="horizon-glow" aria-hidden="true" />
          <div className="horizon-arc" aria-hidden="true" />
          <div className="wrap relative z-10 text-center flex flex-col items-center space-y-6 max-w-3xl mx-auto">
            <p className="tag-green font-mono text-xs tracking-widest uppercase m-0">
              One planet, many pathfinders
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display tracking-tight text-[var(--ink)] leading-tight">
              The problem you keep thinking about is{" "}
              <span className="serif grad block sm:inline">waiting for you</span>.
            </h2>
            <p className="lede text-base sm:text-lg text-[var(--mute)] max-w-xl mx-auto">
              Start with a sentence. Leave with a brief and a first move you can make this
              week.
            </p>
            <div className="pt-4">
              <button
                id="btn-bottom-get-started"
                onClick={onGetStarted}
                className="btn btn-primary btn-lg"
              >
                <span>Get Started</span>
                <span className="pip">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18 18 6M9 6h9v9" />
                  </svg>
                </span>
              </button>
            </div>
            <p className="small text-xs text-[var(--faint)] m-0">
              Opens the Pathfinder workspace
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-[var(--hair)] wrap">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[var(--mute)]">
            <div className="flex items-center gap-2.5">
              <span className="mark-bead" />
              <span className="font-mono tracking-widest uppercase font-semibold text-zinc-200">
                Pathfinder Engine
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => scrollToSection("what")}
                className="hover:text-[var(--ink)] transition-colors"
              >
                What it does
              </button>
              <button
                onClick={() => scrollToSection("who")}
                className="hover:text-[var(--ink)] transition-colors"
              >
                Who it is for
              </button>
              <button
                onClick={() => scrollToSection("pathways")}
                className="hover:text-[var(--ink)] transition-colors"
              >
                Pathways
              </button>
              <button
                onClick={onGetStarted}
                className="hover:text-[var(--ink)] transition-colors font-medium text-[var(--foam)]"
              >
                Get Started
              </button>
            </div>
            <span className="mono text-[var(--faint)]">
              Built for the innovators of tomorrow
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};
