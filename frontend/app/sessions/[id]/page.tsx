"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionDetailSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession, invalidateSession } from "@/lib/hooks/useData";
import {
  registerForSession,
  getSessionStatus,
  SessionStatus,
} from "@/lib/sessionService";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  live: {
    label: "Live Now",
    className: "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse",
  },
  ended: {
    label: "Ended",
    className: "bg-gray-500/20 text-muted-foreground border-gray-500/30",
  },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "Date TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;

  const [registering, setRegistering] = useState(false);

  // Use SWR hook for session data
  const { session, isLoading, error } = useSession(sessionId);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to register for sessions");
      return;
    }

    setRegistering(true);
    try {
      await registerForSession(sessionId);
      // Invalidate cache to refresh data
      await invalidateSession(sessionId);
      toast.success("Successfully registered for session!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error("Error registering for session:", err);
      toast.error(error.response?.data?.error || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinMeeting = () => {
    if (session?.meetLink) {
      window.open(session.meetLink, "_blank", "noopener,noreferrer");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <SessionDetailSkeleton />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  Session not found
                </h2>
                <p className="text-muted-foreground mb-4">
                  The session you&apos;re looking for might not exist or you don&apos;t have permission to view it.
                </p>
                <Button variant="outline" onClick={() => router.push("/sessions")}>
                  Back to Sessions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  const status = getSessionStatus(session);
  const config = statusConfig[status];
  const isRegistered = user?.id && session.attendees?.includes(user.id);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/sessions")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sessions
            </Button>
          </div>

          {/* Session Content */}
          <Card className="bg-card border-border">
            <CardHeader className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
                >
                  {config.label}
                </span>
              </div>

              {/* Title */}
              <CardTitle className="text-3xl font-bold leading-tight text-card-foreground">
                {session.title}
              </CardTitle>

              {/* Date & Time Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
                {session.date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(session.date)}</span>
                  </div>
                )}
                {session.attendees && session.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{session.attendees.length} registered</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {session.details && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Details
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {session.details}
                  </p>
                </div>
              )}

              {/* Meet Link */}
              {session.meetLink && status !== "ended" && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Meeting Link
                  </h3>
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {session.meetLink}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border">
                {(status === "live" || status === "upcoming") && session.meetLink && (
                  <Button onClick={handleJoinMeeting} variant="outline" size="lg" className="gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                    <ExternalLink className="h-4 w-4" />
                    Join Meeting
                  </Button>
                )}

                {status === "upcoming" && (
                  <>
                    {isRegistered ? (
                      <Button variant="ghost" size="lg" className="gap-2 text-green-400 cursor-default" disabled>
                        <CheckCircle className="h-4 w-4" />
                        You&apos;re Registered
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        variant="outline"
                        size="lg"
                        disabled={registering}
                        className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                      >
                        {registering ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register for Session"
                        )}
                      </Button>
                    )}
                  </>
                )}

                {status === "ended" && (
                  <p className="text-muted-foreground">
                    This session has ended.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
