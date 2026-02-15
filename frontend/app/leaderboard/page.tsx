"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Medal,
    Award,
    Search,
    Crown,
    Loader2,
    TrendingUp,
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

const periodOptions = [
    { value: "all", label: "All Time" },
    { value: "month", label: "This Month" },
];

const yearOptions = [
    { value: 0, label: "All Years" },
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
];

const handleLabels: Record<string, { label: string; url: (v: string) => string }> = {
    leetcode: { label: "LeetCode", url: (v) => v.startsWith("http") ? v : `https://leetcode.com/${v}` },
    codeforces: { label: "Codeforces", url: (v) => v.startsWith("http") ? v : `https://codeforces.com/profile/${v}` },
    codechef: { label: "CodeChef", url: (v) => v.startsWith("http") ? v : `https://www.codechef.com/users/${v}` },
    atcoder: { label: "AtCoder", url: (v) => v.startsWith("http") ? v : `https://atcoder.jp/users/${v}` },
    hackerrank: { label: "HackerRank", url: (v) => v.startsWith("http") ? v : `https://www.hackerrank.com/${v}` },
    github: { label: "GitHub", url: (v) => v.startsWith("http") ? v : `https://github.com/${v}` },
};

function PodiumCard({
    entry,
    rank,
    onClick,
}: {
    entry: LeaderboardEntry;
    rank: number;
    onClick: () => void;
}) {
    const config = {
        1: {
            bg: "bg-gradient-to-b from-purple-600/20 to-purple-900/10",
            border: "border-purple-500/30",
            ring: "ring-purple-500/20",
            icon: <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
            badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
            pointsColor: "text-purple-600 dark:text-purple-400",
            label: "1st",
            scale: "md:-mt-4",
        },
        2: {
            bg: "bg-gradient-to-b from-slate-500/15 to-slate-700/10",
            border: "border-slate-500/25",
            ring: "ring-slate-500/15",
            icon: <Medal className="h-5 w-5 text-slate-600 dark:text-slate-400" />,
            badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25",
            pointsColor: "text-slate-600 dark:text-slate-300",
            label: "2nd",
            scale: "",
        },
        3: {
            bg: "bg-gradient-to-b from-amber-600/15 to-amber-800/10",
            border: "border-amber-500/25",
            ring: "ring-amber-500/15",
            icon: <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
            badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25",
            pointsColor: "text-amber-600 dark:text-amber-400",
            label: "3rd",
            scale: "md:mt-2",
        },
    }[rank]!;

    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center cursor-pointer group flex-1 min-w-0 max-w-[10rem] ${rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"} ${config.scale}`}
        >
            <div
                className={`w-full p-3 sm:p-4 rounded-xl ${config.bg} border ${config.border} ring-1 ${config.ring} backdrop-blur-sm text-center transition-all group-hover:scale-[1.03] group-hover:shadow-lg`}
            >
                <div className="flex justify-center mb-2">{config.icon}</div>
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
                    {entry.name || entry.email?.split("@")[0]}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
                    {entry.branch || "—"} · Year {entry.year || "—"}
                </p>
                <p className={`text-base sm:text-lg font-bold mt-2 ${config.pointsColor}`}>
                    {entry.points} <span className="text-xs font-normal">pts</span>
                </p>
                <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.badge}`}
                >
                    {config.label}
                </span>
            </div>
        </button>
    );
}

function DetailPanel({
    entry,
    onClose,
}: {
    entry: LeaderboardEntry;
    onClose: () => void;
}) {
    const handles = entry.handles as Record<string, string> | null;
    const hasHandles = handles && Object.values(handles).some((v) => v);
    const isAlumni = entry.role === "ALUMNI";

    return (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="py-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">
                                {(entry.name || entry.email)?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                                {entry.name || "No Name"}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                                {entry.email}
                            </p>
                            {entry.role && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    {entry.role}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Rank</p>
                        <p className="font-bold text-lg">#{entry.position}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Points</p>
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">{entry.points}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Branch</p>
                        <p className="font-semibold text-sm">{entry.branch || "—"}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Year</p>
                        <p className="font-semibold text-sm">{entry.year || "—"}</p>
                    </div>
                </div>

                {/* Contact */}
                {entry.contact && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Contact</p>
                        <p className="text-sm">{entry.contact}</p>
                    </div>
                )}

                {/* Competitive programming handles */}
                {hasHandles && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Profiles</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(handles!).map(([key, val]) => {
                                if (!val) return null;
                                const info = handleLabels[key];
                                if (!info) return null;
                                return (
                                    <a
                                        key={key}
                                        href={info.url(val)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors border border-border/40"
                                    >
                                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium">{info.label}</span>
                                        <span className="text-muted-foreground">· {val}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Alumni section */}
                {isAlumni && (entry.company || entry.jobPosition || entry.graduationYear || entry.linkedIn || entry.bio || entry.location) && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Alumni Info</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {entry.company && (
                                <div className="bg-muted/30 rounded-lg px-3 py-2">
                                    <p className="text-[11px] text-muted-foreground">Company</p>
                                    <p className="text-sm font-medium">{entry.company}</p>
                                </div>
                            )}
                            {entry.jobPosition && (
                                <div className="bg-muted/30 rounded-lg px-3 py-2">
                                    <p className="text-[11px] text-muted-foreground">Position</p>
                                    <p className="text-sm font-medium">{entry.jobPosition}</p>
                                </div>
                            )}
                            {entry.graduationYear && (
                                <div className="bg-muted/30 rounded-lg px-3 py-2">
                                    <p className="text-[11px] text-muted-foreground">Graduation Year</p>
                                    <p className="text-sm font-medium">{entry.graduationYear}</p>
                                </div>
                            )}
                            {entry.location && (
                                <div className="bg-muted/30 rounded-lg px-3 py-2">
                                    <p className="text-[11px] text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium">{entry.location}</p>
                                </div>
                            )}
                        </div>
                        {entry.bio && (
                            <p className="text-sm text-muted-foreground mt-2">{entry.bio}</p>
                        )}
                        {entry.linkedIn && (
                            <a
                                href={entry.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-400 hover:underline"
                            >
                                <ExternalLink className="h-3 w-3" /> LinkedIn
                            </a>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("all");
    const [search, setSearch] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [yearFilter, setYearFilter] = useState(0);
    const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(
        null
    );

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const res = await api.get(
                    `/gamification/leaderboard?period=${period}`
                );
                setEntries(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [period]);

    const filtered = useMemo(() => {
        let result = entries;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (e) =>
                    e.name?.toLowerCase().includes(q) ||
                    e.email?.toLowerCase().includes(q)
            );
        }
        if (branchFilter) {
            result = result.filter((e) => e.branch === branchFilter);
        }
        if (yearFilter > 0) {
            result = result.filter((e) => e.year === yearFilter);
        }
        return result.map((e, i) => ({ ...e, position: i + 1 }));
    }, [entries, search, branchFilter, yearFilter]);

    const top3 = filtered.slice(0, 3);
    const showPodium = !search && !branchFilter && yearFilter === 0;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Leaderboard</h1>
                            <p className="text-xs text-muted-foreground">
                                Top performers ranked by verified submission points
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                        {periodOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                variant={period === opt.value ? "default" : "ghost"}
                                size="sm"
                                className={`text-xs h-8 ${period === opt.value ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : ""}`}
                                onClick={() => setPeriod(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Branches</option>
                        {BRANCH_OPTIONS.map((b) => (
                            <option key={b.value} value={b.value}>
                                {b.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(Number(e.target.value))}
                        className="h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {yearOptions.map((y) => (
                            <option key={y.value} value={y.value}>
                                {y.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected User Detail Panel */}
                {selectedUser && (
                    <DetailPanel
                        entry={selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-12 text-center">
                            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                            <p className="text-muted-foreground">
                                No leaderboard data available
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {search || branchFilter || yearFilter > 0
                                    ? "Try adjusting your filters"
                                    : "Complete tasks to earn points and appear here!"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Podium — only when no filters are active */}
                        {top3.length > 0 && showPodium && (
                            <div className="flex items-end justify-center gap-2 sm:gap-3 py-2 px-2">
                                {top3.map((entry, i) => (
                                    <PodiumCard
                                        key={entry.userId}
                                        entry={entry}
                                        rank={i + 1}
                                        onClick={() => setSelectedUser(entry)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Full Table */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Rankings
                                    <span className="text-xs font-normal text-muted-foreground">
                                        ({filtered.length} member
                                        {filtered.length !== 1 ? "s" : ""})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 text-muted-foreground text-xs">
                                                <th className="text-left py-2.5 px-4 w-14">#</th>
                                                <th className="text-left py-2.5 px-4">Name</th>
                                                <th className="text-left py-2.5 px-4">Email</th>
                                                <th className="text-left py-2.5 px-4">Branch</th>
                                                <th className="text-center py-2.5 px-4">Year</th>
                                                <th className="text-right py-2.5 px-4">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((entry) => (
                                                <tr
                                                    key={entry.userId}
                                                    onClick={() => setSelectedUser(entry)}
                                                    className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${entry.position <= 3
                                                        ? "bg-purple-500/[0.03]"
                                                        : ""
                                                        } ${selectedUser?.userId === entry.userId
                                                            ? "bg-purple-500/10"
                                                            : ""
                                                        }`}
                                                >
                                                    <td className="py-2.5 px-4">
                                                        <span
                                                            className={`font-mono font-bold text-xs ${entry.position === 1
                                                                ? "text-purple-600 dark:text-purple-400"
                                                                : entry.position === 2
                                                                    ? "text-slate-600 dark:text-slate-300"
                                                                    : entry.position === 3
                                                                        ? "text-amber-600 dark:text-amber-400"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {entry.position}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-4 font-medium">
                                                        {entry.name || "—"}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-muted-foreground">
                                                        {entry.email}
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                        {entry.branch ? (
                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                                {entry.branch}
                                                            </span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        {entry.year || "—"}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right">
                                                        <span className="font-bold text-green-600 dark:text-green-400">
                                                            {entry.points}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile */}
                                <div className="md:hidden divide-y divide-border/30">
                                    {filtered.map((entry) => (
                                        <div
                                            key={entry.userId}
                                            onClick={() => setSelectedUser(entry)}
                                            className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${entry.position <= 3 ? "bg-purple-500/[0.03]" : ""
                                                } ${selectedUser?.userId === entry.userId
                                                    ? "bg-purple-500/10"
                                                    : ""
                                                }`}
                                        >
                                            <span
                                                className={`font-mono font-bold w-7 text-center text-xs ${entry.position === 1
                                                    ? "text-purple-600 dark:text-purple-400"
                                                    : entry.position === 2
                                                        ? "text-slate-600 dark:text-slate-300"
                                                        : entry.position === 3
                                                            ? "text-amber-600 dark:text-amber-400"
                                                            : "text-muted-foreground"
                                                    }`}
                                            >
                                                {entry.position}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {entry.name || entry.email?.split("@")[0]}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {entry.branch || "—"} · Year {entry.year || "—"}
                                                </p>
                                            </div>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-sm flex-shrink-0">
                                                {entry.points} pts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
