import api from "./axios";

// Types
export interface User {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "ALUMNI";

  createdAt: string;
  profile?: {
    name: string;
    branch: string;
    year: number;
    contact: string;
    handles?: Record<string, string>;
    graduationYear?: number;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    linkedIn?: string;
  } | null;
}

export interface Session {
  id: string;
  title: string;
  details: string | null;
  meetLink: string; // Required: Video call URL (Google Meet, Zoom, etc.)
  date: string | null;
  attendees: string[] | null;
  summary: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  dueDate: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

// User Management
export async function getUsers(): Promise<User[]> {
  const response = await api.get("/auth/users");
  return response.data.data || response.data;
}



export async function updateUserRole(
  userId: string,
  role: string
): Promise<User> {
  const response = await api.put(`/auth/users/${userId}/role`, { role });
  return response.data.data || response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/auth/users/${userId}`);
}

export async function updateUserHandles(
  userId: string,
  handles: Record<string, string>
): Promise<any> {
  const response = await api.put(`/profile/users/${userId}/handles`, { handles });
  return response.data.data || response.data;
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const response = await api.get("/sessions");
  return response.data.data || response.data;
}

export async function createSession(data: {
  title: string;
  details?: string;
  meetLink: string; // Required
  date?: string;
}): Promise<Session> {
  // Remove undefined/empty values to avoid sending them to the backend
  const payload: Record<string, string> = {
    title: data.title,
    meetLink: data.meetLink,
  };
  if (data.details) payload.details = data.details;
  if (data.date) payload.date = data.date;

  const response = await api.post("/sessions", payload);
  return response.data.data || response.data;
}

export async function updateSession(
  id: string,
  data: { title?: string; details?: string; meetLink?: string; date?: string }
): Promise<Session> {
  // Remove undefined/empty values
  const payload: Record<string, string> = {};
  if (data.title) payload.title = data.title;
  if (data.details !== undefined) payload.details = data.details;
  if (data.meetLink) payload.meetLink = data.meetLink;
  if (data.date !== undefined) payload.date = data.date;

  const response = await api.put(`/sessions/${id}`, payload);
  return response.data.data || response.data;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/sessions/${id}`);
}

// Tasks
export async function createTask(data: {
  title: string;
  description?: string;
  leetcodeSlug?: string;
  points: number;
  dueDate?: string;
}): Promise<Task> {
  const response = await api.post("/tasks", data);
  return response.data.data || response.data;
}

export async function assignTask(
  taskId: string,
  userId: string
): Promise<void> {
  await api.post(`/tasks/${taskId}/assign`, { userId });
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await api.get("/announcements");
  return response.data.data || response.data;
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  pinned?: boolean;
}): Promise<Announcement> {
  const response = await api.post("/announcements", data);
  return response.data.data || response.data;
}

export async function updateAnnouncement(
  id: string,
  data: { title?: string; content?: string; pinned?: boolean }
): Promise<Announcement> {
  const response = await api.put(`/announcements/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/announcements/${id}`);
}

// Blogs
export async function getPendingBlogs(): Promise<Blog[]> {
  const response = await api.get("/blogs/pending");
  return response.data.data || response.data;
}

export async function approveBlog(blogId: string): Promise<Blog> {
  const response = await api.post(`/blogs/${blogId}/approve`);
  return response.data.data || response.data;
}

export async function rejectBlog(blogId: string, reason?: string): Promise<Blog> {
  const response = await api.post(`/blogs/${blogId}/reject`, { reason });
  return response.data.data || response.data;
}

export async function createContest(data: {
  title: string;
  hackerRankUrl?: string;
  timer: number; // Duration in minutes (required)
  startTime: string; // ISO date string in UTC (required)
}): Promise<unknown> {
  const response = await api.post("/contests", data);
  return response.data.data || response.data;
}

export async function updateContestResults(
  contestId: string,
  results: { rank: number; name: string; score?: number; solved?: number }[]
): Promise<unknown> {
  const response = await api.put(`/contests/${contestId}/results`, { results });
  return response.data.data || response.data;
}

export async function deleteContest(contestId: string): Promise<void> {
  await api.delete(`/contests/${contestId}`);
}
