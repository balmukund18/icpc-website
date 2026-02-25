"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Loader2,
    X,
    ExternalLink,
} from "lucide-react";
import api from "@/lib/axios";
import { BRANCH_OPTIONS } from "@/lib/profileService";

interface LeaderboardEntry {
    position: number;
    userId: string;
    email: string;
    name: string | null;
    branch: string | null;
    year: number | null;
    points: number;
    role: string | null;
    contact: string | null;
    handles: Record<string, string> | null;
    graduationYear: number | null;
    company: string | null;
    jobPosition: string | null;
    location: string | null;
    bio: string | null;
    linkedIn: string | null;
}

/* ── Rank tier system ── */
function getRankTier(points: number) {
    if (points >= 500) return { name: "Master", color: "#F85149" };
    if (points >= 300) return { name: "Expert", color: "#C678DD" };
    if (points >= 100) return { name: "Specialist", color: "#58A6FF" };
    return { name: "Newbie", color: "#8B949E" };
}

const periodOptions = [
    { value: "all", label: "all-time" },
    { value: "month", label: "this-month" },
];

const yearOptions = [
    { value: 0, label: "all" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
];

const handleLabels: Record<string, { label: string; url: (v: string) => string }> = {
    leetcode: { label: "LeetCode", url: (v) => v.startsWith("http") ? v : `https://leetcode.com/${v}` },
    codeforces: { label: "Codeforces", url: (v) => v.startsWith("http") ? v : `https://codeforces.com/profile/${v}` },
    codechef: { label: "CodeChef", url: (v) => v.startsWith("http") ? v : `https://www.codechef.com/users/${v}` },
    atcoder: { label: "AtCoder", url: (v) => v.startsWith("http") ? v : `https://atcoder.jp/users/${v}` },
    hackerrank: { label: "HackerRank", url: (v) => v.startsWith("http") ? v : `https://www.hackerrank.com/${v}` },
    github: { label: "GitHub", url: (v) => v.startsWith("http") ? v : `https://github.com/${v}` },
};

function DetailPanel({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
    const handles = entry.handles as Record<string, string> | null;
    const hasHandles = handles && Object.values(handles).some((v) => v);
    const isAlumni = entry.role === "ALUMNI";
    const tier = getRankTier(entry.points);

    return (
        <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
        >
            <div className="py-4 border border-border p-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-foreground">
                                {entry.name?.replace(/\s+/g, "_") || "—"}
                            </p>
                            <span className="text-xs px-1.5 py-0.5 border font-semibold" style={{ color: tier.color, borderColor: tier.color + "40" }}>
                                {tier.name}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.email}</p>
                        {entry.role && (
                            <span className="text-xs text-[#58A6FF]">{entry.role.toLowerCase()}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                    <div><span className="text-muted-foreground">rank: </span><span className="text-foreground font-semibold">#{entry.position}</span></div>
                    <div><span className="text-muted-foreground">points: </span><span className="text-[#3FB950] font-semibold">{entry.points}</span></div>
                    <div><span className="text-muted-foreground">branch: </span><span className="text-foreground">{entry.branch || "—"}</span></div>
                    <div><span className="text-muted-foreground">year: </span><span className="text-foreground">{entry.year || "—"}</span></div>
                </div>

                {entry.contact && (
                    <p className="text-sm mb-2"><span className="text-muted-foreground">contact: </span><span className="text-foreground">{entry.contact}</span></p>
                )}

                {hasHandles && (
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">profiles:</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(handles!).map(([key, val]) => {
                                if (!val) return null;
                                const info = handleLabels[key];
                                if (!info) return null;
                                return (
                                    <a key={key} href={info.url(val)} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-[#58A6FF] hover:underline inline-flex items-center gap-1">
                                        <ExternalLink className="h-3 w-3" /> {info.label}: {val}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isAlumni && (entry.company || entry.jobPosition || entry.graduationYear || entry.location) && (
                    <div className="text-sm space-y-1">
                        {entry.company && <p><span className="text-muted-foreground">company: </span>{entry.company}</p>}
                        {entry.jobPosition && <p><span className="text-muted-foreground">position: </span>{entry.jobPosition}</p>}
                        {entry.graduationYear && <p><span className="text-muted-foreground">graduation: </span>{entry.graduationYear}</p>}
                        {entry.location && <p><span className="text-muted-foreground">location: </span>{entry.location}</p>}
                        {entry.bio && <p className="text-muted-foreground mt-1">{entry.bio}</p>}
                        {entry.linkedIn && (
                            <a href={entry.linkedIn} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-[#58A6FF] hover:underline inline-flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> LinkedIn
                            </a>
                        )}
                    </div>
                )}
            </div>
        </motion.section>
    );
}

export default function LeaderboardPage() {
    const currentUser = useAuthStore((state) => state.user);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("all");
    const [search, setSearch] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [yearFilter, setYearFilter] = useState(0);
    const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const [timeSince, setTimeSince] = useState("");

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/gamification/leaderboard?period=${period}`);
            setEntries(res.data.data || []);
            setLastFetched(new Date());
        } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch + period change
    useEffect(() => { fetchLeaderboard(); }, [period]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => { fetchLeaderboard(); }, 30000);
        return () => clearInterval(interval);
    }, [period]);

    // Update "last updated ago" timer
    useEffect(() => {
        const tick = setInterval(() => {
            if (lastFetched) {
                const diff = Math.round((Date.now() - lastFetched.getTime()) / 1000);
                setTimeSince(diff < 5 ? "just now" : `${diff}s ago`);
            }
        }, 1000);
        return () => clearInterval(tick);
    }, [lastFetched]);

    const filtered = useMemo(() => {
        let result = entries;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((e) => e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q));
        }
        if (branchFilter) result = result.filter((e) => e.branch === branchFilter);
        if (yearFilter > 0) result = result.filter((e) => e.year === yearFilter);
        return result.map((e, i) => ({ ...e, position: i + 1 }));
    }, [entries, search, branchFilter, yearFilter]);

    const rankColor = (pos: number) => {
        if (pos === 1) return "text-[#FF4D4F]";
        if (pos === 2) return "text-[#FF9F1C]";
        if (pos === 3) return "text-[#3FB950]";
        if (pos === 4) return "text-[#58A6FF]";
        if (pos === 5) return "text-[#C678DD]";
        return "text-muted-foreground";
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

                {/* Header */}
                <section className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                            &gt; <span className="font-bold">leaderboard</span>{" "}
                            <span className="font-normal text-muted-foreground">-{period === "all" ? "all-time" : "this-month"}</span>
                        </h1>
                        {/* Last updated indicator */}
                        <div className="flex items-center gap-2 text-xs text-[#484F58]">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse" />
                            <span>last_updated: {timeSince || "..."}</span>
                        </div>
                    </div>
                </section>

                {/* Search */}
                <section className="py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-9 bg-card border-border"
                        />
                    </div>
                </section>

                {/* Filters */}
                <section className="py-3 flex flex-wrap gap-2">
                    {periodOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1 text-sm border transition-colors ${period === opt.value
                                ? "border-foreground text-foreground"
                                : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            [ {opt.label} ]
                        </button>
                    ))}
                    <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
                        className="h-8 px-3 text-sm border border-border bg-background text-foreground rounded-sm focus:outline-none">
                        <option value="">[ branch: all ]</option>
                        {BRANCH_OPTIONS.map((b) => (<option key={b.value} value={b.value}>[ branch: {b.value} ]</option>))}
                    </select>
                    <select value={yearFilter} onChange={(e) => setYearFilter(Number(e.target.value))}
                        className="h-8 px-3 text-sm border border-border bg-background text-foreground rounded-sm focus:outline-none">
                        {yearOptions.map((y) => (<option key={y.value} value={y.value}>[ year: {y.label} ]</option>))}
                    </select>
                </section>

                <hr className="border-border" />

                {/* Selected User Detail */}
                <AnimatePresence>
                    {selectedUser && (
                        <>
                            <DetailPanel entry={selectedUser} onClose={() => setSelectedUser(null)} />
                            <hr className="border-border" />
                        </>
                    )}
                </AnimatePresence>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <section className="py-8 text-center">
                        <p className="text-muted-foreground text-sm">&gt; no leaderboard data available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {search || branchFilter || yearFilter > 0 ? "try adjusting your filters" : "complete tasks to earn points"}
                        </p>
                    </section>
                ) : (
                    <section className="py-4">
                        {/* Table header */}
                        <div className="grid grid-cols-[2.5rem_1fr_3rem_4.5rem] sm:grid-cols-[3.5rem_1fr_auto_3rem_5.5rem] gap-2 text-xs text-muted-foreground py-2 px-3 border-b border-border">
                            <span className="pl-1">#</span>
                            <span>user</span>
                            <span className="w-16 text-center hidden sm:block">tier</span>
                            <span className="text-center hidden sm:block">year</span>
                            <span className="text-right pr-2">rating</span>
                        </div>

                        {/* Table rows */}
                        {filtered.map((entry, i) => {
                            const isMe = entry.userId === currentUser?.id;
                            const tier = getRankTier(entry.points);
                            return (
                                <motion.div
                                    key={entry.userId}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.25 }}
                                    onClick={() => setSelectedUser(entry)}
                                    className={`grid grid-cols-[2.5rem_1fr_3rem_4.5rem] sm:grid-cols-[3.5rem_1fr_auto_3rem_5.5rem] gap-2 text-sm py-2.5 px-3 border-b border-border/50 cursor-pointer transition-colors ${isMe
                                        ? "bg-[#58A6FF]/8 border-l-2 border-l-[#58A6FF] hover:bg-[#58A6FF]/12"
                                        : selectedUser?.userId === entry.userId
                                            ? "bg-muted/20"
                                            : "hover:bg-muted/30"
                                        }`}
                                >
                                    <span className={`font-bold pl-1 ${rankColor(entry.position)}`}>
                                        #{entry.position}
                                    </span>
                                    <span className={`font-medium truncate ${isMe ? "text-[#58A6FF]" : "text-foreground"}`}>
                                        {isMe && <span className="text-[#3FB950] mr-1">›</span>}
                                        {entry.name?.replace(/\s+/g, "_") || entry.email?.split("@")[0]}
                                    </span>
                                    <span
                                        className="w-16 text-center hidden sm:inline-block text-[10px] border px-1 py-0.5"
                                        style={{ color: tier.color, borderColor: tier.color + "30" }}
                                    >
                                        {tier.name}
                                    </span>
                                    <span className="text-center text-muted-foreground hidden sm:block">{entry.year || "—"}</span>
                                    <span className="text-right pr-2 text-[#3FB950] font-semibold">{entry.points}</span>
                                </motion.div>
                            );
                        })}
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
