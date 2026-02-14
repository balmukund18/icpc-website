"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContestById, Contest, ContestResult } from "@/lib/contestService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trophy,
  Clock,
  Calendar,
  ExternalLink,
  Medal,
  ArrowLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";

export default function ContestDetailPage() {
  const params = useParams();
  const contestId = params.id as string;
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const data = await getContestById(contestId);
        setContest(data);
      } catch {
        console.error("Failed to fetch contest");
      } finally {
        setLoading(false);
      }
    };
    if (contestId) fetchContest();
  }, [contestId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contest) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Contest Not Found</h1>
          <Link href="/contests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contests
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.timer * 60 * 1000);
  const now = new Date();
  const isUpcoming = now < startTime;
  const isActive = now >= startTime && now <= endTime;
  const isEnded = now > endTime;
  const hasResults =
    Array.isArray(contest.results) && contest.results.length > 0;

  const statusLabel = isUpcoming ? "Upcoming" : isActive ? "Active" : "Ended";
  const statusColor = isActive
    ? "bg-green-500/20 text-green-400"
    : isUpcoming
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-gray-500/20 text-muted-foreground";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back link */}
        <Link
          href="/contests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contests
        </Link>

        {/* Contest Header */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <h1 className="text-2xl font-bold">{contest.title}</h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {startTime.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {startTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    Duration: {contest.timer} min
                  </span>
                </div>
              </div>

              {contest.hackerRankUrl && (
                <a
                  href={contest.hackerRankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className={
                      isActive
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                    variant={isActive ? "default" : "outline"}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isActive
                      ? "Join on HackerRank"
                      : "View on HackerRank"}
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Countdown for upcoming */}
        {isUpcoming && (
          <Card className="bg-card border-border mb-6">
            <CardContent className="py-8 text-center">
              <Clock className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">Contest Starts Soon</h2>
              <p className="text-muted-foreground">
                Starts on{" "}
                {startTime.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at{" "}
                {startTime.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {contest.hackerRankUrl && (
                <p className="text-sm text-muted-foreground mt-2">
                  The contest will be hosted on HackerRank. Click the button above
                  to register.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active contest info */}
        {isActive && (
          <Card className="bg-card border-green-800/50 mb-6">
            <CardContent className="py-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">
                  Live Now
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Contest is Active!</h2>
              <p className="text-muted-foreground mb-4">
                Head to HackerRank to participate in this contest.
              </p>
              {contest.hackerRankUrl && (
                <a
                  href={contest.hackerRankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Contest on HackerRank
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results for ended contests */}
        {isEnded && hasResults && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                        Score
                      </th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                        Solved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contest.results as ContestResult[]).map(
                      (result, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            {result.rank <= 3 ? (
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${result.rank === 1
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : result.rank === 2
                                    ? "bg-gray-300/20 text-muted-foreground"
                                    : "bg-orange-500/20 text-orange-400"
                                  }`}
                              >
                                {result.rank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground pl-2">
                                {result.rank}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {result.name}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {result.score ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {result.solved ?? "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ended without results */}
        {isEnded && !hasResults && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">Contest Has Ended</h2>
              <p className="text-muted-foreground">
                Results have not been posted yet. Check back later for the
                leaderboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
