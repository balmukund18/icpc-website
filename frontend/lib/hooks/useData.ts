"use client";

import useSWR, { mutate } from "swr";

// ==========================================
// Types
// ==========================================

export interface Profile {
  name: string;
  branch: string;
  year: number;
  contact: string;
  handles: Record<string, string>;
}

export interface Contest {
  id: string;
  title: string;
  problems: unknown[] | null;
  timer: number; // Duration in minutes
  startTime: string; // ISO date string - scheduled start time
  results: unknown[] | null;
  createdAt: string;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  problemIdx: number;
  status: string;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  details: string | null;
  date: string | null;
  meetLink: string;
  attendees: string[] | null;
  summary: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  leetcodeSlug?: string | null;
  points: number;
  dueDate: string | null;
  assignedTo: string[] | null;
  createdAt: string;
  userSubmissions?: TaskSubmission[];
  canSubmit?: boolean;
  isAssignedToUser?: boolean;
  _count?: { submissions: number };
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  link: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  points: number;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    points: number;
    dueDate: string | null;
  };
}

export interface LeaderboardEntry {
  position: number;
  userId: string;
  email: string;
  name: string | null;
  points: number;
}

export interface DashboardData {
  profile: Profile | null;
  contests: Contest[];
  submissions: TaskSubmission[];
  sessions: Session[];
  announcements: Announcement[];
  tasks: Task[];
  userPoints: number;
  leaderboard: LeaderboardEntry[];
}

export interface BlogTag {
  name: string;
  count: number;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author?: {
    email: string;
    profile?: { name: string };
  };
  _count?: { comments: number; likes?: number };
}

// ==========================================
// SWR Cache Keys
// ==========================================

export const SWR_KEYS = {
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SESSIONS: "/sessions",
  SESSION: (id: string) => `/sessions/${id}`,
  TASKS: "/tasks",
  TASK: (id: string) => `/tasks/${id}`,
  ANNOUNCEMENTS: "/announcements",
  CONTESTS: "/contests",
  CONTEST: (id: string) => `/contests/${id}`,
  LEADERBOARD: (period: string) => `/gamification/leaderboard?period=${period}`,
  USER_POINTS: "/tasks/my-points",
  MY_SUBMISSIONS: "/contests/my-submissions",
  BLOG_TAGS: "/blogs/tags",
  BLOGS: "/blogs",
  STREAK: "/gamification/streak",
  HEATMAP: (months: number) => `/gamification/heatmap?months=${months}`,
  ACHIEVEMENTS: "/gamification/achievements",
} as const;

// ==========================================
// Dashboard Hook (Combined Endpoint)
// ==========================================

export function useDashboard() {
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<DashboardData>(
    SWR_KEYS.DASHBOARD
  );

  return {
    data,
    profile: data?.profile ?? null,
    contests: data?.contests ?? [],
    submissions: data?.submissions ?? [],
    sessions: data?.sessions ?? [],
    announcements: data?.announcements ?? [],
    tasks: data?.tasks ?? [],
    userPoints: data?.userPoints ?? 0,
    leaderboard: data?.leaderboard ?? [],
    isLoading,
    isValidating,
    error,
    revalidate,
  };
}

// ==========================================
// Individual Resource Hooks
// ==========================================

export function useProfile() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Profile>(
    SWR_KEYS.PROFILE
  );

  return {
    profile: data ?? null,
    isLoading,
    error,
    revalidate,
  };
}

export function useSessions() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Session[]>(
    SWR_KEYS.SESSIONS
  );

  return {
    sessions: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useSession(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Session>(
    id ? SWR_KEYS.SESSION(id) : null
  );

  return {
    session: data ?? null,
    isLoading,
    error,
    revalidate,
  };
}

export function useTasks() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Task[]>(
    SWR_KEYS.TASKS
  );

  return {
    tasks: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useTask(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Task>(
    id ? SWR_KEYS.TASK(id) : null
  );

  return {
    task: data ?? null,
    isLoading,
    error,
    revalidate,
  };
}

export function useAnnouncements() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Announcement[]>(
    SWR_KEYS.ANNOUNCEMENTS
  );

  return {
    announcements: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useContests() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Contest[]>(
    SWR_KEYS.CONTESTS
  );

  return {
    contests: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useContest(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Contest>(
    id ? SWR_KEYS.CONTEST(id) : null
  );

  return {
    contest: data ?? null,
    isLoading,
    error,
    revalidate,
  };
}

export function useLeaderboard(period: "month" | "semester" | "all" = "all") {
  const { data, error, isLoading, mutate: revalidate } = useSWR<LeaderboardEntry[]>(
    SWR_KEYS.LEADERBOARD(period)
  );

  return {
    leaderboard: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useUserPoints() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ points: number }>(
    SWR_KEYS.USER_POINTS
  );

  return {
    points: data?.points ?? 0,
    isLoading,
    error,
    revalidate,
  };
}

export function useMySubmissions() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<ContestSubmission[]>(
    SWR_KEYS.MY_SUBMISSIONS
  );

  return {
    submissions: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useBlogTags() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<BlogTag[]>(
    SWR_KEYS.BLOG_TAGS
  );

  return {
    tags: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

// ==========================================
// Cache Invalidation Helpers
// ==========================================

/**
 * Invalidate dashboard cache after mutations
 * Call this after submitting tasks, updating profile, etc.
 */
export async function invalidateDashboard() {
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate tasks cache
 */
export async function invalidateTasks() {
  await mutate(SWR_KEYS.TASKS);
  await mutate(SWR_KEYS.DASHBOARD); // Dashboard also shows tasks
}

/**
 * Invalidate a specific task
 */
export async function invalidateTask(id: string) {
  await mutate(SWR_KEYS.TASK(id));
  await mutate(SWR_KEYS.TASKS);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate sessions cache
 */
export async function invalidateSessions() {
  await mutate(SWR_KEYS.SESSIONS);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate a specific session
 */
export async function invalidateSession(id: string) {
  await mutate(SWR_KEYS.SESSION(id));
  await mutate(SWR_KEYS.SESSIONS);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate announcements cache
 */
export async function invalidateAnnouncements() {
  await mutate(SWR_KEYS.ANNOUNCEMENTS);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate contests cache
 */
export async function invalidateContests() {
  await mutate(SWR_KEYS.CONTESTS);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate profile cache
 */
export async function invalidateProfile() {
  await mutate(SWR_KEYS.PROFILE);
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate leaderboard cache
 */
export async function invalidateLeaderboard() {
  await mutate(SWR_KEYS.LEADERBOARD("all"));
  await mutate(SWR_KEYS.LEADERBOARD("month"));
  await mutate(SWR_KEYS.LEADERBOARD("semester"));
  await mutate(SWR_KEYS.DASHBOARD);
}

/**
 * Invalidate all caches - use sparingly
 */
export async function invalidateAll() {
  await mutate(() => true, undefined, { revalidate: true });
}

// ==========================================
// Gamification Hooks
// ==========================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface AchievementData {
  type: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export function useStreak() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<StreakData>(
    SWR_KEYS.STREAK
  );

  return {
    streak: data ?? { currentStreak: 0, longestStreak: 0 },
    isLoading,
    error,
    revalidate,
  };
}

export function useHeatmap(months: number = 6) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<HeatmapEntry[]>(
    SWR_KEYS.HEATMAP(months)
  );

  return {
    heatmap: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}

export function useAchievements() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<AchievementData[]>(
    SWR_KEYS.ACHIEVEMENTS
  );

  return {
    achievements: data ?? [],
    isLoading,
    error,
    revalidate,
  };
}
