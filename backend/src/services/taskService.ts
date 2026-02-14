import prisma from "../models/prismaClient";
import { Prisma, SubmissionStatus } from "@prisma/client";
import cache from "../utils/cache";

const MAX_SUBMISSIONS_PER_TASK = 2;

// Create a new task
export const createTask = async (data: {
  title: string;
  description: string;
  leetcodeSlug?: string;
  points?: number;
  assignedTo?: string[];
  dueDate?: Date;
}) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      leetcodeSlug: data.leetcodeSlug || null,
      points: data.points || 0,
      assignedTo: data.assignedTo ? data.assignedTo : Prisma.JsonNull,
      dueDate: data.dueDate || null,
    },
  });
};

// Get all tasks with optional user context (for submission status)
export const getAllTasks = async (userId?: string) => {
  const tasks = await prisma.task.findMany({
    include: {
      _count: {
        select: { submissions: true },
      },
      submissions: userId
        ? {
          where: { userId },
          orderBy: { createdAt: "desc" },
        }
        : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((task) => {
    const userSubmissions = userId ? (task.submissions as any[]) : [];
    const submissionCount = userSubmissions.length;

    // Check if user can still submit (max 2 submissions, no verified submission)
    const hasVerified = userSubmissions.some((s) => s.status === "VERIFIED");
    const canSubmit =
      !hasVerified && submissionCount < MAX_SUBMISSIONS_PER_TASK;

    // Check if task is assigned to this user (or open to all)
    const assignedTo = task.assignedTo as string[] | null;
    const isAssignedToUser =
      !assignedTo || (userId && assignedTo.includes(userId));

    return {
      ...task,
      submissions: undefined, // Remove raw submissions from response
      userSubmissions: userId ? userSubmissions : undefined,
      canSubmit: userId ? canSubmit && isAssignedToUser : undefined,
      isAssignedToUser: userId ? isAssignedToUser : undefined,
    };
  });
};

// Get a single task by ID with optional user context
export const getTaskById = async (taskId: string, userId?: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      _count: {
        select: { submissions: true },
      },
      submissions: userId
        ? {
          where: { userId },
          orderBy: { createdAt: "desc" },
        }
        : false,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const userSubmissions = userId ? (task.submissions as any[]) : [];
  const submissionCount = userSubmissions.length;
  const hasVerified = userSubmissions.some((s) => s.status === "VERIFIED");
  const canSubmit = !hasVerified && submissionCount < MAX_SUBMISSIONS_PER_TASK;

  const assignedTo = task.assignedTo as string[] | null;
  const isAssignedToUser =
    !assignedTo || (userId && assignedTo.includes(userId));

  return {
    ...task,
    submissions: undefined,
    userSubmissions: userId ? userSubmissions : undefined,
    canSubmit: userId ? canSubmit && isAssignedToUser : undefined,
    isAssignedToUser: userId ? isAssignedToUser : undefined,
  };
};

// Update a task
export const updateTask = async (
  taskId: string,
  data: {
    title?: string;
    description?: string;
    leetcodeSlug?: string | null;
    points?: number;
    assignedTo?: string[] | null;
    dueDate?: Date | null;
  },
) => {
  const updateData: Prisma.TaskUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.leetcodeSlug !== undefined) updateData.leetcodeSlug = data.leetcodeSlug;
  if (data.points !== undefined) updateData.points = data.points;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.assignedTo !== undefined) {
    updateData.assignedTo =
      data.assignedTo === null || data.assignedTo.length === 0
        ? Prisma.JsonNull
        : data.assignedTo;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });
};

// Delete a task (submissions cascade delete)
export const deleteTask = async (taskId: string) => {
  return prisma.task.delete({
    where: { id: taskId },
  });
};

// Assign task to users (replace existing assignments)
export const assignTask = async (taskId: string, userIds: string[]) => {
  return prisma.task.update({
    where: { id: taskId },
    data: { assignedTo: userIds.length > 0 ? userIds : Prisma.JsonNull },
  });
};

// Get all submissions for a task (admin view)
export const getTaskSubmissions = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const submissions = await prisma.submission.findMany({
    where: { taskId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add isLate flag based on task dueDate
  return submissions.map((sub) => ({
    ...sub,
    isLate: task.dueDate
      ? new Date(sub.createdAt) > new Date(task.dueDate)
      : false,
  }));
};

// Submit a solution for a task
export const submitTask = async (
  taskId: string,
  userId: string,
  link: string,
) => {
  // Get task to check assignment and dueDate
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Check if task is assigned to this user (or open to all)
  const assignedTo = task.assignedTo as string[] | null;
  if (assignedTo && !assignedTo.includes(userId)) {
    throw new Error("This task is not assigned to you");
  }

  // Check existing submissions count
  const existingSubmissions = await prisma.submission.findMany({
    where: { taskId, userId },
    orderBy: { createdAt: "desc" },
  });

  if (existingSubmissions.length >= MAX_SUBMISSIONS_PER_TASK) {
    throw new Error(
      `Maximum submissions (${MAX_SUBMISSIONS_PER_TASK}) reached for this task`,
    );
  }

  // Check if already has a verified submission
  const hasVerified = existingSubmissions.some((s) => s.status === "VERIFIED");
  if (hasVerified) {
    throw new Error("You already have a verified submission for this task");
  }

  // Create the submission with PENDING status
  return prisma.submission.create({
    data: {
      taskId,
      userId,
      link,
      status: "PENDING",
      points: 0,
    },
  });
};

// Verify a submission and award points (admin action)
export const verifySubmission = async (
  submissionId: string,
  customPoints?: number,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { task: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.status === "VERIFIED") {
    throw new Error("Submission is already verified");
  }

  // Use custom points if provided, otherwise use task's default points
  const pointsToAward =
    customPoints !== undefined ? customPoints : submission.task.points;

  const result = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "VERIFIED",
      points: pointsToAward,
    },
  });

  // Invalidate leaderboard cache when points are awarded
  cache.invalidatePattern(/^leaderboard:/);

  return result;
};

// Reject a submission (admin action)
export const rejectSubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.status === "VERIFIED") {
    throw new Error("Cannot reject a verified submission");
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      points: 0,
    },
  });
};

// Get user's submissions across all tasks
export const getUserSubmissions = async (userId: string) => {
  return prisma.submission.findMany({
    where: { userId },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          points: true,
          dueDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get user's total verified points
export const getUserPoints = async (userId: string) => {
  const result = await prisma.submission.aggregate({
    where: {
      userId,
      status: "VERIFIED",
    },
    _sum: {
      points: true,
    },
  });

  return result._sum.points || 0;
};
