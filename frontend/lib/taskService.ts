import api from "./axios";

// Types
export type SubmissionStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Task {
  id: string;
  title: string;
  description: string;
  leetcodeSlug?: string | null;
  points: number;
  assignedTo: string[] | null;
  dueDate: string | null;
  createdAt: string;
  _count?: { submissions: number };
  userSubmissions?: Submission[];
  canSubmit?: boolean;
  isAssignedToUser?: boolean;
}

export interface Submission {
  id: string;
  taskId: string;
  userId: string;
  link: string;
  status: SubmissionStatus;
  points: number;
  createdAt: string;
  isLate?: boolean;
  user?: {
    id: string;
    email: string;
    profile?: { name: string } | null;
  };
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

export interface CreateTaskInput {
  title: string;
  description?: string;
  leetcodeSlug?: string;
  points: number;
  assignedTo?: string[];
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  points?: number;
  assignedTo?: string[] | null;
  dueDate?: string | null;
  leetcodeSlug?: string | null;
}

// Task API functions

export async function getTasks(): Promise<Task[]> {
  const response = await api.get("/tasks");
  return response.data.data || response.data;
}

export async function getTask(id: string): Promise<Task> {
  const response = await api.get(`/tasks/${id}`);
  return response.data.data || response.data;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await api.post("/tasks", data);
  return response.data.data || response.data;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function assignTask(taskId: string, userIds: string[]): Promise<Task> {
  const response = await api.post(`/tasks/${taskId}/assign`, { userIds });
  return response.data.data || response.data;
}

// Submission API functions

export async function getTaskSubmissions(taskId: string): Promise<Submission[]> {
  const response = await api.get(`/tasks/${taskId}/submissions`);
  return response.data.data || response.data;
}

export async function submitSolution(taskId: string, link: string): Promise<Submission> {
  const response = await api.post(`/tasks/${taskId}/submit`, { link });
  return response.data.data || response.data;
}

export async function verifyLeetCode(
  taskId: string
): Promise<{ verified: boolean; submission: Submission; message: string }> {
  const response = await api.post(`/tasks/${taskId}/verify-leetcode`);
  return response.data.data || response.data;
}

export async function verifySubmission(subId: string, points?: number): Promise<Submission> {
  const response = await api.post(`/tasks/submissions/${subId}/verify`, { points });
  return response.data.data || response.data;
}

export async function rejectSubmission(subId: string): Promise<Submission> {
  const response = await api.post(`/tasks/submissions/${subId}/reject`);
  return response.data.data || response.data;
}

export async function getMySubmissions(): Promise<Submission[]> {
  const response = await api.get("/tasks/my-submissions");
  return response.data.data || response.data;
}

export async function getMyPoints(): Promise<number> {
  const response = await api.get("/tasks/my-points");
  return response.data.data?.points || 0;
}

// Leaderboard API function
export async function getLeaderboard(period: "month" | "semester" | "all" = "all"): Promise<LeaderboardEntry[]> {
  const response = await api.get(`/gamification/leaderboard?period=${period}`);
  return response.data.data || response.data;
}

// Helper functions

export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending Verification";
    case "VERIFIED":
      return "Verified";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function getSubmissionStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "VERIFIED":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "REJECTED":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getTaskStatus(task: Task): {
  label: string;
  color: string;
  canSubmit: boolean;
} {
  const submissions = task.userSubmissions || [];
  const hasVerified = submissions.some((s) => s.status === "VERIFIED");
  const hasPending = submissions.some((s) => s.status === "PENDING");
  const hasRejected = submissions.some((s) => s.status === "REJECTED");
  const submissionCount = submissions.length;

  if (hasVerified) {
    return {
      label: "Completed",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      canSubmit: false,
    };
  }

  if (hasPending) {
    return {
      label: "Pending Verification",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      canSubmit: false,
    };
  }

  if (hasRejected && submissionCount < 2) {
    return {
      label: "Rejected - Can Resubmit",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      canSubmit: true,
    };
  }

  if (submissionCount >= 2) {
    return {
      label: "Max Attempts Reached",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      canSubmit: false,
    };
  }

  return {
    label: "Not Submitted",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    canSubmit: task.canSubmit !== false,
  };
}
