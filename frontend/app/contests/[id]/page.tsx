"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContestById, Contest, ContestResult } from "@/lib/contestService";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";

export default function ContestDetailPage() {
  const params = useParams();
  const contestId = params.id as string;
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try { const data = await getContestById(contestId); setContest(data); }
      catch { console.error("Failed to fetch contest"); }
      finally { setLoading(false); }
    };
    if (contestId) fetchContest();
  }, [contestId]);

  if (loading) {
    return (<DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></DashboardLayout>);
  }

  if (!contest) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-sm text-[#FF4D4F] border border-[#FF4D4F]/30 p-4">
            <p>&gt; error: contest not found</p>
            <Link href="/contests" className="text-xs underline mt-2 text-muted-foreground block">← back to contests</Link>
          </div>
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
  const hasResults = Array.isArray(contest.results) && contest.results.length > 0;
  const statusLabel = isUpcoming ? "upcoming" : isActive ? "active" : "ended";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Back */}
        <section className="py-2">
          <Link href="/contests" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← back to contests</Link>
        </section>

        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">contest</span>{" "}
            <span className="font-normal text-muted-foreground">--detail</span>
          </h1>
        </section>

        <hr className="border-border" />

        {/* Contest info */}
        <section className="py-4 space-y-3">
          <p className="text-lg font-semibold text-foreground">{contest.title}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">status: </span>
              <span className={isActive ? "text-[#3FB950]" : isUpcoming ? "text-[#FF9F1C]" : "text-muted-foreground"}>{statusLabel}</span>
              {isActive && <span className="ml-2 inline-block w-2 h-2 bg-[#3FB950] rounded-full animate-pulse" />}
            </p>
            <p>
              <span className="text-muted-foreground">date: </span>
              <span className="text-foreground">
                {startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">time: </span>
              <span className="text-foreground">
                {startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – {endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">duration: </span>
              <span className="text-foreground">{contest.timer} min</span>
            </p>
            {contest.hackerRankUrl && (
              <p>
                <span className="text-muted-foreground">platform: </span>
                <a href={contest.hackerRankUrl} target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline">HackerRank ↗</a>
              </p>
            )}
          </div>
        </section>

        {/* Upcoming notice */}
        {isUpcoming && (
          <>
            <hr className="border-border" />
            <section className="py-4 border border-border p-4">
              <p className="text-sm text-[#FF9F1C]">&gt; contest starts soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                starts on {startTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
              {contest.hackerRankUrl && (
                <a href={contest.hackerRankUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors">
                  [ REGISTER ON HACKERRANK ]
                </a>
              )}
            </section>
          </>
        )}

        {/* Active */}
        {isActive && (
          <>
            <hr className="border-border" />
            <section className="py-4 border border-[#3FB950]/30 p-4">
              <p className="text-sm text-[#3FB950]">&gt; contest is live!</p>
              <p className="text-sm text-muted-foreground mt-1">head to HackerRank to participate</p>
              {contest.hackerRankUrl && (
                <a href={contest.hackerRankUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs border border-[#3FB950] px-4 py-2 text-[#3FB950] hover:bg-[#3FB950]/10 transition-colors">
                  [ JOIN CONTEST ]
                </a>
              )}
            </section>
          </>
        )}

        {/* Results */}
        {isEnded && hasResults && (
          <>
            <hr className="border-border" />
            <section className="py-4">
              <p className="text-sm font-semibold text-foreground mb-4">&gt; results</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-normal">#</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-normal">name</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-normal">score</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-normal">solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contest.results as ContestResult[]).map((result, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={result.rank <= 3 ? (result.rank === 1 ? "text-[#FF9F1C] font-bold" : result.rank === 2 ? "text-muted-foreground font-bold" : "text-[#CD7F32] font-bold") : "text-muted-foreground"}>
                            #{result.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-medium">{result.name}</td>
                        <td className="py-2.5 px-3 text-right text-[#3FB950]">{result.score ?? "—"}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{result.solved ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Ended no results */}
        {isEnded && !hasResults && (
          <>
            <hr className="border-border" />
            <section className="py-4 text-center border border-border p-6">
              <p className="text-foreground font-semibold">&gt; contest has ended</p>
              <p className="text-sm text-muted-foreground mt-1">results have not been posted yet</p>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
