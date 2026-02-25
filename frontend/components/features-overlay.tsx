"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    X,
    LayoutDashboard,
    ListChecks,
    Trophy,
    Crown,
    PenLine,
    Video,
    Users,
    Megaphone,
    Terminal,
    Code2,
    Zap,
    Target,
    BookOpen,
    Award,
} from "lucide-react";


/* ── Leadership Team ── */
const LEADERSHIP = [
    {
        name: "Ahzam Haque",
        role: "Lead",
        avatar: "/team/ahzam.jpg",
        initials: "AH",
        gradient: "from-[#58A6FF] to-[#388BFD]",
    },
    {
        name: "Manav Goel",
        role: "Vice Lead",
        avatar: "/team/manav.jpg",
        initials: "MG",
        gradient: "from-[#3FB950] to-[#2EA043]",
    },
];

const COORDINATORS = [
    { name: "Vasudev", initials: "V", gradient: "from-[#C678DD] to-[#A855F7]" },
    { name: "Rohan", initials: "R", gradient: "from-[#FF9F1C] to-[#F59E0B]" },
    { name: "Shayan", initials: "S", gradient: "from-[#F85149] to-[#EF4444]" },
];

/* ── Club Highlights ── */
const HIGHLIGHTS = [
    { icon: Target, text: "ACM-ICPC Regional Preparation", color: "#FF9F1C" },
    { icon: Code2, text: "Weekly Coding Competitions", color: "#3FB950" },
    { icon: Zap, text: "Google Code Jam & Kickstart Training", color: "#58A6FF" },
    { icon: BookOpen, text: "Algorithm Theory & Discussion Forums", color: "#C678DD" },
    { icon: Award, text: "Critical Thinking & Problem Solving", color: "#F85149" },
];

/* ── Platform Features ── */
const FEATURES = [
    { cmd: "dashboard", title: "Dashboard", desc: "Activity heatmap, rank progress & stats.", href: "/dashboard", icon: LayoutDashboard, color: "#58A6FF" },
    { cmd: "tasks", title: "Tasks", desc: "Curated problems with auto-grading.", href: "/tasks", icon: ListChecks, color: "#3FB950" },
    { cmd: "contests", title: "Contests", desc: "Club + live platform contest feeds.", href: "/contests", icon: Trophy, color: "#D29922" },
    { cmd: "leaderboard", title: "Leaderboard", desc: "Tiers, ratings, and rankings.", href: "/leaderboard", icon: Crown, color: "#FF9F1C" },
    { cmd: "blog", title: "Blog", desc: "Editorials, knowledge sharing.", href: "/blog", icon: PenLine, color: "#C678DD" },
    { cmd: "sessions", title: "Sessions", desc: "Live mentoring & workshops.", href: "/sessions", icon: Video, color: "#F85149" },
    { cmd: "alumni", title: "Alumni", desc: "Mentorship & career networking.", href: "/alumni", icon: Users, color: "#79C0FF" },
    { cmd: "alerts", title: "Alerts", desc: "Club news & event updates.", href: "/announcements", icon: Megaphone, color: "#56D364" },
];

/* ── Matrix Rain Canvas ── */
function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        const chars = "01アイウエオカキクケコ{}[]<>=/\\|;:+*&^%$#@!";
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const brightness = Math.random();
                if (brightness > 0.95) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = `bold ${fontSize}px monospace`;
                } else {
                    const g = Math.floor(100 + brightness * 155);
                    ctx.fillStyle = `rgba(63, ${g}, 80, ${0.2 + brightness * 0.4})`;
                    ctx.font = `${fontSize}px monospace`;
                }
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i] += 0.5 + Math.random() * 0.5;
            }
        };

        const interval = setInterval(draw, 50);
        return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.12 }} />;
}

/* ── Glitch Text ── */
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
    const [glitch, setGlitch] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className={`relative inline-block ${className}`}>
            <span className="relative z-10">{children}</span>
            {glitch && (
                <>
                    <span className="absolute top-0 left-0 z-20" style={{ color: "#FF4D4F", clipPath: "inset(20% 0 50% 0)", transform: "translateX(-2px)" }}>{children}</span>
                    <span className="absolute top-0 left-0 z-20" style={{ color: "#58A6FF", clipPath: "inset(50% 0 10% 0)", transform: "translateX(2px)" }}>{children}</span>
                </>
            )}
        </span>
    );
}

