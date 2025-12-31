import prisma from "../models/prismaClient";

export const createContest = async (data: any) => {
  return prisma.contest.create({ data });
};

export const getContest = async (id: string) => {
  return prisma.contest.findUnique({ where: { id } });
};

export const addProblem = async (contestId: string, problem: any) => {
  const c = await prisma.contest.findUnique({ where: { id: contestId } });
  let problems: any = c?.problems;
  if (!Array.isArray(problems)) problems = [];
  problems.push(problem);
  return prisma.contest.update({
    where: { id: contestId },
    data: { problems },
  });
};

export const listContests = async () =>
  prisma.contest.findMany({ orderBy: { createdAt: "desc" } });

export const saveResults = async (contestId: string, results: any) => {
  const c = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!c) throw new Error("Contest not found");
  return prisma.contest.update({ where: { id: contestId }, data: { results } });
};

export const userHistory = async (userId: string) => {
  // simplistic: search contests with results containing the user
  const all = await prisma.contest.findMany();
  const filtered = all.filter((c) => {
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

export const getUserSubmissions = async (userId: string) => {
  return prisma.contestSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserContestSubmissions = async (
  contestId: string,
  userId: string
) => {
  return prisma.contestSubmission.findMany({
    where: { contestId, userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getSubmissionById = async (id: string) => {
  return prisma.contestSubmission.findUnique({ where: { id } });
};

export const deleteContest = async (id: string) => {
  // First delete all submissions for this contest
  await prisma.contestSubmission.deleteMany({ where: { contestId: id } });
  // Then delete the contest
  return prisma.contest.delete({ where: { id } });
};
