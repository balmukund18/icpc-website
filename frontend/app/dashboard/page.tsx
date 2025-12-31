"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import api from "@/lib/axios";
import {
  Calendar,
  Trophy,
  User as UserIcon,
  Code,
  LogOut,
  Play,
} from "lucide-react";
import Link from "next/link";

interface Profile {
  name: string;
  branch: string;
  year: number;
  contact: string;
  handles: any;
}

interface Contest {
  id: string;
  title: string;
  createdAt: string;
}

interface Submission {
  id: string;
  contestId: string;
  problemIdx: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const [profileRes, contestsRes, submissionsRes] =
          await Promise.allSettled([
            api.get("/profile"),
            api.get("/contests"),
            api.get("/contests/my-submissions"),
          ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data.data);
        }
        if (contestsRes.status === "fulfilled") {
          setContests(contestsRes.value.data.data);
        }
        if (submissionsRes.status === "fulfilled") {
          setSubmissions(submissionsRes.value.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Welcome back, {profile?.name || user.email}
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your competitive programming journey.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/contests">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Contests
              </Button>
            </Link>
            {user.role === "ADMIN" && (
              <Button onClick={() => router.push("/admin")} variant="outline">
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              variant="destructive"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

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
              <div className="text-2xl font-bold text-primary">TBA</div>
              <p className="text-xs text-muted-foreground">
                Check announcements
              </p>
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
    </div>
  );
}
