"use client";

import { useEffect, useState } from "react";
import { getContests, Contest } from "@/lib/contestService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Clock, Calendar, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await getContests();
        setContests(data);
      } catch {
        console.error("Failed to fetch contests");
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(startTime.getTime() + contest.timer * 60 * 1000);

    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "upcoming":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ended":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Contests</h1>
            <p className="text-muted-foreground">
              Competitive programming contests hosted on HackerRank
            </p>
          </div>
        </div>

        {contests.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No contests available yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Check back later for upcoming contests
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contests.map((contest) => {
              const status = getContestStatus(contest);
              const startTime = new Date(contest.startTime);
              const hasResults = Array.isArray(contest.results) && contest.results.length > 0;

              return (
                <Card
                  key={contest.id}
                  className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold truncate">
                            {contest.title}
                          </h2>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          {hasResults && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Results Posted
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {startTime.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {" at "}
                            {startTime.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {contest.timer} min
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {contest.hackerRankUrl && status !== "ended" && (
                          <a
                            href={contest.hackerRankUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant={status === "active" ? "default" : "outline"}
                              className={
                                status === "active"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {status === "active"
                                ? "Join on HackerRank"
                                : "View on HackerRank"}
                            </Button>
                          </a>
                        )}
                        {(hasResults || status === "ended") && (
                          <Link href={`/contests/${contest.id}`}>
                            <Button variant="outline">
                              {hasResults ? "View Results" : "Details"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
