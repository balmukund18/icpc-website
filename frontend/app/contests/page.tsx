"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getContests, Contest } from "@/lib/contestService";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchContests() {
      try {
        const data = await getContests();
        setContests(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch contests");
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, [token, router]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "No time limit";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getContestStatus = (contest: Contest) => {
    if (!contest.timer) return "open";
    const startTime = new Date(contest.createdAt).getTime();
    const endTime = startTime + contest.timer * 60 * 1000;
    const now = Date.now();

    if (now < startTime) return "upcoming";
    if (now > endTime) return "ended";
    return "active";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Contests</h1>
            <p className="text-gray-400">
              Participate in coding contests and improve your skills
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {contests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No contests available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => {
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
                        <span>Duration:</span>
                        <span>{formatDuration(contest.timer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>
                          {new Date(contest.createdAt).toLocaleDateString()}
                        </span>
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
    </div>
  );
}
