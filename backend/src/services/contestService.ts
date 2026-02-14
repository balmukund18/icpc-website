import prisma from "../models/prismaClient";

export const createContest = async (data: {
  title: string;
  hackerRankUrl?: string;
  timer: number;
  startTime: string;
}) => {
  return prisma.contest.create({ data });
};

export const getContest = async (id: string) => {
  return prisma.contest.findUnique({ where: { id } });
};

export const listContests = async () =>
  prisma.contest.findMany({ orderBy: { createdAt: "desc" } });

export const saveResults = async (contestId: string, results: any) => {
  const c = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!c) throw new Error("Contest not found");
  return prisma.contest.update({ where: { id: contestId }, data: { results } });
};

export const userHistory = async (userId: string) => {
  const contests = await prisma.contest.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Filter contests where user has results
  const filtered = contests.filter((c) => {
    const res = c.results as any[] | undefined;
    return Array.isArray(res) && res.some((r: any) => r.userId === userId);
  });
  return filtered;
};

export const getContestSubmissions = async (contestId: string) => {
  return prisma.contestSubmission.findMany({
    where: { contestId },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteContest = async (id: string) => {
  await prisma.contestSubmission.deleteMany({ where: { contestId: id } });
  return prisma.contest.delete({ where: { id } });
};
