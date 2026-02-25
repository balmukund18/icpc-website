"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────── Boot sequence lines ─────────────────── */
const BOOT_LINES = [
  "> booting ICPC USICT...",
  "> initializing competitive programming environment...",
  "> loading leaderboard module...",
  "> loading task engine...",
  "> connecting alumni network...",
  "> blog engine ready...",
  "> contest scheduler online...",
  "> session manager active...",
  "> system.status: online",
];

/* ─────────────────── Features data ─────────────────── */
const FEATURES = [
  {
    cmd: "leaderboard",
    title: "Leaderboard",
    desc: "Track rankings, compete for top positions, and monitor your progress against peers.",
  },
  {
    cmd: "tasks",
    title: "Tasks & Challenges",
    desc: "Solve curated problems on LeetCode and earn points. Submit solutions, get verified.",
  },
  {
    cmd: "contests",
    title: "Live Contests",
    desc: "Participate in timed contests hosted on HackerRank. Climb the contest leaderboard.",
  },
  {
    cmd: "sessions",
    title: "Learning Sessions",
    desc: "Join live mentoring sessions, workshops, and study groups led by seniors and alumni.",
  },
  {
    cmd: "blog",
    title: "Community Blog",
    desc: "Share knowledge, write editorials, and learn from articles by fellow members.",
  },
  {
    cmd: "alumni",
    title: "Alumni Network",
    desc: "Connect with alumni for mentorship, career guidance, and professional networking.",
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*                     MAIN COMPONENT                         */
/* ═══════════════════════════════════════════════════════════ */

export default function Home() {
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);

  /* ── Boot state ── */
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  /* ── Terminal input state ── */
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<
    { cmd: string; response: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Glitch state ── */
  const [glitchActive, setGlitchActive] = useState(false);

  /* ── Boot sequence ── */
  const bootIdxRef = useRef(0);
  useEffect(() => {
    bootIdxRef.current = 0;
    setBootLines([]);
    const timer = setInterval(() => {
      const i = bootIdxRef.current;
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        setBootLines((prev) => [...prev, line]);
        bootIdxRef.current = i + 1;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setBootDone(true);
          setTimeout(() => {
            setHeroVisible(true);
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 500);
          }, 300);
        }, 600);
      }
    }, 180);
    return () => clearInterval(timer);
  }, []);

  /* ── Terminal command handler ── */
  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      let response = "";

      switch (trimmed) {
        case "login":
          response = "redirecting to /login...";
          setTerminalHistory((h) => [...h, { cmd, response }]);
          setTimeout(() => router.push("/login"), 600);
          return;
        case "register":
          response = "redirecting to /register...";
          setTerminalHistory((h) => [...h, { cmd, response }]);
          setTimeout(() => router.push("/register"), 600);
          return;
        case "explore":
          response = "scrolling to features...";
          setTerminalHistory((h) => [...h, { cmd, response }]);
          setTimeout(
            () =>
              featuresRef.current?.scrollIntoView({ behavior: "smooth" }),
            300,
          );
          return;
        case "help":
          response =
            "available commands: login, register, explore, help, clear";
          break;
        case "clear":
          setTerminalHistory([]);
          setTerminalInput("");
          return;
        default:
          response = `command not found: ${trimmed}. type "help" for available commands.`;
      }
      setTerminalHistory((h) => [...h, { cmd, response }]);
      setTerminalInput("");
    },
    [router],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(terminalInput);
      setTerminalInput("");
    }
  };

  /* ═════════════════════ RENDER ═════════════════════ */
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] font-mono relative overflow-hidden">
      {/* ── Animated Background Grid ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88,166,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88,166,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(88,166,255,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Scanline overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* ═══════════════ BOOT SEQUENCE ═══════════════ */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0D1117] flex items-start justify-center pt-[15vh]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-xl w-full px-6">
              <div className="space-y-1">
                {bootLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className={`text-sm ${line?.includes("online")
                      ? "text-[#3FB950]"
                      : "text-[#8B949E]"
                      }`}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
              {/* Blinking cursor */}
              <div className="mt-2 flex items-center gap-1 text-sm text-[#8B949E]">
                <span>&gt;</span>
                <span className="animate-pulse">▋</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: heroVisible ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20"
      >
        {/* ── HERO SECTION ── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Glitch Title */}
            <div className="relative">
              <h1
                className={`text-5xl sm:text-7xl font-bold tracking-tighter ${glitchActive ? "glitch-text" : ""
                  }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ICPC USICT
              </h1>
              {/* Glitch layers */}
              {glitchActive && (
                <>
                  <h1
                    className="absolute inset-0 text-5xl sm:text-7xl font-bold tracking-tighter text-center"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#58A6FF",
                      clipPath: "inset(10% 0 60% 0)",
                      transform: "translateX(-3px)",
                      opacity: 0.7,
                    }}
                  >
                    ICPC USICT
                  </h1>
                  <h1
                    className="absolute inset-0 text-5xl sm:text-7xl font-bold tracking-tighter text-center"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#F85149",
                      clipPath: "inset(50% 0 10% 0)",
                      transform: "translateX(3px)",
                      opacity: 0.7,
                    }}
                  >
                    ICPC USICT
                  </h1>
                </>
              )}
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[#8B949E] text-sm sm:text-base"
            >
              USICT ACM Student Chapter — Competitive Programming Portal
            </motion.p>

            {/* ── Terminal-style Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 10 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-4"
            >
              <button
                onClick={() => router.push("/login")}
                className="group relative px-6 py-2.5 border border-[#30363D] text-[#E6EDF3] text-sm hover:border-[#58A6FF] transition-all duration-300"
              >
                <span className="group-hover:hidden">[ Login ]</span>
                <span className="hidden group-hover:inline text-[#58A6FF]">
                  &gt; login()
                </span>
              </button>
              <button
                onClick={() => router.push("/register")}
                className="group relative px-6 py-2.5 border border-[#30363D] text-[#E6EDF3] text-sm hover:border-[#3FB950] transition-all duration-300"
              >
                <span className="group-hover:hidden">[ Register ]</span>
                <span className="hidden group-hover:inline text-[#3FB950]">
                  &gt; register()
                </span>
              </button>
            </motion.div>

            {/* ── Interactive Terminal ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 10 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div
                className="bg-[#161B22] border border-[#30363D] p-4 text-left cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {/* Terminal header */}
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#30363D]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F85149]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9F1C]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3FB950]" />
                  <span className="ml-2 text-xs text-[#8B949E]">terminal</span>
                </div>

                {/* History */}
                {terminalHistory.map((entry, i) => (
                  <div key={i} className="mb-1">
                    <div className="text-sm">
                      <span className="text-[#3FB950]">$</span>{" "}
                      <span className="text-[#E6EDF3]">{entry.cmd}</span>
                    </div>
                    <div className="text-xs text-[#8B949E] ml-3">
                      {entry.response}
                    </div>
                  </div>
                ))}

                {/* Input line */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#3FB950]">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-[#E6EDF3] caret-[#58A6FF] placeholder:text-[#484F58]"
                    placeholder='type "help" for commands...'
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: heroVisible ? 1 : 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="pt-8"
            >
              <button
                onClick={() =>
                  featuresRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-[#484F58] text-xs hover:text-[#8B949E] transition-colors flex flex-col items-center gap-1"
              >
                <span>scroll to explore</span>
                <motion.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ↓
                </motion.span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section ref={featuresRef} className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <p className="text-sm text-[#8B949E] mb-2">
                &gt; ls --features
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                What&apos;s Inside
              </h2>
              <div className="w-16 h-px bg-[#58A6FF] mt-4" />
            </motion.div>

            {/* Features grid */}
            <div className="grid gap-0">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.cmd}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group py-6 border-b border-[#21262D] hover:bg-[#161B22]/50 transition-colors -mx-4 px-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-[#58A6FF] text-sm font-mono mt-1 flex-shrink-0 w-24">
                      ./{feature.cmd}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[#E6EDF3] mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#8B949E] leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                    <div className="text-[#30363D] group-hover:text-[#484F58] transition-colors text-sm flex-shrink-0">
                      →
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="py-16 px-6 border-t border-[#21262D]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8"
            >
              {[
                { label: "active_members", value: "150+" },
                { label: "contests_held", value: "25+" },
                { label: "tasks_solved", value: "500+" },
                { label: "alumni_connected", value: "50+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#E6EDF3]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#484F58] mt-1 font-mono">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="text-sm text-[#8B949E]">
                &gt; ready to begin?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Join the Chapter
              </h2>
              <p className="text-[#8B949E] text-sm max-w-md mx-auto">
                Register to access the competitive programming portal, track your
                progress, and connect with the community.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => router.push("/register")}
                  className="group px-8 py-3 bg-[#58A6FF] text-[#0D1117] font-semibold text-sm hover:bg-[#79B8FF] transition-colors"
                >
                  <span className="group-hover:hidden">[ Get Started ]</span>
                  <span className="hidden group-hover:inline">
                    &gt; register()
                  </span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="group px-8 py-3 border border-[#30363D] text-sm hover:border-[#58A6FF] transition-colors"
                >
                  <span className="group-hover:hidden">[ Login ]</span>
                  <span className="hidden group-hover:inline text-[#58A6FF]">
                    &gt; login()
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-8 px-6 border-t border-[#21262D]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-xs text-[#484F58] font-mono">
              © 2026 ICPC USICT. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
              <span>system.status: </span>
              <span className="text-[#3FB950]">online</span>
            </div>
          </div>
        </footer>
      </motion.div>

      {/* ── CSS Animations ── */}
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }
        .glitch-text {
          animation: glitchShake 0.4s ease-in-out;
        }
        @keyframes glitchShake {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 1px);
          }
          40% {
            transform: translate(2px, -1px);
          }
          60% {
            transform: translate(-1px, 2px);
          }
          80% {
            transform: translate(1px, -2px);
          }
        }
      `}</style>
    </div>
  );
}