/* ── Avatar Component (with fallback to initials) ── */
function TeamAvatar({ src, initials, gradient, size = "w-16 h-16", textSize = "text-lg" }: {
    src?: string; initials: string; gradient: string; size?: string; textSize?: string;
}) {
    const [imgError, setImgError] = useState(false);

    if (src && !imgError) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={initials}
                className={`${size} object-cover border-2 border-[#30363D] rounded-sm`}
                style={{ display: "block" }}
                onError={() => setImgError(true)}
            />
        );
    }
    return (
        <div className={`${size} bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-[#30363D] rounded-sm flex-shrink-0`}>
            <span className={`text-white font-bold ${textSize}`}>{initials}</span>
        </div>
    );
}

/* ── Boot Lines ── */
const BOOT_LINES = [
    "> booting ICPC USICT portal v4.2.0...",
    "> loading club.manifest...",
    "> mounting /leadership /features /highlights...",
    "> decrypting member index... [OK]",
    "> system.status: online",
];

/* ═══════════════════════════════════════════════════ */
/*             MAIN OVERLAY COMPONENT                 */
/* ═══════════════════════════════════════════════════ */

interface FeaturesOverlayProps { open: boolean; onClose: () => void; }

export function FeaturesOverlay({ open, onClose }: FeaturesOverlayProps) {
    const router = useRouter();
    const [bootLines, setBootLines] = useState<string[]>([]);
    const [bootDone, setBootDone] = useState(false);
    const [sectionVisible, setSectionVisible] = useState(0); // 0=none, 1=club, 2=team, 3=highlights, 4=features

    // Boot sequence
    useEffect(() => {
        if (!open) { setBootLines([]); setBootDone(false); setSectionVisible(0); return; }
        let timers: ReturnType<typeof setTimeout>[] = [];
        BOOT_LINES.forEach((line, i) => {
            timers.push(setTimeout(() => {
                setBootLines(p => [...p, line]);
                if (i === BOOT_LINES.length - 1) {
                    timers.push(setTimeout(() => {
                        setBootDone(true);
                        // Stagger sections
                        [1, 2, 3, 4].forEach((s, j) => {
                            timers.push(setTimeout(() => setSectionVisible(s), (j + 1) * 200));
                        });
                    }, 300));
                }
            }, i * 120));
        });
        return () => timers.forEach(clearTimeout);
    }, [open]);

    // ESC to close
    const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
    useEffect(() => { if (open) { document.addEventListener("keydown", handleKeyDown); return () => document.removeEventListener("keydown", handleKeyDown); } }, [open, handleKeyDown]);

    // Lock scroll
    useEffect(() => { if (open) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; } }, [open]);

    const navigate = (href: string) => { onClose(); router.push(href); };

    const overlay = (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[9999] overflow-y-auto"
                    style={{ background: "#0a0a0a" }}
                >
                    <MatrixRain />

                    {/* Scanlines */}
                    <div className="fixed inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />

                    {/* CRT vignette */}
                    <div className="fixed inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)" }} />

                    <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 py-6">

                        {/* ── Header ── */}
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-[#3FB950]" />
                                <GlitchText className="text-xl font-bold text-[#E6EDF3]">ICPC USICT</GlitchText>
                                <span className="text-xs text-[#3FB950] font-mono animate-pulse">▊</span>
                            </div>
                            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center border border-[#30363D] hover:border-[#3FB950] hover:bg-[#3FB950]/10 transition-all text-[#8B949E] hover:text-[#3FB950]">
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>

                        {/* ── Boot Sequence ── */}
                        <div className="mb-5 space-y-0.5 font-mono">
                            {bootLines.map((line, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }} className="text-xs">
                                    <span className={line.includes("[OK]") || line.includes("online") ? "text-[#3FB950]" : "text-[#8B949E]"}>{line}</span>
                                </motion.div>
                            ))}
                            {bootLines.length > 0 && !bootDone && <span className="text-[#3FB950] text-xs animate-pulse">▊</span>}
                        </div>

                        {bootDone && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }} className="h-px bg-gradient-to-r from-transparent via-[#3FB950] to-transparent mb-6 origin-left" />}

                        {/* ═══════ SECTION 1: Club About ═══════ */}
                        {sectionVisible >= 1 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
                                <div className="text-xs font-mono text-[#3FB950] mb-2">
                                    <span className="text-[#8B949E]">$</span> cat /about/club.md
                                </div>
                                <div className="border border-[#21262D] bg-[#0D1117]/80 p-4">
                                    <h2 className="text-base font-bold text-[#E6EDF3] mb-2 flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-[#3FB950]" />
                                        CPC — The Competitive Programming Club
                                    </h2>
                                    <p className="text-xs text-[#8B949E] leading-relaxed">
                                        The <span className="text-[#E6EDF3] font-semibold">ICPC Club</span> at USICT promotes and nurtures the sport of competitive programming.
                                        We open opportunities for students to learn critical thinking skills and solve problems within unfairly short time limits.
                                        The club hosts various coding competitions to prepare for prestigious contests like{" "}
                                        <span className="text-[#58A6FF]">ACM-ICPC</span>,{" "}
                                        <span className="text-[#FF9F1C]">Google Code Jam</span>, and many more.
                                        It also provides a vibrant forum for the discussion of theory and applications of algorithms.
                                    </p>
                                </div>
                            </motion.section>
                        )}

                        {/* ═══════ SECTION 2: Leadership ═══════ */}
                        {sectionVisible >= 2 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
                                <div className="text-xs font-mono text-[#3FB950] mb-3">
                                    <span className="text-[#8B949E]">$</span> ls /team --leadership
                                </div>

                                {/* Lead & Vice Lead */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    {LEADERSHIP.map((person) => (
                                        <div key={person.name} className="border border-[#21262D] bg-[#0D1117]/80 p-4 flex items-center gap-4 group hover:border-[#30363D] transition-colors">
                                            <TeamAvatar src={person.avatar} initials={person.initials} gradient={person.gradient} />
                                            <div>
                                                <div className="text-[10px] font-mono text-[#3FB950] uppercase tracking-wider mb-0.5">{person.role}</div>
                                                <div className="text-sm font-bold text-[#E6EDF3]">{person.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coordinators */}
                                <div className="grid grid-cols-3 gap-2">
                                    {COORDINATORS.map((person) => (
                                        <div key={person.name} className="border border-[#21262D] bg-[#0D1117]/80 p-3 flex flex-col items-center gap-2 text-center">
                                            <TeamAvatar initials={person.initials} gradient={person.gradient} size="w-10 h-10" textSize="text-sm" />
                                            <div>
                                                <div className="text-[9px] font-mono text-[#C678DD] uppercase tracking-wider">Coordinator</div>
                                                <div className="text-xs font-semibold text-[#E6EDF3]">{person.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══════ SECTION 3: Club Highlights ═══════ */}
                        {sectionVisible >= 3 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
                                <div className="text-xs font-mono text-[#3FB950] mb-3">
                                    <span className="text-[#8B949E]">$</span> cat /club/highlights.log
                                </div>
                                <div className="border border-[#21262D] bg-[#0D1117]/80 p-4 space-y-2">
                                    {HIGHLIGHTS.map((h, i) => {
                                        const Icon = h.icon;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                className="flex items-center gap-3"
                                            >
                                                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: h.color }} />
                                                <span className="text-xs text-[#E6EDF3]">{h.text}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══════ SECTION 4: Platform Features ═══════ */}
                        {sectionVisible >= 4 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
                                <div className="text-xs font-mono text-[#3FB950] mb-3">
                                    <span className="text-[#8B949E]">$</span> ls /platform/modules --verbose
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {FEATURES.map((feature) => {
                                        const Icon = feature.icon;
                                        return (
                                            <motion.button
                                                key={feature.cmd}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => navigate(feature.href)}
                                                className="group text-left border border-[#21262D] bg-[#0D1117]/80 p-3 hover:border-[#30363D] transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                {/* Hover accent line */}
                                                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300" style={{ background: feature.color }} />

                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Icon className="w-3.5 h-3.5" style={{ color: feature.color }} />
                                                    <span className="text-xs font-bold text-[#E6EDF3]">{feature.title}</span>
                                                </div>
                                                <p className="text-[10px] text-[#8B949E] leading-relaxed">{feature.desc}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* ── Bottom Terminal ── */}
                        {sectionVisible >= 4 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-3 border border-[#21262D] bg-[#0D1117]/60 font-mono text-xs">
                                <div className="text-[#8B949E]">
                                    <span className="text-[#3FB950]">root@icpc-usict</span>
                                    <span className="text-[#8B949E]">:</span>
                                    <span className="text-[#58A6FF]">~</span>
                                    <span className="text-[#8B949E]">$ </span>
                                    <span className="text-[#E6EDF3]">status --all</span>
                                </div>
                                <div className="mt-1 text-[#3FB950]">
                                    ✓ 5 leaders &bull; 8 modules &bull; system.status: online &bull; uptime: ∞
                                </div>
                                <div className="mt-1 text-[#484F58]">[press ESC to close &bull; click any module to navigate]</div>
                                <span className="text-[#3FB950] animate-pulse">▊</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (typeof window === "undefined") return null;
    return createPortal(overlay, document.body);
}
