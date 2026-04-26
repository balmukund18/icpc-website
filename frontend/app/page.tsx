"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const features = [
  { cmd: "sessions", title: "Live Sessions", description: "Weekly workshops on DSA, system design, and competitive programming strategies." },
  { cmd: "tasks", title: "Practice Tasks", description: "Curated problem sets from LeetCode, Codeforces, and CodeChef to sharpen your skills." },
  { cmd: "contests", title: "Contests", description: "Regular competitive programming contests with leaderboard rankings and rewards." },
  { cmd: "leaderboard", title: "Leaderboard", description: "Track your progress and compete with peers across multiple coding platforms." },
  { cmd: "blogs", title: "Tech Blogs", description: "Read and write technical articles on algorithms, data structures, and interview prep." },
  { cmd: "alumni", title: "Alumni Network", description: "Connect with past members now at Google, Amazon, Microsoft, and more." },
];

const COMMAND_STRING = "icpc --init chapter --mode=competitive";

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════ */

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const { theme } = useTheme();

  // Typing effect
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < COMMAND_STRING.length) {
        setTyped(COMMAND_STRING.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  // CTA hover states
  const [hoverStart, setHoverStart] = useState(false);
  const [hoverLogin, setHoverLogin] = useState(false);

  // Command input
  const [commandInput, setCommandInput] = useState("");

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && commandInput.trim()) {
      const cmd = commandInput.trim().toLowerCase();
      const match = features.find((f) => f.cmd === cmd);
      if (match) {
        router.push(`/${match.cmd}`);
      }
      setCommandInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated CSS grid background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88,166,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88,166,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(88,166,255,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Typing command */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 font-mono text-sm text-[#8B949E]"
          >
            <span className="text-[#3FB950]">$</span>{" "}
            <span className="text-[#E6EDF3]">{typed}</span>
            <span
              className="inline-block w-[2px] h-[14px] bg-[#58A6FF] ml-[2px] align-middle"
              style={{ opacity: showCursor ? 1 : 0 }}
            />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-[#3FB950] font-mono">&gt; </span>
            <span className="text-[#E6EDF3]">ICPC USICT</span>
            <br />
            <span className="text-[#8B949E] text-[clamp(1.2rem,3vw,2.2rem)] font-normal">
              Chapter
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg text-[#8B949E] leading-relaxed max-w-xl mx-auto mb-10"
          >
            Advancing competitive programming, algorithmic thinking, and
            engineering excellence at USICT.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <button
              onClick={() => router.push("/register")}
              onMouseEnter={() => setHoverStart(true)}
              onMouseLeave={() => setHoverStart(false)}
              className="font-mono text-sm border border-[#58A6FF] text-[#58A6FF] px-6 py-2.5 hover:bg-[#58A6FF]/10 transition-all duration-300"
            >
              {hoverStart ? "> register()" : "[ Get Started ]"}
            </button>
            <button
              onClick={() => router.push("/login")}
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              className="font-mono text-sm border border-[#21262D] text-[#8B949E] px-6 py-2.5 hover:border-[#8B949E] hover:text-[#E6EDF3] transition-all duration-300"
            >
              {hoverLogin ? "> login()" : "[ Login ]"}
            </button>
          </motion.div>

          {/* Command input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="max-w-md mx-auto"
          >
            <div className="flex items-center bg-[#161B22] border border-[#21262D] px-4 py-3 font-mono text-sm rounded">
              <span className="text-[#3FB950] mr-2">&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleCommand}
                placeholder="type a command..."
                className="bg-transparent flex-1 text-[#E6EDF3] placeholder:text-[#484F58] outline-none"
              />
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="mt-16 flex flex-col items-center gap-2 text-[#484F58] text-xs font-mono"
          >
            <span>scroll to explore</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#58A6FF]"
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <Section className="py-24 px-6 border-t border-[#21262D]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono text-sm text-[#3FB950] mb-12">
            &gt; ls --features
          </h2>

          <div className="space-y-0">
            {features.map((f, i) => (
              <motion.div
                key={f.cmd}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => router.push(`/${f.cmd}`)}
                className="group flex items-center justify-between py-5 border-b border-[#21262D] hover:bg-[#161B22] px-4 -mx-4 cursor-pointer transition-colors duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-[#58A6FF]">
                      ./{f.cmd}
                    </span>
                    <span className="text-[#21262D]">—</span>
                    <span className="text-sm text-[#E6EDF3] font-medium">
                      {f.title}
                    </span>
                  </div>
                  <p className="text-sm text-[#8B949E] pl-0 sm:pl-[calc(3ch+0.75rem+1ch+0.75rem)]">
                    {f.description}
                  </p>
                </div>
                <span className="text-[#484F58] group-hover:text-[#58A6FF] group-hover:translate-x-1 transition-all duration-300 ml-4">
                  →
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── STATS ── */}
      <Section className="py-20 px-6 border-t border-[#21262D]" delay={0.1}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono text-sm text-[#3FB950] mb-10">
            &gt; cat stats.json
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { key: "active_members", value: "150+" },
              { key: "contests_held", value: "25+" },
              { key: "tasks_solved", value: "500+" },
              { key: "alumni_connected", value: "50+" },
            ].map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#161B22] border border-[#21262D] p-5 font-mono group hover:border-[#58A6FF]/30 transition-colors duration-300"
              >
                <p className="text-xs text-[#484F58] mb-2">{s.key}:</p>
                <p className="text-2xl font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors duration-300">
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-28 px-6 border-t border-[#21262D]" delay={0.1}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-mono text-sm text-[#3FB950] mb-6">
            &gt; ./join --chapter
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-[#E6EDF3] mb-4">
            Join the Chapter
          </p>
          <p className="text-[#8B949E] mb-10 max-w-md mx-auto">
            Start your competitive programming journey. Connect, learn, and
            compete with the best.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/register")}
              className="font-mono text-sm bg-[#58A6FF] text-[#0D1117] px-6 py-2.5 hover:bg-[#79B8FF] transition-all duration-300 font-medium"
            >
              [ Register ]
            </button>
            <button
              onClick={() => router.push("/login")}
              className="font-mono text-sm border border-[#21262D] text-[#8B949E] px-6 py-2.5 hover:border-[#8B949E] hover:text-[#E6EDF3] transition-all duration-300"
            >
              [ Login ]
            </button>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#21262D] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#484F58] font-mono">
            &copy; 2026 ICPC USICT Chapter. All rights reserved.
          </p>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
            <span className="text-[#3FB950]">system.status:</span>
            <span className="text-[#8B949E]">online</span>
          </div>
        </div>
      </footer>

      {/* ── CSS-in-JS ── */}
      <style jsx>{`
        @keyframes gridMove {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 60px 60px, 60px 60px;
          }
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
            transform: translate(-1px, -1px);
          }
          80% {
            transform: translate(1px, 2px);
          }
        }
      `}</style>
    </div>
  );
}
