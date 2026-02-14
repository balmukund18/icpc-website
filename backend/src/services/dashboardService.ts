import prisma from '../models/prismaClient';
import { getProfile } from './profileService';
import { listSessions } from './sessionService';
import { getAllTasks, getUserPoints, getUserSubmissions } from './taskService';
import { listContests } from './contestService';
import { listAnnouncements } from './announcementService';
import { leaderboard as getLeaderboard } from './gamificationService';

/**
 * Get the top 10 entries from the leaderboard
 */
const getLeaderboardTop10 = async () => {
  const fullLeaderboard = await getLeaderboard('all');
  return fullLeaderboard.slice(0, 10);
};

/**
 * Get all dashboard data for a user in a single request
 * Combines 8 API calls into 1 for better performance
 */
export const getDashboardData = async (userId: string) => {
  // Fetch all data in parallel for maximum performance
  const [
    profile,
    contests,
    submissions,
    sessions,
    announcements,
    tasks,
    userPoints,
    leaderboard,
  ] = await Promise.all([
    // Profile - returns null if not found
    getProfile(userId).catch(() => null),

    // Contests list
    listContests().catch(() => []),

    // User's task submissions (primary submission activity)
    getUserSubmissions(userId).catch(() => []),

    // All sessions
    listSessions().catch(() => []),

    // All announcements (pinned first)
    listAnnouncements().catch(() => []),

    // All tasks with user's submission status
    getAllTasks(userId).catch(() => []),

    // User's total points
    getUserPoints(userId).catch(() => 0),

    // Top 10 leaderboard
    getLeaderboardTop10().catch(() => []),
  ]);

  return {
    profile,
    contests,
    submissions,
    sessions,
    announcements,
    tasks,
    userPoints,
    leaderboard,
  };
};

