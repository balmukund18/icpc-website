import prisma from "../models/prismaClient";
import badges from "../utils/badges.json";
import cache from "../utils/cache";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfSemester(d: Date) {
  const month = d.getMonth();
  const semStartMonth = month < 6 ? 0 : 6; // Jan-Jun, Jul-Dec
  return new Date(d.getFullYear(), semStartMonth, 1);
}

// =====================
// LEADERBOARD
// =====================

export const leaderboard = async (
  period: "month" | "semester" | "all" = "all",
) => {
  const cacheKey = `leaderboard:${period}`;

  return cache.getOrSet(
    cacheKey,
    async () => {
      const now = new Date();
      let where: any = { status: "VERIFIED" };
      if (period === "month") where.createdAt = { gte: startOfMonth(now) };
      if (period === "semester")
        where.createdAt = { gte: startOfSemester(now) };

      const rows = await prisma.submission.groupBy({
        by: ["userId"],
        where,
        _sum: { points: true },
        orderBy: { _sum: { points: "desc" } },
        take: 100,
      });

      const userIds = rows.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, role: true },
      });
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          name: true,
          branch: true,
          year: true,
          contact: true,
          handles: true,
          graduationYear: true,
          company: true,
          position: true,
          location: true,
          bio: true,
          linkedIn: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      const result = rows.map((r, idx) => {
        const user = userMap.get(r.userId);
        const profile = profileMap.get(r.userId);
        return {
          position: idx + 1,
          userId: r.userId,
          email: user?.email,
          role: user?.role || null,
          name: profile?.name || null,
          branch: profile?.branch || null,
          year: profile?.year || null,
          contact: profile?.contact || null,
          handles: profile?.handles || null,
          graduationYear: profile?.graduationYear || null,
          company: profile?.company || null,
          jobPosition: profile?.position || null,
          location: profile?.location || null,
          bio: profile?.bio || null,
          linkedIn: profile?.linkedIn || null,
          points: r._sum.points || 0,
        };
      });
      return result;
    },
    5 * 60 * 1000,
  );
};

// =====================
// BADGES (existing)
// =====================

export const listBadges = async () => {
  return badges;
};

export const earnedBadgesForUser = async (userId: string) => {
  const [subsCount, board] = await Promise.all([
    prisma.submission.count({ where: { userId, status: "VERIFIED" } }),
    leaderboard("month"),
  ]);

  const earned: any[] = [];
  const rules: any[] = badges as any;

  for (const r of rules) {
    const rule = r.rule;
    if (rule.type === "submission_count") {
      if (subsCount >= (rule.min || 1)) earned.push(r);
    }
    if (rule.type === "leaderboard_position" && rule.period === "month") {
      const pos = board.findIndex((b: any) => b.userId === userId);
      if (pos >= 0 && pos + 1 <= rule.position) earned.push(r);
    }
  }
  return earned;
};

// =====================
// DAILY ACTIVITY TRACKING
// =====================

export const trackActivity = async (userId: string, type: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyActivity.upsert({
    where: {
      userId_date_type: { userId, date: today, type },
    },
    update: { count: { increment: 1 } },
    create: { userId, date: today, type, count: 1 },
  });

  // Check and award achievements after activity
  await checkAndAwardAchievements(userId);
};

// =====================
// STREAK
// =====================

export const getStreak = async (userId: string) => {
  // Get all distinct activity dates for this user, ordered desc
  const activities = await prisma.dailyActivity.findMany({
    where: { userId },
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "desc" },
  });

  if (activities.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dates = activities.map((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const oneDayMs = 86400000;

  // Current streak: count consecutive days ending today or yesterday
  let currentStreak = 0;
  let checkDate = todayMs;

  // Allow streak to count from today or yesterday
  if (dates[0] !== todayMs && dates[0] !== todayMs - oneDayMs) {
    currentStreak = 0;
  } else {
    checkDate = dates[0];
    for (const dateMs of dates) {
      if (dateMs === checkDate) {
        currentStreak++;
        checkDate -= oneDayMs;
      } else if (dateMs < checkDate) {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === oneDayMs) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak, currentStreak);

  return { currentStreak, longestStreak };
};

// =====================
// HEATMAP
// =====================

export const getHeatmap = async (userId: string, months: number = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  const activities = await prisma.dailyActivity.groupBy({
    by: ["date"],
    where: {
      userId,
      date: { gte: startDate },
    },
    _sum: { count: true },
    orderBy: { date: "asc" },
  });

  return activities.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    count: a._sum.count || 0,
  }));
};

// =====================
// ACHIEVEMENTS
// =====================

const ACHIEVEMENT_DEFS = [
  { type: "first_submission", name: "First Blood", description: "Submit your first solution", icon: "🩸" },
  { type: "streak_7", name: "Week Warrior", description: "7-day activity streak", icon: "🔥" },
  { type: "streak_30", name: "Monthly Machine", description: "30-day activity streak", icon: "⚡" },
  { type: "points_100", name: "Centurion", description: "Earn 100+ points", icon: "💯" },
  { type: "points_500", name: "Elite Coder", description: "Earn 500+ points", icon: "🏆" },
  { type: "tasks_10", name: "Task Hunter", description: "Complete 10 tasks", icon: "🎯" },
  { type: "blog_writer", name: "Blogger", description: "Write your first blog", icon: "✍️" },
  { type: "top_3", name: "Podium Finish", description: "Reach top 3 on leaderboard", icon: "🥇" },
];

export const getAchievementDefs = () => ACHIEVEMENT_DEFS;

export const checkAndAwardAchievements = async (userId: string) => {
  const [verifiedSubs, totalPoints, blogCount, streakData, board] = await Promise.all([
    prisma.submission.count({ where: { userId, status: "VERIFIED" } }),
    prisma.submission.aggregate({ where: { userId, status: "VERIFIED" }, _sum: { points: true } }),
    prisma.blog.count({ where: { authorId: userId, status: "APPROVED" } }),
    getStreak(userId),
    leaderboard("all"),
  ]);

  const points = totalPoints._sum.points || 0;
  const position = board.findIndex((b: any) => b.userId === userId) + 1;

  const toAward: string[] = [];

  if (verifiedSubs >= 1) toAward.push("first_submission");
  if (streakData.currentStreak >= 7 || streakData.longestStreak >= 7) toAward.push("streak_7");
  if (streakData.currentStreak >= 30 || streakData.longestStreak >= 30) toAward.push("streak_30");
  if (points >= 100) toAward.push("points_100");
  if (points >= 500) toAward.push("points_500");
  if (verifiedSubs >= 10) toAward.push("tasks_10");
  if (blogCount >= 1) toAward.push("blog_writer");
  if (position > 0 && position <= 3) toAward.push("top_3");

  // Upsert each (skipDuplicates style)
  for (const type of toAward) {
    await prisma.achievement.upsert({
      where: { userId_type: { userId, type } },
      update: {},
      create: { userId, type },
    });
  }
};

export const getUserAchievements = async (userId: string) => {
  const earned = await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
  });

  return earned.map((a) => {
    const def = ACHIEVEMENT_DEFS.find((d) => d.type === a.type);
    return {
      type: a.type,
      name: def?.name || a.type,
      description: def?.description || "",
      icon: def?.icon || "🏅",
      unlockedAt: a.unlockedAt,
    };
  });
};
