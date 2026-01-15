"use client";

import Link from "next/link";
import { useContests, Contest } from "@/lib/hooks/useData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ContestsPageSkeleton } from "@/components/ui/skeletons";

export default function ContestsPage() {
  // Use SWR hook for contests data
  const { contests, isLoading, error } = useContests();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getContestStatus = (contest: Contest) => {
    const startTime = new Date(contest.startTime).getTime();
    const now = Date.now();

    if (now < startTime) return "upcoming";
    
    const endTime = startTime + contest.timer * 60 * 1000;
    if (now > endTime) return "ended";
    
    return "active";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <ContestsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Contests</h1>
          <p className="text-gray-400">
            Participate in coding contests and improve your skills
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            Failed to load contests
          </div>
        )}

        {contests.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No contests available yet.</p>
          </div>
        )}

        {contests.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest: Contest) => {
              const status = getContestStatus(contest);
              const problemCount = contest.problems?.length || 0;

              return (
                <Card
                  key={contest.id}
                  className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">
                        {contest.title}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : status === "upcoming"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <CardDescription className="text-gray-400">
                      {problemCount} problem{problemCount !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Starts:</span>
                        <span>
                          {new Date(contest.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{formatDuration(contest.timer)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/contests/${contest.id}`} className="w-full">
                      <Button className="w-full" variant="default">
                        {status === "ended" ? "View Contest" : "Enter Contest"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
