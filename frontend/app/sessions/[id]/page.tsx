"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionDetailSkeleton } from "@/components/ui/skeletons";
import { useSession, invalidateSession } from "@/lib/hooks/useData";
import { registerForSession, getSessionStatus } from "@/lib/sessionService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatDate(dateString: string | null): string {
  if (!dateString) return "TBA";
  return new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) + " IST";
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;
  const [registering, setRegistering] = useState(false);
  const { session, isLoading, error } = useSession(sessionId);

  const handleRegister = async () => {
    if (!isAuthenticated) { toast.error("Please log in to register"); return; }
    setRegistering(true);
    try {
      await registerForSession(sessionId);
      await invalidateSession(sessionId);
      toast.success("Successfully registered!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to register");
    } finally { setRegistering(false); }
  };

  if (isLoading) return (<DashboardLayout><SessionDetailSkeleton /></DashboardLayout>);

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-sm text-[#FF4D4F] border border-[#FF4D4F]/30 p-4">
            <p>&gt; error: session not found</p>
            <button onClick={() => router.push("/sessions")} className="text-xs underline mt-2 text-muted-foreground">← back to sessions</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = getSessionStatus(session);
  const isRegistered = user?.id && session.attendees?.includes(user.id);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Back */}
        <section className="py-2">
          <button onClick={() => router.push("/sessions")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← back to sessions</button>
        </section>

        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">session</span>{" "}
            <span className="font-normal text-muted-foreground">--detail</span>
          </h1>
        </section>

        <hr className="border-border" />

        {/* Session info */}
        <section className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-foreground">{session.title}</p>
            <span className={`text-xs ${status === "live" ? "text-[#3FB950]" : status === "upcoming" ? "text-[#58A6FF]" : "text-muted-foreground"}`}>
              status: {status}{status === "live" && <span className="ml-1.5 inline-block w-2 h-2 bg-[#3FB950] rounded-full animate-pulse" />}
            </span>
          </div>

          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">date: </span><span className="text-foreground">{formatDate(session.date)}</span></p>
            {session.date && <p><span className="text-muted-foreground">time: </span><span className="text-foreground">{formatTime(session.date)}</span></p>}
            {session.attendees && session.attendees.length > 0 && (
              <p><span className="text-muted-foreground">registered: </span><span className="text-foreground">{session.attendees.length} attendees</span></p>
            )}
            {session.meetLink && status !== "ended" && (
              <p><span className="text-muted-foreground">link: </span><a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">{session.meetLink}</a></p>
            )}
          </div>
        </section>

        {/* Details */}
        {session.details && (
          <>
            <hr className="border-border" />
            <section className="py-4">
              <p className="text-sm font-semibold text-foreground mb-2">&gt; details</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.details}</p>
            </section>
          </>
        )}

        {/* Summary (for ended) */}
        {session.summary && (
          <>
            <hr className="border-border" />
            <section className="py-4">
              <p className="text-sm font-semibold text-foreground mb-2">&gt; summary</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.summary}</p>
            </section>
          </>
        )}

        {/* Actions */}
        <hr className="border-border" />
        <section className="py-4 flex flex-wrap gap-3">
          {(status === "live" || status === "upcoming") && session.meetLink && (
            <button
              onClick={() => window.open(session.meetLink, "_blank", "noopener,noreferrer")}
              className="text-xs border border-[#58A6FF] text-[#58A6FF] px-4 py-2 hover:bg-[#58A6FF]/10 transition-colors"
            >
              [ JOIN MEETING ]
            </button>
          )}
          {status === "upcoming" && !isRegistered && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="text-xs border border-foreground text-foreground px-4 py-2 hover:bg-muted transition-colors disabled:opacity-50"
            >
              {registering ? "registering..." : "[ REGISTER ]"}
            </button>
          )}
          {isRegistered && <span className="text-xs text-[#3FB950] self-center">✓ registered</span>}
          {status === "ended" && <p className="text-sm text-muted-foreground">this session has ended.</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}
