"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionsPageSkeleton } from "@/components/ui/skeletons";
import { useSessions, invalidateSessions } from "@/lib/hooks/useData";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  registerForSession,
  getSessionStatus,
} from "@/lib/sessionService";
import type { Session } from "@/lib/hooks/useData";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatDate(dateString: string | null): string {
  if (!dateString) return "TBA";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }) + " IST";
}

const cardVariants = {
  hidden: { opacity: 0, x: -16 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function SessionsPage() {
  const [registering, setRegistering] = useState<string | null>(null);
  const [joinAnimating, setJoinAnimating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;
  const { sessions, isLoading, error } = useSessions();

  const handleRegister = async (sessionId: string) => {
    if (!isAuthenticated) { toast.error("Please log in to register for sessions"); return; }
    setRegistering(sessionId);
    try {
      await registerForSession(sessionId);
      await invalidateSessions();
      toast.success("Successfully registered for session!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to register");
    } finally { setRegistering(null); }
  };

  const handleJoin = (meetLink: string, sessionId: string) => {
    setJoinAnimating(sessionId);
    setTimeout(() => {
      window.open(meetLink, "_blank", "noopener,noreferrer");
      setJoinAnimating(null);
    }, 300);
  };

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingSessions = filtered
    .filter((s) => { const st = getSessionStatus(s); return st === "upcoming" || st === "live"; })
    .sort((a, b) => { if (!a.date) return 1; if (!b.date) return -1; return new Date(a.date).getTime() - new Date(b.date).getTime(); });

  const pastSessions = filtered
    .filter((s) => getSessionStatus(s) === "ended")
    .sort((a, b) => { if (!a.date) return 1; if (!b.date) return -1; return new Date(b.date).getTime() - new Date(a.date).getTime(); });

  if (isLoading) {
    return (<DashboardLayout><SessionsPageSkeleton /></DashboardLayout>);
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">sessions</span>{" "}
            <span className="font-normal text-muted-foreground">--events</span>
          </h1>
        </section>

        {/* Search */}
        <section className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="search sessions: _" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-9 bg-card border-border" />
          </div>
        </section>

        <hr className="border-border" />

        {error && (
          <div className="text-sm text-[#F85149] border border-[#F85149]/30 p-3 my-4">
            &gt; error: failed to load sessions
          </div>
        )}

        {sessions.length === 0 && !error && (
          <section className="py-8 text-center">
            <p className="text-muted-foreground text-sm">&gt; no sessions available</p>
          </section>
        )}

        {/* Upcoming / Live */}
        {upcomingSessions.map((session, i) => {
          const status = getSessionStatus(session);
          const isLive = status === "live";
          const isRegistered = user?.id && session.attendees?.includes(user.id);
          const isRegistering = registering === session.id;
          const isJoinAnimating = joinAnimating === session.id;

          return (
            <motion.section
              key={session.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className={`py-4 my-2 border p-4 transition-colors ${isLive ? "border-[#3FB950]/40" : "border-border"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/sessions/${session.id}`} className="hover:underline">
                  <span className="text-[#58A6FF]">[{session.id.slice(0, 4)}]</span>{" "}
                  <span className="font-semibold text-foreground">{session.title}</span>
                </Link>
                <span className={`text-xs inline-flex items-center gap-1.5 ${isLive ? "text-[#3FB950]" : "text-muted-foreground"}`}>
                  {isLive && <span className="inline-block w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />}
                  status: {isLive ? "live" : "upcoming"}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {session.details && <p><span className="text-muted-foreground">details: </span><span className="text-foreground">{session.details}</span></p>}
                <p><span className="text-muted-foreground">date: </span><span className="text-foreground">{formatDate(session.date)}</span></p>
                {session.date && <p><span className="text-muted-foreground">time: </span><span className="text-foreground">{formatTime(session.date)}</span></p>}
                {session.attendees && session.attendees.length > 0 && (
                  <p><span className="text-muted-foreground">registered: </span><span className="text-foreground">{session.attendees.length}</span></p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {(isLive || status === "upcoming") && session.meetLink && (
                  <motion.button
                    onClick={() => handleJoin(session.meetLink, session.id)}
                    animate={isJoinAnimating ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="text-xs border border-[#58A6FF] text-[#58A6FF] px-4 py-1.5 hover:bg-[#58A6FF]/10 transition-colors"
                  >
                    [ JOIN ]
                  </motion.button>
                )}
                {status === "upcoming" && !isRegistered && (
                  <button onClick={() => handleRegister(session.id)} disabled={isRegistering}
                    className="text-xs border border-border text-foreground px-4 py-1.5 hover:bg-muted transition-colors disabled:opacity-50">
                    {isRegistering ? "registering..." : "REGISTER"}
                  </button>
                )}
                {isRegistered && <span className="text-xs text-[#3FB950]">✓ registered</span>}
              </div>
            </motion.section>
          );
        })}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <>
            <hr className="border-border" />
            <section className="py-4">
              <p className="text-sm font-semibold text-foreground mb-3">&gt; past sessions</p>
              {pastSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.2 }}
                  className="flex items-center gap-3 text-sm py-2 border-b border-border/50"
                >
                  <span className="text-muted-foreground">—</span>
                  <Link href={`/sessions/${session.id}`} className="text-foreground hover:underline flex-1">{session.title}</Link>
                  <span className="text-muted-foreground text-xs">{formatDate(session.date)}</span>
                </motion.div>
              ))}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
