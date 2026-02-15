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

export const leaderboard = async (
  period: "month" | "semester" | "all" = "all",
) => {
  // Cache leaderboard results for 5 minutes (300 seconds) to reduce DB load
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

      // Batch fetch all users and profiles in single queries (avoid N+1)
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

      // Create maps for O(1) lookups
      const userMap = new Map(users.map((u) => [u.id, u]));
      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      // Combine data
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
    5 * 60 * 1000, // Cache for 5 minutes
  );
};

export const listBadges = async () => {
  // return static rules for now
  return badges;
};

export const earnedBadgesForUser = async (userId: string) => {
  // Fetch all required data in parallel to avoid multiple queries in loop
  const [subsCount, board] = await Promise.all([
    prisma.submission.count({ where: { userId, status: "VERIFIED" } }),
    leaderboard("month"), // Reuse optimized leaderboard function
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
    // streak rules require more tracking; left as placeholder
  }
  return earned;
};
