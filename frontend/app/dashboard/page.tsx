"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { useDashboard } from "@/lib/hooks/useData";
import { getTaskStatus } from "@/lib/taskService";
import { getSessionStatus } from "@/lib/sessionService";
import {
  Calendar,
  Trophy,
  User as UserIcon,
  Code,
  ExternalLink,
  CheckSquare,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasProfile = useAuthStore((state) => state.hasProfile);

  // Use SWR hook for all dashboard data
  const {
    profile,
    contests,
    submissions,
    sessions,
    announcements,
    tasks,
    userPoints,
    leaderboard,
    isLoading,
  } = useDashboard();

  // Don't fetch if not authenticated or no profile
  const shouldShowSkeleton = isLoading && isAuthenticated && hasProfile === true;

  if (shouldShowSkeleton) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (!user) return null;

  // Find next upcoming or live session
  const nextSession = sessions
    .filter((s) => {
      const status = getSessionStatus(s);
      return status === "upcoming" || status === "live";
    })
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })[0] || null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Welcome back, {profile?.name || user.email}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your competitive programming journey.
          </p>
        </div>

        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Megaphone className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-yellow-500 text-sm uppercase tracking-wide">
                  {announcements[0].pinned ? "Pinned" : "Latest"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {announcements[0].title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {announcements[0].content}
                </p>
              </div>
              <Link href="/announcements" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-1 border-yellow-500/30 hover:bg-yellow-500/10">
                  View All ({announcements.length})
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Submissions
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {submissions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime submissions
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Active Contests
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {contests.length}
              </div>
              <p className="text-xs text-muted-foreground">Available to join</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Profile Status
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary capitalize">
                {user.role.toLowerCase()}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.branch
                  ? `${profile.branch} - ${profile.year}`
                  : "Update profile"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Next Session
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextSession ? (
                (() => {
                  const status = getSessionStatus(nextSession);
                  const isLive = status === "live";
                  const formatSessionDate = (date: string | null) => {
                    if (!date) return "TBA";
                    return new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  };
                  const formatSessionTime = (date: string | null) => {
                    if (!date) return "";
                    return new Date(date).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  };
                  return (
                    <>
                      <div
                        className={`text-2xl font-bold ${
                          isLive ? "text-green-500" : "text-primary"
                        }`}
                      >
                        {isLive ? "Live Now!" : formatSessionDate(nextSession.date)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {nextSession.title}
                        {!isLive && nextSession.date && ` - ${formatSessionTime(nextSession.date)}`}
                      </p>
                      {isLive ? (
                        <Button
                          size="sm"
                          className="mt-2 gap-1"
                          onClick={() =>
                            window.open(nextSession.meetLink, "_blank", "noopener,noreferrer")
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                          Join
                        </Button>
                      ) : (
                        <Link href="/sessions">
                          <Button size="sm" variant="outline" className="mt-2">
                            View
                          </Button>
                        </Link>
                      )}
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">TBA</div>
                  <p className="text-xs text-muted-foreground">
                    No upcoming sessions
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tasks & Points Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* My Tasks Widget */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  My Tasks
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete tasks to earn points
                </CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {(() => {
                const pendingCount = tasks.filter((t) =>
                  t.userSubmissions?.some((s) => s.status === "PENDING")
                ).length;
                const completedCount = tasks.filter((t) =>
                  t.userSubmissions?.some((s) => s.status === "VERIFIED")
                ).length;
                const availableCount = tasks.filter((t) => {
                  const status = getTaskStatus(t);
                  return status.canSubmit && !t.userSubmissions?.length;
                }).length;
                
                // Get recent available tasks
                const recentTasks = tasks
                  .filter((t) => {
                    const status = getTaskStatus(t);
                    return status.canSubmit;
                  })
                  .slice(0, 3);

                return (
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">
                          {availableCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="text-2xl font-bold text-yellow-400">
                          {pendingCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">
                          {completedCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>

                    {/* Recent Tasks */}
                    {recentTasks.length > 0 ? (
                      <div className="space-y-2">
                        {recentTasks.map((task) => {
                          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
                            >
                              <div className="space-y-1 flex-1 min-w-0">
                                <p className="font-medium leading-none text-foreground truncate">
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-purple-400">
                                    {task.points} pts
                                  </span>
                                  {isOverdue && (
                                    <span className="text-xs text-red-400">Overdue</span>
                                  )}
                                </div>
                              </div>
                              <Link href="/tasks">
                                <Button variant="secondary" size="sm">
                                  Submit
                                </Button>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No tasks available at the moment.
                      </p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Points & Leaderboard Widget */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                Points & Rank
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your standing in the leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User's Points */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-400">
                    {userPoints} pts
                  </div>
                  <p className="text-sm text-muted-foreground">Your total points</p>
                </div>

                {/* Mini Leaderboard - Top 3 */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Top Performers
                  </p>
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No leaderboard data yet
                    </p>
                  ) : (
                    leaderboard.slice(0, 3).map((entry, idx) => {
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-3 p-2 rounded-lg ${
                            isCurrentUser
                              ? "bg-purple-500/10 border border-purple-500/30"
                              : "bg-background/50"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0
                                ? "bg-yellow-500/20 text-yellow-400"
                                : idx === 1
                                ? "bg-gray-400/20 text-gray-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.name || entry.email?.split("@")[0]}
                              {isCurrentUser && (
                                <span className="text-purple-400 ml-1">(You)</span>
                              )}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-purple-400">
                            {entry.points}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* User's Rank if not in top 3 */}
                {leaderboard.length > 0 &&
                  !leaderboard.slice(0, 3).some((e) => e.userId === user?.id) && (
                    <div className="pt-2 border-t border-border">
                      {(() => {
                        const userEntry = leaderboard.find(
                          (e) => e.userId === user?.id
                        );
                        if (!userEntry) return null;
                        return (
                          <div className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-purple-500/20 text-purple-400">
                              {userEntry.position}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                You
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-purple-400">
                              {userEntry.points}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Contests */}
          <Card className="col-span-4 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Recent Contests
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Join upcoming contests or view results of past ones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contests.length === 0 ? (
                  <p className="text-muted-foreground">
                    No contests available.
                  </p>
                ) : (
                  contests.slice(0, 5).map((contest) => (
                    <div
                      key={contest.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none text-foreground">
                          {contest.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contest.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/contests/${contest.id}`}>
                        <Button variant="secondary" size="sm">
                          Enter
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="col-span-3 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Recent Submissions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest problem solving activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground">No submissions yet.</p>
                ) : (
                  submissions.slice(0, 5).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none text-foreground">
                          Problem {sub.problemIdx}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          sub.status === "Accepted"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {sub.status || "Pending"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
