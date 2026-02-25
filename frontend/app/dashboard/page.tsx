"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { useDashboard, useStreak, useHeatmap, useAchievements } from "@/lib/hooks/useData";
import { getTaskStatus } from "@/lib/taskService";
import { getSessionStatus } from "@/lib/sessionService";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";

/* ── Rank tier system ── */
function getRankTier(points: number) {
  if (points >= 500) return { name: "Master", color: "#F85149", next: null, nextThreshold: 0 };
  if (points >= 300) return { name: "Expert", color: "#C678DD", next: "Master", nextThreshold: 500 };
  if (points >= 100) return { name: "Specialist", color: "#58A6FF", next: "Expert", nextThreshold: 300 };
  return { name: "Newbie", color: "#8B949E", next: "Specialist", nextThreshold: 100 };
}

/* ── Animated counter component ── */
function AnimatedCounter({ value, className = "" }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsubscribe;
  }, [display]);

  return <span ref={ref} className={className}>0</span>;
}

/* ── Stagger entrance wrapper ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const } },
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasProfile = useAuthStore((state) => state.hasProfile);

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

  const shouldShowSkeleton = isLoading && isAuthenticated && hasProfile === true;

  if (shouldShowSkeleton) {
    return (<DashboardLayout><DashboardSkeleton /></DashboardLayout>);
  }

  if (!user) return null;

  // Computed data
  const nextSession = sessions
    .filter((s) => { const st = getSessionStatus(s); return st === "upcoming" || st === "live"; })
    .sort((a, b) => { if (!a.date) return 1; if (!b.date) return -1; return new Date(a.date).getTime() - new Date(b.date).getTime(); })[0] || null;

  const pendingCount = tasks.filter((t) => t.userSubmissions?.some((s) => s.status === "PENDING")).length;
  const completedCount = tasks.filter((t) => t.userSubmissions?.some((s) => s.status === "VERIFIED")).length;
  const availableTasks = tasks.filter((t) => { const status = getTaskStatus(t); return status.canSubmit; });
  const userEntry = leaderboard.find((e) => e.userId === user?.id);

  // Rank tier
  const tier = getRankTier(userPoints);
  const progressToNext = tier.nextThreshold
    ? Math.min(100, Math.round((userPoints / tier.nextThreshold) * 100))
    : 100;

  // Recent activity (from submissions)
  const recentActivity = submissions.slice(0, 5).map((sub) => ({
    id: sub.id,
    text: sub.status === "VERIFIED"
      ? `accepted ${sub.task?.title || "task"} (+${sub.points} pts)`
      : sub.status === "PENDING"
        ? `submitted ${sub.task?.title || "task"} — awaiting verification`
        : `rejected ${sub.task?.title || "task"}`,
    color: sub.status === "VERIFIED" ? "#3FB950" : sub.status === "PENDING" ? "#D29922" : "#F85149",
    time: sub.createdAt,
  }));

  return (
    <DashboardLayout>
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-2"
        variants={stagger}
        initial="hidden"
        animate="show"
      >

        {/* ── User Info + Rank ── */}
        <motion.section variants={fadeUp} className="py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                &gt; user: {profile?.name?.replace(/\s+/g, "_") || user.email}
              </p>
              <p className="text-sm text-foreground">
                &gt; role: {user.role.toLowerCase()}
              </p>
              {profile?.branch && (
                <p className="text-sm text-foreground">&gt; branch: {profile.branch}</p>
              )}
            </div>

            {/* Rank badge */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">rank_tier:</span>
                <span
                  className="text-sm font-bold px-2 py-0.5 border"
                  style={{ color: tier.color, borderColor: tier.color + "40" }}
                >
                  {tier.name}
                </span>
              </div>
              {userEntry && (
                <p className="text-xs text-muted-foreground">position: #{userEntry.position}</p>
              )}
            </div>
          </div>
        </motion.section>

        <hr className="border-border" />

        {/* ── Stats + Animated Counters ── */}
        <motion.section variants={fadeUp} className="py-4">
          <p className="text-sm font-semibold text-foreground mb-4">
            &gt; stats --overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">points: </span>
              <AnimatedCounter value={userPoints} className="text-foreground font-bold" />
            </div>
            <div>
              <span className="text-muted-foreground">submissions: </span>
              <AnimatedCounter value={submissions.length} className="text-foreground" />
            </div>
            <div>
              <span className="text-muted-foreground">tasks_completed: </span>
              <AnimatedCounter value={completedCount} className="text-[#3FB950]" />
            </div>
            <div>
              <span className="text-muted-foreground">tasks_pending: </span>
              <AnimatedCounter value={pendingCount} className="text-[#D29922]" />
            </div>
            <div>
              <span className="text-muted-foreground">tasks_available: </span>
              <AnimatedCounter value={availableTasks.length} className="text-foreground" />
            </div>
            <div>
              <span className="text-muted-foreground">contests: </span>
              <AnimatedCounter value={contests.length} className="text-foreground" />
            </div>
          </div>

          {/* Progress to next rank */}
          {tier.next && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>progress_to_{tier.next.toLowerCase()}:</span>
                <span>{userPoints}/{tier.nextThreshold} pts</span>
              </div>
              <div className="h-2 bg-[#21262D] w-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#3FB950]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: [0, 0, 0.2, 1] }}
                />
              </div>
            </div>
          )}
        </motion.section>

        <hr className="border-border" />

        {/* ── Streak + Heatmap ── */}
        <StreakAndHeatmap />

        <hr className="border-border" />

        {/* ── Achievements ── */}
        <AchievementsSection />

        <hr className="border-border" />

        {/* ── Live Session / Next Session ── */}
        {nextSession && (
          <>
            <motion.section variants={fadeUp} className="py-4">
              {getSessionStatus(nextSession) === "live" ? (
                <div className="flex items-center gap-3 p-3 border border-[#3FB950]/30">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                  <span className="text-sm text-[#3FB950] font-semibold flex-1">
                    LIVE: {nextSession.title}
                  </span>
                  <button
                    onClick={() => window.open(nextSession.meetLink, "_blank", "noopener,noreferrer")}
                    className="text-xs border border-[#3FB950] px-3 py-1 text-[#3FB950] hover:bg-[#3FB950]/10 transition-colors"
                  >
                    [ JOIN ]
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  &gt; next_session: {nextSession.title} ({nextSession.date ? new Date(nextSession.date).toLocaleDateString() : "TBA"})
                </p>
              )}
            </motion.section>
            <hr className="border-border" />
          </>
        )}

        {/* ── Announcements ── */}
        {announcements.length > 0 && (
          <>
            <motion.section variants={fadeUp} className="py-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                &gt; announcements --latest
              </p>
              <div className="space-y-2">
                {announcements.slice(0, 2).map((a) => (
                  <div key={a.id} className="text-sm">
                    <span className="text-muted-foreground">{a.pinned ? "[📌 PINNED]" : "[📢 ANNOUNCEMENT]"}</span>{" "}
                    <span className="text-foreground font-medium">{a.title}</span>
                    <span className="text-muted-foreground"> — {a.content?.slice(0, 80)}{a.content?.length > 80 ? "..." : ""}</span>
                  </div>
                ))}
              </div>
              <Link href="/announcements" className="text-xs text-[#58A6FF] hover:underline mt-2 inline-flex items-center gap-1">
                view all ({announcements.length}) <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.section>
            <hr className="border-border" />
          </>
        )}

        {/* ── Recent Activity Timeline ── */}
        {recentActivity.length > 0 && (
          <>
            <motion.section variants={fadeUp} className="py-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                &gt; activity --recent
              </p>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">&gt;</span>
                    <span style={{ color: activity.color }}>{activity.text}</span>
                    <span className="text-[#484F58] text-xs ml-auto flex-shrink-0">
                      {new Date(activity.time).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
            <hr className="border-border" />
          </>
        )}

        {/* ── Tasks Current ── */}
        <motion.section variants={fadeUp} className="py-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            &gt; tasks --current
          </p>
          {availableTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">no tasks available</p>
          ) : (
            <div className="space-y-2">
              {availableTasks.slice(0, 5).map((task) => {
                const hasSub = (task.userSubmissions?.length ?? 0) > 0;
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-3 text-sm hover:bg-muted/20 -mx-2 px-2 py-1 transition-colors">
                    <span className={hasSub ? "text-[#3FB950]" : "text-muted-foreground"}>{hasSub ? "[✓]" : "[ ]"}</span>
                    <span className="font-medium text-foreground flex-1">{task.title}</span>
                    <span className="text-muted-foreground text-xs">{task.points} pts</span>
                    {isOverdue && <span className="text-[#F85149] text-xs">overdue</span>}
                  </Link>
                );
              })}
            </div>
          )}
          <Link href="/tasks" className="text-xs text-[#58A6FF] hover:underline mt-2 inline-flex items-center gap-1">
            view all tasks <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.section>

        <hr className="border-border" />

        {/* ── Leaderboard Top 5 ── */}
        <motion.section variants={fadeUp} className="py-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            &gt; leaderboard --top 5
          </p>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">no leaderboard data</p>
          ) : (
            <div className="space-y-1">
              {leaderboard.slice(0, 5).map((entry, i) => {
                const isMe = entry.userId === user?.id;
                const entryTier = getRankTier(entry.points);
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex items-center text-sm gap-3 py-1 -mx-2 px-2 ${isMe ? "bg-[#58A6FF]/5 border-l-2 border-[#58A6FF]" : ""}`}
                  >
                    <span className="w-6 text-right text-muted-foreground">#{entry.position}</span>
                    <span className={`flex-1 ${isMe ? "text-[#58A6FF] font-semibold" : "text-foreground"}`}>
                      {entry.name?.replace(/\s+/g, "_") || entry.email?.split("@")[0]}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 border" style={{ color: entryTier.color, borderColor: entryTier.color + "30", fontSize: "10px" }}>
                      {entryTier.name}
                    </span>
                    <span className="text-[#3FB950] font-medium w-16 text-right">{entry.points}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {userEntry && userEntry.position > 5 && (
            <div className="mt-2 flex items-center text-sm gap-3 py-1 -mx-2 px-2 bg-[#58A6FF]/5 border-l-2 border-[#58A6FF]">
              <span className="w-6 text-right text-muted-foreground">#{userEntry.position}</span>
              <span className="flex-1 text-[#58A6FF] font-semibold">
                {userEntry.name?.replace(/\s+/g, "_") || user.email?.split("@")[0]}
              </span>
              <span className="text-[#3FB950] font-medium w-16 text-right">{userEntry.points}</span>
            </div>
          )}

          <Link href="/leaderboard" className="text-xs text-[#58A6FF] hover:underline mt-2 inline-flex items-center gap-1">
            view full leaderboard <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.section>

        <hr className="border-border" />

        {/* ── Recent Contests ── */}
        <motion.section variants={fadeUp} className="py-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            &gt; contests --recent
          </p>
          {contests.length === 0 ? (
            <p className="text-sm text-muted-foreground">no contests available</p>
          ) : (
            <div className="space-y-2">
              {contests.slice(0, 3).map((contest) => (
                <Link key={contest.id} href={`/contests/${contest.id}`} className="flex items-center justify-between text-sm hover:bg-muted/20 -mx-2 px-2 py-1 transition-colors">
                  <div>
                    <span className="text-foreground font-medium">{contest.title}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {new Date(contest.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs border border-border px-2 py-0.5 text-muted-foreground">
                    ENTER →
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/contests" className="text-xs text-[#58A6FF] hover:underline mt-2 inline-flex items-center gap-1">
            view all contests <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.section>

        {/* ── Keyboard shortcuts hint ── */}
        <motion.div variants={fadeUp} className="py-6 border-t border-border">
          <p className="text-[10px] text-[#484F58] text-center">
            keyboard: D dashboard · T tasks · L leaderboard · C contests · S sessions · B blog · A alumni
          </p>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}

/* ── Streak + Heatmap Component ── */
function StreakAndHeatmap() {
  const { streak } = useStreak();
  const { heatmap } = useHeatmap(12);

  // Build 52-week grid (full year) from heatmap data
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0=Sun
    const totalWeeks = 52;
    const totalDays = 7 * totalWeeks;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (6 - dayOfWeek) + 1);

    const countMap = new Map<string, number>();
    heatmap.forEach((e) => countMap.set(e.date, e.count));

    const maxCount = Math.max(1, ...heatmap.map((e) => e.count));

    const weeks: { date: string; count: number; level: number }[][] = [];
    let week: { date: string; count: number; level: number }[] = [];

    // Track month boundaries for labels
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const count = countMap.get(dateStr) || 0;
      const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
      week.push({ date: dateStr, count, level });

      // Detect month boundary on first day of week (Sunday)
      if (d.getDay() === 0 && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        months.push({
          label: d.toLocaleString("en-US", { month: "short" }),
          col: weeks.length, // current week index
        });
      }

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) weeks.push(week);

    return { grid: weeks, monthLabels: months };
  }, [heatmap]);

  const levelColors = [
    "bg-[#161B22]",
    "bg-[#0E4429]",
    "bg-[#006D32]",
    "bg-[#26A641]",
    "bg-[#39D353]",
  ];
  const levelDots = ["#161B22", "#0E4429", "#006D32", "#26A641", "#39D353"];
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <motion.section variants={fadeUp} className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">
          &gt; activity --streak
        </p>
        {/* Streak counters - top right */}
        <div className="flex gap-4 text-sm">
          <span>
            <span className="text-[#D29922]">🔥</span>{" "}
            <span className="text-foreground font-bold">{streak.currentStreak}</span>{" "}
            <span className="text-muted-foreground text-xs">day streak</span>
          </span>
          <span>
            <span className="text-muted-foreground text-xs">best: </span>
            <span className="text-foreground font-semibold">{streak.longestStreak}</span>
          </span>
        </div>
      </div>

      {/* GitHub-style heatmap */}
      <div className="border border-border p-3 overflow-x-auto">
        {/* Month labels row */}
        <div className="flex">
          {/* Spacer for day labels column */}
          <div className="w-8 shrink-0" />
          {/* Month labels positioned across the grid */}
          <div className="flex-1 relative h-5">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: `${(m.col / grid.length) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Grid: day labels + cells */}
        <div className="flex gap-0">
          {/* Day-of-week labels */}
          <div className="flex flex-col shrink-0 w-8">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-[13px] flex items-center"
                style={{ marginBottom: "2px" }}
              >
                <span className="text-[10px] text-muted-foreground leading-none">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex gap-[3px] flex-1">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] flex-1">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`aspect-square w-full rounded-[2px] ${levelColors[day.level]}`}
                    title={`${day.date}: ${day.count} activities`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {levelDots.map((color, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </motion.section>
  );
}

/* ── Achievements Component ── */
function AchievementsSection() {
  const { achievements } = useAchievements();

  return (
    <motion.section variants={fadeUp} className="py-4">
      <p className="text-sm font-semibold text-foreground mb-3">
        &gt; achievements --unlocked
      </p>
      {achievements.length === 0 ? (
        <p className="text-sm text-muted-foreground">no achievements unlocked yet — keep going!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {achievements.map((a) => (
            <div
              key={a.type}
              className="text-xs border border-border px-3 py-2 flex items-center gap-2"
              title={a.description}
            >
              <span className="text-base">{a.icon}</span>
              <div>
                <p className="text-foreground font-semibold">{a.name}</p>
                <p className="text-[#484F58]">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
