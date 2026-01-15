import { create } from "zustand";
import {
  Task,
  Submission,
  CreateTaskInput,
  UpdateTaskInput,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  getTaskSubmissions,
  submitSolution as submitSolutionApi,
  verifySubmission as verifySubmissionApi,
  rejectSubmission as rejectSubmissionApi,
} from "@/lib/taskService";

interface TaskState {
  // Admin UI state
  submissions: Submission[]; // Submissions for selected task (admin view)
  submissionsLoading: boolean;
  editingTaskId: string | null;
  selectedTask: Task | null;

  // Mutation loading state
  mutationLoading: boolean;

  // Actions - Admin Task Management
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Actions - Submissions (Admin)
  fetchTaskSubmissions: (taskId: string) => Promise<void>;
  verifySubmission: (subId: string, points?: number) => Promise<Submission>;
  rejectSubmission: (subId: string) => Promise<Submission>;

  // Actions - Submissions (User)
  submitSolution: (taskId: string, link: string) => Promise<Submission>;

  // Actions - UI State
  setSelectedTask: (task: Task | null) => void;
  setEditingTaskId: (id: string | null) => void;
  clearSubmissions: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  submissions: [],
  submissionsLoading: false,
  editingTaskId: null,
  selectedTask: null,
  mutationLoading: false,

  // Create a new task (admin)
  createTask: async (data: CreateTaskInput) => {
    set({ mutationLoading: true });
    try {
      const task = await createTaskApi(data);
      set({ mutationLoading: false });
      return task;
    } catch (error) {
      console.error("Failed to create task:", error);
      set({ mutationLoading: false });
      throw error;
    }
  },

  // Update a task (admin)
  updateTask: async (id: string, data: UpdateTaskInput) => {
    set({ mutationLoading: true });
    try {
      const task = await updateTaskApi(id, data);
      set({
        editingTaskId: null,
        mutationLoading: false,
      });
      return task;
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ mutationLoading: false });
      throw error;
    }
  },

  // Delete a task (admin)
  deleteTask: async (id: string) => {
    set({ mutationLoading: true });
    try {
      await deleteTaskApi(id);
      const { selectedTask } = get();
      set({
        selectedTask: selectedTask?.id === id ? null : selectedTask,
        submissions: selectedTask?.id === id ? [] : get().submissions,
        mutationLoading: false,
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ mutationLoading: false });
      throw error;
    }
  },

  // Fetch submissions for a task (admin only - not cached)
  fetchTaskSubmissions: async (taskId: string) => {
    set({ submissionsLoading: true });
    try {
      const submissions = await getTaskSubmissions(taskId);
      set({ submissions, submissionsLoading: false });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // Submit a solution (user)
  // Note: Cache invalidation should be handled by the calling component using invalidateTasks()
  submitSolution: async (taskId: string, link: string) => {
    try {
      const submission = await submitSolutionApi(taskId, link);
      return submission;
    } catch (error) {
      console.error("Failed to submit solution:", error);
      throw error;
    }
  },

  // Verify a submission (admin)
  verifySubmission: async (subId: string, points?: number) => {
    set({ submissionsLoading: true });
    try {
      const submission = await verifySubmissionApi(subId, points);
      const { submissions } = get();
      set({
        submissions: submissions.map((s) =>
          s.id === subId ? { ...s, status: "VERIFIED", points: submission.points } : s
        ),
        submissionsLoading: false,
      });
      return submission;
    } catch (error) {
      console.error("Failed to verify submission:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // Reject a submission (admin)
  rejectSubmission: async (subId: string) => {
    set({ submissionsLoading: true });
    try {
      const submission = await rejectSubmissionApi(subId);
      const { submissions } = get();
      set({
        submissions: submissions.map((s) =>
          s.id === subId ? { ...s, status: "REJECTED", points: 0 } : s
        ),
        submissionsLoading: false,
      });
      return submission;
    } catch (error) {
      console.error("Failed to reject submission:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // UI State setters
  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
  setEditingTaskId: (id: string | null) => set({ editingTaskId: id }),
  clearSubmissions: () => set({ submissions: [] }),
}));
