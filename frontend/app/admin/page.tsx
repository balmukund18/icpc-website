"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Trophy,
  Calendar,
  CheckSquare,
  Megaphone,
  FileText,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  Copy,
  Pencil,
  Link2,
  ChevronDown,
  ChevronUp,
  Globe,
  User as UserIcon,
  Pin,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,

  updateUserRole,
  deleteUser,
  updateUserHandles,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
  createContest,
  deleteContest,
  updateContestResults,
  User,
  Announcement,
  Blog,
} from "@/lib/adminService";
import { getContests, Contest } from "@/lib/contestService";
import { useSessionStore } from "@/store/useSessionStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTasks, invalidateTasks } from "@/lib/hooks/useData";
import { Task, Submission, getSubmissionStatusColor } from "@/lib/taskService";

type TabType =
  | "users"
  | "contests"
  | "sessions"
  | "tasks"
  | "announcements"
  | "blogs";

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userId: string;
    userEmail: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // User detail expanded state
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // User search and filter state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [profileFilter, setProfileFilter] = useState("");

  // Data states
  const [users, setUsers] = useState<User[]>([]);

  const [contests, setContests] = useState<Contest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);

  // Session store (Zustand)
  const {
    sessions,
    loading: sessionsLoading,
    editingId,
    fetchSessions,
    addSession,
    editSession,
    removeSession,
    setEditingId,
  } = useSessionStore();

  // Tasks data via SWR
  const { tasks, isLoading: tasksLoading } = useTasks();

  // Task store (Zustand) - for mutations and admin-only operations
  const {
    submissions: taskSubmissions,
    submissionsLoading,
    editingTaskId,
    mutationLoading,
    fetchTaskSubmissions,
    createTask,
    updateTask,
    deleteTask: removeTask,
    verifySubmission,
    rejectSubmission,
    setEditingTaskId,
    clearSubmissions,
  } = useTaskStore();



  // Task form state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskAssignmentType, setTaskAssignmentType] = useState<
    "all" | "specific"
  >("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [verifyPoints, setVerifyPoints] = useState<number>(0);

  // Task edit form state
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPoints, setEditTaskPoints] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskLeetcodeUrl, setEditTaskLeetcodeUrl] = useState("");
  const [editTaskAssignmentType, setEditTaskAssignmentType] = useState<
    "all" | "specific"
  >("all");
  const [editSelectedUserIds, setEditSelectedUserIds] = useState<string[]>([]);

  // Contest form states
  const [contestTitle, setContestTitle] = useState("");
  const [contestStartTime, setContestStartTime] = useState("");
  const [contestTimer, setContestTimer] = useState("");
  const [contestHackerRankUrl, setContestHackerRankUrl] = useState("");
  // Results entry
  const [resultsContestId, setResultsContestId] = useState("");
  const [resultsText, setResultsText] = useState("");

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDetails, setSessionDetails] = useState("");
  const [sessionMeetLink, setSessionMeetLink] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  // Edit session form states
  const [editTitle, setEditTitle] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editMeetLink, setEditMeetLink] = useState("");
  const [editDate, setEditDate] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPoints, setTaskPoints] = useState("");
  const [taskLeetcodeUrl, setTaskLeetcodeUrl] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPinned, setAnnouncementPinned] = useState(false);

  // Announcement edit states
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnContent, setEditAnnContent] = useState("");
  const [editAnnPinned, setEditAnnPinned] = useState(false);

  // Blog rejection states
  const [rejectingBlogId, setRejectingBlogId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Edit handles state
  const [editingHandlesUserId, setEditingHandlesUserId] = useState<string | null>(null);
  const [editHandlesForm, setEditHandlesForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    if (user?.role === "ADMIN") return;

    const verifyRole = async () => {
      try {
        if (!user?.id) return;
        const res = await api.get(`/profile`);
        const profile = res.data?.data;
        if (profile?.role === "ADMIN") {
          updateUser({ role: profile.role, email: profile.email || user.email });
          return;
        }
      } catch {
        // Ignore errors and fall through to redirect
      }
      router.push("/dashboard");
    };

    verifyRole();
  }, [
    isAuthenticated,
    hasHydrated,
    user?.role,
    user?.id,
    user?.email,
    router,
    updateUser,
  ]);

  useEffect(() => {
    if (hasHydrated && user?.role === "ADMIN") {
      fetchDataForTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hasHydrated, user]);

  const fetchDataForTab = async (tab: TabType) => {
    setTabLoading(true);
    try {
      switch (tab) {
        case "users":
          const allUsers = await getUsers();
          setUsers(allUsers);
          break;
        case "contests":
          const contestsData = await getContests();
          setContests(contestsData);
          break;
        case "sessions":
          await fetchSessions();
          break;
        case "tasks":
          // Tasks are fetched via SWR, just fetch users for assignment dropdown
          await getUsers().then((users) => setUsers(users));
          break;
        case "announcements":
          const announcementsData = await getAnnouncements();
          setAnnouncements(announcementsData);
          break;
        case "blogs":
          const blogsData = await getPendingBlogs();
          setPendingBlogs(blogsData);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data`, error);
    } finally {
      setTabLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };



  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      showMessage("success", "Role updated successfully!");
      fetchDataForTab("users");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update role",
      );
    }
  };

  const handleDeleteUser = (
    userId: string,
    userEmail: string,
    userRole: string,
  ) => {
    // Prevent deleting admins (extra safety - backend also checks)
    if (userRole === "ADMIN") {
      showMessage("error", "Cannot delete admin users");
      return;
    }
    setDeleteConfirm({ userId, userEmail });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteUser(deleteConfirm.userId);
      showMessage("success", "User deleted successfully");
      setDeleteConfirm(null);
      fetchDataForTab("users");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to delete user",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!contestStartTime) {
      showMessage("error", "Please select a start time");
      return;
    }
    if (!contestTimer || parseInt(contestTimer) <= 0) {
      showMessage("error", "Please enter a valid duration");
      return;
    }

    setLoading(true);
    try {
      // Convert local datetime to UTC ISO string
      const localDate = new Date(contestStartTime);
      const utcISOString = localDate.toISOString();

      await createContest({
        title: contestTitle,
        hackerRankUrl: contestHackerRankUrl || undefined,
        timer: parseInt(contestTimer),
        startTime: utcISOString,
      });
      showMessage("success", "Contest created successfully!");
      setContestTitle("");
      setContestStartTime("");
      setContestTimer("");
      setContestHackerRankUrl("");
      fetchDataForTab("contests");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to create contest",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultsContestId) {
      showMessage("error", "Please select a contest");
      return;
    }
    if (!resultsText.trim()) {
      showMessage("error", "Please enter results");
      return;
    }

    setLoading(true);
    try {
      const lines = resultsText.trim().split("\n").filter((l: string) => l.trim());
      const results = lines.map((line: string, idx: number) => {
        const parts = line.split(",").map((p: string) => p.trim());
        return {
          rank: idx + 1,
          name: parts[0] || `User ${idx + 1}`,
          score: parts[1] ? parseInt(parts[1]) : 0,
          solved: parts[2] ? parseInt(parts[2]) : undefined,
        };
      });

      await updateContestResults(resultsContestId, results);
      showMessage("success", "Results saved successfully!");
      setResultsText("");
      setResultsContestId("");
      fetchDataForTab("contests");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to save results",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addSession({
        title: sessionTitle,
        details: sessionDetails || undefined,
        meetLink: sessionMeetLink,
        date: sessionDate || undefined,
      });
      showMessage("success", "Session created successfully!");
      setSessionTitle("");
      setSessionDetails("");
      setSessionMeetLink("");
      setSessionDate("");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create session";
      showMessage("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await removeSession(sessionId);
      showMessage("success", "Session deleted successfully!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to delete session",
      );
    }
  };

  const handleStartEdit = (session: (typeof sessions)[0]) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setEditDetails(session.details || "");
    setEditMeetLink(session.meetLink);
    setEditDate(
      session.date ? new Date(session.date).toISOString().slice(0, 16) : "",
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDetails("");
    setEditMeetLink("");
    setEditDate("");
  };

  const handleSaveEdit = async (sessionId: string) => {
    try {
      await editSession(sessionId, {
        title: editTitle,
        details: editDetails || undefined,
        meetLink: editMeetLink,
        date: editDate || undefined,
      });
      showMessage("success", "Session updated successfully!");
      // Reset edit form states
      setEditTitle("");
      setEditDetails("");
      setEditMeetLink("");
      setEditDate("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update session",
      );
    }
  };

  const handleCopyLink = async (meetLink: string) => {
    try {
      await navigator.clipboard.writeText(meetLink);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  const handleDeleteContest = async (contestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this contest? This will also delete all submissions.",
      )
    )
      return;
    try {
      await deleteContest(contestId);
      showMessage("success", "Contest deleted successfully!");
      fetchDataForTab("contests");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to delete contest",
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Extract slug from LeetCode URL (e.g. https://leetcode.com/problems/two-sum/ → two-sum)
      let leetcodeSlug: string | undefined;
      if (taskLeetcodeUrl.trim()) {
        const match = taskLeetcodeUrl.match(/leetcode\.com\/problems\/([^/]+)/);
        leetcodeSlug = match ? match[1] : taskLeetcodeUrl.trim();
      }

      await createTask({
        title: taskTitle,
        description: taskDesc || undefined,
        leetcodeSlug,
        points: taskPoints ? parseInt(taskPoints) : 0,
        dueDate: taskDueDate || undefined,
        assignedTo:
          taskAssignmentType === "specific"
            ? selectedUserIds
            : undefined,
      });
      showMessage("success", "Task created successfully!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPoints("");
      setTaskDueDate("");
      setTaskLeetcodeUrl("");
      setTaskAssignmentType("all");
      setSelectedUserIds([]);
      // Invalidate tasks cache to refetch
      invalidateTasks();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showMessage(
        "error",
        err.response?.data?.error || err.message || "Failed to create task",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This will also delete all submissions.",
      )
    )
      return;
    try {
      await removeTask(taskId);
      showMessage("success", "Task deleted successfully!");
      if (expandedTaskId === taskId) {
        setExpandedTaskId(null);
        clearSubmissions();
      }
      // Invalidate tasks cache to refetch
      invalidateTasks();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showMessage(
        "error",
        err.response?.data?.error || err.message || "Failed to delete task",
      );
    }
  };

  const handleToggleSubmissions = async (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      clearSubmissions();
    } else {
      setExpandedTaskId(taskId);
      await fetchTaskSubmissions(taskId);
    }
  };

  const handleStartEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || "");
    setEditTaskPoints(String(task.points));
    setEditTaskDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    );
    setEditTaskLeetcodeUrl(
      task.leetcodeSlug ? `https://leetcode.com/problems/${task.leetcodeSlug}/` : "",
    );
    setEditTaskAssignmentType(
      task.assignedTo && task.assignedTo.length > 0 ? "specific" : "all",
    );
    setEditSelectedUserIds(task.assignedTo || []);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskDesc("");
    setEditTaskPoints("");
    setEditTaskDueDate("");
    setEditTaskLeetcodeUrl("");
    setEditTaskAssignmentType("all");
    setEditSelectedUserIds([]);
  };

  const handleSaveEditTask = async (taskId: string) => {
    try {
      await updateTask(taskId, {
        title: editTaskTitle,
        description: editTaskDesc || undefined,
        points: editTaskPoints ? parseInt(editTaskPoints) : 0,
        dueDate: editTaskDueDate || null,
        assignedTo:
          editTaskAssignmentType === "specific" ? editSelectedUserIds : null,
        leetcodeSlug: (() => {
          const url = editTaskLeetcodeUrl.trim();
          if (!url) return null;
          const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
          return match ? match[1] : url;
        })(),
      });
      showMessage("success", "Task updated successfully!");
      handleCancelEditTask();
      // Invalidate tasks cache to refetch
      invalidateTasks();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showMessage(
        "error",
        err.response?.data?.error || err.message || "Failed to update task",
      );
    }
  };

  const handleOpenVerifyModal = (
    submission: Submission,
    taskPoints: number,
  ) => {
    setSelectedSubmission(submission);
    setVerifyPoints(taskPoints);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmission = async () => {
    if (!selectedSubmission) return;
    try {
      await verifySubmission(selectedSubmission.id, verifyPoints);
      showMessage(
        "success",
        `Submission verified! ${verifyPoints} points awarded.`,
      );
      setVerifyModalOpen(false);
      setSelectedSubmission(null);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showMessage(
        "error",
        err.response?.data?.error ||
        err.message ||
        "Failed to verify submission",
      );
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    if (!confirm("Are you sure you want to reject this submission?")) return;
    try {
      await rejectSubmission(subId);
      showMessage("success", "Submission rejected.");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showMessage(
        "error",
        err.response?.data?.error ||
        err.message ||
        "Failed to reject submission",
      );
    }
  };

  // Get only STUDENT users for task assignment
  const studentUsers = users.filter((u) => u.role === "STUDENT");

  const handleStartEditHandles = (u: User) => {
    const handles = (u.profile?.handles as Record<string, string>) || {};
    setEditHandlesForm({
      leetcode: handles.leetcode || "",
      codeforces: handles.codeforces || "",
      codechef: handles.codechef || "",
    });
    setEditingHandlesUserId(u.id);
  };

  const handleSaveHandles = async (userId: string) => {
    try {
      // Filter out empty handles
      const handles: Record<string, string> = {};
      Object.entries(editHandlesForm).forEach(([k, v]) => {
        if (v.trim()) handles[k] = v.trim();
      });
      await updateUserHandles(userId, handles);
      showMessage("success", "CP handles updated successfully!");
      setEditingHandlesUserId(null);
      const refreshed = await getUsers();
      setUsers(refreshed);
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Failed to update handles");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAnnouncement({
        title: announcementTitle,
        content: announcementContent,
        pinned: announcementPinned,
      });
      showMessage("success", "Announcement created successfully!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementPinned(false);
      fetchDataForTab("announcements");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to create announcement",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setEditAnnTitle(announcement.title);
    setEditAnnContent(announcement.content);
    setEditAnnPinned(announcement.pinned);
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnouncementId(null);
    setEditAnnTitle("");
    setEditAnnContent("");
    setEditAnnPinned(false);
  };

  const handleSaveEditAnnouncement = async (id: string) => {
    try {
      await updateAnnouncement(id, {
        title: editAnnTitle,
        content: editAnnContent,
        pinned: editAnnPinned,
      });
      showMessage("success", "Announcement updated successfully!");
      handleCancelEditAnnouncement();
      fetchDataForTab("announcements");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update announcement",
      );
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      showMessage("success", "Announcement deleted successfully!");
      fetchDataForTab("announcements");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to delete announcement",
      );
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, {
        pinned: !announcement.pinned,
      });
      showMessage(
        "success",
        announcement.pinned ? "Announcement unpinned" : "Announcement pinned",
      );
      fetchDataForTab("announcements");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update announcement",
      );
    }
  };

  const handleApproveBlog = async (blogId: string) => {
    try {
      await approveBlog(blogId);
      showMessage("success", "Blog approved successfully!");
      fetchDataForTab("blogs");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to approve blog",
      );
    }
  };

  const handleRejectBlog = async (blogId: string) => {
    try {
      await rejectBlog(blogId, rejectionReason || undefined);
      showMessage("success", "Blog rejected. Author has been notified.");
      setRejectingBlogId(null);
      setRejectionReason("");
      fetchDataForTab("blogs");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage(
        "error",
        err.response?.data?.message || "Failed to reject blog",
      );
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "contests", label: "Contests", icon: <Trophy className="h-4 w-4" /> },
    {
      id: "sessions",
      label: "Sessions",
      icon: <Calendar className="h-4 w-4" />,
    },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
    {
      id: "announcements",
      label: "Announcements",
      icon: <Megaphone className="h-4 w-4" />,
    },
    { id: "blogs", label: "Blogs", icon: <FileText className="h-4 w-4" /> },
  ];

  const displayedUsers = useMemo(() => {
    let result = users;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.profile?.name?.toLowerCase().includes(q)
      );
    }
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (profileFilter === "complete") {
      result = result.filter((u) => u.profile?.name);
    } else if (profileFilter === "incomplete") {
      result = result.filter((u) => !u.profile?.name);
    }
    return result;
  }, [users, userSearch, roleFilter, profileFilter]);

  if (!hasHydrated || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDataForTab(activeTab)}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500"
              : "bg-red-500/20 text-red-400 border border-red-500"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              size="sm"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              <span className="text-sm text-muted-foreground">({displayedUsers.length} of {users.length} users)</span>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
                <option value="ALUMNI">Alumni</option>
              </select>
              <select
                value={profileFilter}
                onChange={(e) => setProfileFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Profiles</option>
                <option value="complete">Profile Complete</option>
                <option value="incomplete">Profile Incomplete</option>
              </select>
            </div>

            {tabLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {/* Desktop table - hidden on mobile */}
                <table className="w-full hidden md:table">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Role
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((u) => (
                        <Fragment key={u.id}>
                          <tr className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{u.email}</td>
                            <td className="px-4 py-3 text-sm">
                              {u.profile?.name || <span className="text-muted-foreground italic">No profile</span>}
                            </td>
                            <td className="px-4 py-3">
                              <Select
                                value={u.role}
                                onValueChange={(role) =>
                                  handleUpdateRole(u.id, role)
                                }
                              >
                                <SelectTrigger className="w-28 h-8 bg-muted border-border text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-muted border-border">
                                  <SelectItem value="STUDENT">Student</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>

                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  onClick={() =>
                                    setExpandedUserId(
                                      expandedUserId === u.id ? null : u.id
                                    )
                                  }
                                >
                                  {expandedUserId === u.id ? (
                                    <><EyeOff className="h-3 w-3" /> Hide</>
                                  ) : (
                                    <><Eye className="h-3 w-3" /> View</>
                                  )}
                                </Button>
                                {u.role !== "ADMIN" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs gap-1"
                                    onClick={() =>
                                      handleDeleteUser(u.id, u.email, u.role)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedUserId === u.id && (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 bg-muted/30">
                                {u.profile ? (
                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                                      <p className="text-sm">{u.profile.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Branch</p>
                                      <p className="text-sm">{u.profile.branch}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Year</p>
                                      <p className="text-sm">{u.profile.year}</p>
                                    </div>
                                    {u.profile.contact && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                                        <p className="text-sm">{u.profile.contact}</p>
                                      </div>
                                    )}
                                    {u.profile.graduationYear && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Graduation Year</p>
                                        <p className="text-sm">{u.profile.graduationYear}</p>
                                      </div>
                                    )}
                                    {u.profile.company && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Company</p>
                                        <p className="text-sm">{u.profile.company}</p>
                                      </div>
                                    )}
                                    {u.profile.position && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Position</p>
                                        <p className="text-sm">{u.profile.position}</p>
                                      </div>
                                    )}
                                    {u.profile.location && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                                        <p className="text-sm">{u.profile.location}</p>
                                      </div>
                                    )}
                                    {u.profile.linkedIn && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">LinkedIn</p>
                                        <a href={u.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{u.profile.linkedIn}</a>
                                      </div>
                                    )}
                                    {u.profile.bio && (
                                      <div className="md:col-span-2 lg:col-span-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Bio</p>
                                        <p className="text-sm">{u.profile.bio}</p>
                                      </div>
                                    )}
                                    {u.profile.handles && Object.keys(u.profile.handles).length > 0 && (
                                      <div className="md:col-span-2 lg:col-span-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">CP Handles</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {Object.entries(u.profile.handles).map(([platform, handle]) =>
                                            handle ? (
                                              <span key={platform} className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                                                <span className="font-medium capitalize">{platform}:</span> {handle as string}
                                              </span>
                                            ) : null
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {/* Edit Handles Section */}
                                    <div className="md:col-span-2 lg:col-span-3 pt-2 border-t border-border/50">
                                      {editingHandlesUserId === u.id ? (
                                        <div className="space-y-2">
                                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Edit CP Handles</p>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {["leetcode", "codeforces", "codechef"].map((platform) => (
                                              <div key={platform}>
                                                <label className="text-xs text-muted-foreground capitalize">{platform}</label>
                                                <Input
                                                  placeholder={`${platform} username`}
                                                  value={editHandlesForm[platform] || ""}
                                                  onChange={(e) => setEditHandlesForm({ ...editHandlesForm, [platform]: e.target.value })}
                                                  className="h-8 text-sm"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSaveHandles(u.id)}>Save</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingHandlesUserId(null)}>Cancel</Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleStartEditHandles(u)}>
                                          <Pencil className="h-3 w-3" /> Edit CP Handles
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">This user has not completed their profile yet.</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile card view - visible only on mobile */}
                <div className="md:hidden divide-y divide-border">
                  {displayedUsers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    displayedUsers.map((u) => (
                      <div key={u.id} className="p-3 sm:p-4 space-y-2">
                        <p className="text-sm font-medium break-all">{u.email}</p>
                        {u.profile?.name && (
                          <p className="text-xs text-muted-foreground">{u.profile.name}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={u.role}
                            onValueChange={(role) =>
                              handleUpdateRole(u.id, role)
                            }
                          >
                            <SelectTrigger className="w-24 h-7 bg-muted border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-muted border-border">
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="ALUMNI">Alumni</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1.5 ml-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 px-2"
                              onClick={() =>
                                setExpandedUserId(
                                  expandedUserId === u.id ? null : u.id
                                )
                              }
                            >
                              {expandedUserId === u.id ? (
                                <><EyeOff className="h-3 w-3" /> Hide</>
                              ) : (
                                <><Eye className="h-3 w-3" /> View</>
                              )}
                            </Button>
                            {u.role !== "ADMIN" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() =>
                                  handleDeleteUser(u.id, u.email, u.role)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                        {expandedUserId === u.id && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            {u.profile ? (
                              <div className="grid gap-3 grid-cols-2">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                                  <p className="text-sm">{u.profile.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Branch</p>
                                  <p className="text-sm">{u.profile.branch}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Year</p>
                                  <p className="text-sm">{u.profile.year}</p>
                                </div>
                                {u.profile.contact && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                                    <p className="text-sm">{u.profile.contact}</p>
                                  </div>
                                )}
                                {u.profile.graduationYear && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Graduation Year</p>
                                    <p className="text-sm">{u.profile.graduationYear}</p>
                                  </div>
                                )}
                                {u.profile.company && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Company</p>
                                    <p className="text-sm">{u.profile.company}</p>
                                  </div>
                                )}
                                {u.profile.position && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Position</p>
                                    <p className="text-sm">{u.profile.position}</p>
                                  </div>
                                )}
                                {u.profile.location && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                                    <p className="text-sm">{u.profile.location}</p>
                                  </div>
                                )}
                                {u.profile.linkedIn && (
                                  <div className="col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">LinkedIn</p>
                                    <a href={u.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{u.profile.linkedIn}</a>
                                  </div>
                                )}
                                {u.profile.bio && (
                                  <div className="col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Bio</p>
                                    <p className="text-sm">{u.profile.bio}</p>
                                  </div>
                                )}
                                {u.profile.handles && Object.keys(u.profile.handles).length > 0 && (
                                  <div className="col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">CP Handles</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {Object.entries(u.profile.handles).map(([platform, handle]) =>
                                        handle ? (
                                          <span key={platform} className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                                            <span className="font-medium capitalize">{platform}:</span> {handle as string}
                                          </span>
                                        ) : null
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Edit Handles Section (Mobile) */}
                                <div className="col-span-2 pt-2 border-t border-border/50">
                                  {editingHandlesUserId === u.id ? (
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Edit CP Handles</p>
                                      <div className="grid grid-cols-1 gap-2">
                                        {["leetcode", "codeforces", "codechef"].map((platform) => (
                                          <div key={platform}>
                                            <label className="text-xs text-muted-foreground capitalize">{platform}</label>
                                            <Input
                                              placeholder={`${platform} username`}
                                              value={editHandlesForm[platform] || ""}
                                              onChange={(e) => setEditHandlesForm({ ...editHandlesForm, [platform]: e.target.value })}
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSaveHandles(u.id)}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingHandlesUserId(null)}>Cancel</Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleStartEditHandles(u)}>
                                      <Pencil className="h-3 w-3" /> Edit CP Handles
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">This user has not completed their profile yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === "contests" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Create Contest</CardTitle>
                <CardDescription>
                  Set up a new competitive programming contest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContest} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Contest Title *</Label>
                    <Input
                      placeholder="e.g. Weekly Contest #45"
                      value={contestTitle}
                      onChange={(e) => setContestTitle(e.target.value)}
                      className="bg-muted border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">HackerRank Contest URL</Label>
                    <Input
                      placeholder="https://www.hackerrank.com/contests/..."
                      value={contestHackerRankUrl}
                      onChange={(e) => setContestHackerRankUrl(e.target.value)}
                      className="bg-muted border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to the HackerRank contest page (students will be redirected here)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Start Time *</Label>
                    <Input
                      type="datetime-local"
                      value={contestStartTime}
                      onChange={(e) => setContestStartTime(e.target.value)}
                      className="bg-muted border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Schedule when the contest will start (your local timezone)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Duration (minutes) *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 90"
                      value={contestTimer}
                      onChange={(e) => setContestTimer(e.target.value)}
                      className="bg-muted border-border"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Contest"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Enter Results</CardTitle>
                <CardDescription>
                  Enter leaderboard results from HackerRank after contest ends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveResults} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Select Contest</Label>
                    <Select
                      value={resultsContestId}
                      onValueChange={setResultsContestId}
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue placeholder="Select a contest" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        {contests.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Results (one per line)</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Format: Name, Score, Problems Solved (one line per participant)
                    </p>
                    <textarea
                      placeholder={`John Doe, 450, 3\nJane Smith, 400, 2\nBob Wilson, 350, 2`}
                      value={resultsText}
                      onChange={(e) => setResultsText(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Results"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contest List */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground">Existing Contests</CardTitle>
              </CardHeader>
              <CardContent>
                {tabLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No contests yet
                      </p>
                    ) : (
                      contests.map((c) => {
                        const startTime = new Date(c.startTime);
                        const now = new Date();
                        const isUpcoming = startTime > now;
                        const endTime = new Date(
                          startTime.getTime() + c.timer * 60 * 1000,
                        );
                        const isEnded = now > endTime;
                        const status = isUpcoming
                          ? "upcoming"
                          : isEnded
                            ? "ended"
                            : "active";

                        return (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{c.title}</p>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : status === "upcoming"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-muted-foreground"
                                    }`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {c.timer} min
                                {c.hackerRankUrl && " • HackerRank"}
                                {c.results && " • Results posted"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Starts: {startTime.toLocaleString()}
                              </p>
                              {c.hackerRankUrl && (
                                <a
                                  href={c.hackerRankUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  Open on HackerRank ↗
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/contests/${c.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteContest(c.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Create Session</CardTitle>
                <CardDescription>
                  Schedule a learning session or workshop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Session Title *</Label>
                    <Input
                      placeholder="e.g. Intro to Dynamic Programming"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="bg-muted border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Details</Label>
                    <textarea
                      placeholder="Session details..."
                      value={sessionDetails}
                      onChange={(e) => setSessionDetails(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Meeting Link *</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={sessionMeetLink}
                        onChange={(e) => setSessionMeetLink(e.target.value)}
                        className="bg-muted border-border pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Google Meet, Zoom, or any video call URL
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || sessionsLoading}
                    className="w-full"
                  >
                    {loading || sessionsLoading
                      ? "Creating..."
                      : "Create Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Existing Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {tabLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No sessions yet
                      </p>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 bg-muted/50 rounded-lg"
                        >
                          {editingId === s.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Title *
                                </Label>
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="bg-muted border-border h-9"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Details
                                </Label>
                                <textarea
                                  value={editDetails}
                                  onChange={(e) =>
                                    setEditDetails(e.target.value)
                                  }
                                  className="w-full h-20 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Meeting Link *
                                </Label>
                                <Input
                                  type="url"
                                  value={editMeetLink}
                                  onChange={(e) =>
                                    setEditMeetLink(e.target.value)
                                  }
                                  className="bg-muted border-border h-9"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Date & Time
                                </Label>
                                <Input
                                  type="datetime-local"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="bg-muted border-border h-9"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(s.id)}
                                  disabled={
                                    !editTitle ||
                                    !editMeetLink ||
                                    sessionsLoading
                                  }
                                  className="gap-1"
                                >
                                  <Check className="h-4 w-4" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-foreground">
                                  {s.title}
                                </p>
                                {s.details && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {s.details}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {s.date
                                    ? new Date(s.date).toLocaleString()
                                    : "No date set"}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-blue-400">
                                  <Link2 className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">
                                    {s.meetLink}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleJoinMeeting(s.meetLink)}
                                  className="gap-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Join
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLink(s.meetLink)}
                                  className="gap-1"
                                >
                                  <Copy className="h-4 w-4" />
                                  Copy Link
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartEdit(s)}
                                  className="gap-1"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteSession(s.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create Task Form */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Create Task</CardTitle>
                  <CardDescription>
                    Create a new task for students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Task Title *</Label>
                      <Input
                        placeholder="e.g. Solve 5 DP problems"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="bg-muted border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <textarea
                        placeholder="Task details..."
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        className="w-full h-24 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">LeetCode Problem URL</Label>
                      <Input
                        placeholder="https://leetcode.com/problems/two-sum/"
                        value={taskLeetcodeUrl}
                        onChange={(e) => setTaskLeetcodeUrl(e.target.value)}
                        className="bg-muted border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional. Students can auto-verify via LeetCode if provided.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Points *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="100"
                          value={taskPoints}
                          onChange={(e) => setTaskPoints(e.target.value)}
                          className="bg-muted border-border"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                        <Input
                          type="datetime-local"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>

                    {/* Assignment Type */}
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">Assign To</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="assignmentType"
                            checked={taskAssignmentType === "all"}
                            onChange={() => {
                              setTaskAssignmentType("all");
                              setSelectedUserIds([]);
                            }}
                            className="text-blue-500"
                          />
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">All Students</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="assignmentType"
                            checked={taskAssignmentType === "specific"}
                            onChange={() => setTaskAssignmentType("specific")}
                            className="text-blue-500"
                          />
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Specific Users</span>
                        </label>
                      </div>

                      {taskAssignmentType === "specific" && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 p-2 bg-muted border border-border rounded-md min-h-[40px]">
                            {selectedUserIds.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                No users selected
                              </span>
                            ) : (
                              selectedUserIds.map((userId) => {
                                const u = studentUsers.find(
                                  (su) => su.id === userId,
                                );
                                return (
                                  <span
                                    key={userId}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                  >
                                    {u?.email || userId}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedUserIds(
                                          selectedUserIds.filter(
                                            (id) => id !== userId,
                                          ),
                                        )
                                      }
                                      className="hover:text-blue-300"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                );
                              })
                            )}
                          </div>
                          <Select
                            value=""
                            onValueChange={(userId) => {
                              if (!selectedUserIds.includes(userId)) {
                                setSelectedUserIds([
                                  ...selectedUserIds,
                                  userId,
                                ]);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-muted border-border">
                              <SelectValue placeholder="Add a student..." />
                            </SelectTrigger>
                            <SelectContent className="bg-muted border-border max-h-48">
                              {studentUsers
                                .filter((u) => !selectedUserIds.includes(u.id))
                                .map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.email}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || mutationLoading}
                      className="w-full"
                    >
                      {loading || mutationLoading
                        ? "Creating..."
                        : "Create Task"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Existing Tasks</CardTitle>
                  <CardDescription>
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""} created
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tabLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {tasksLoading ? (
                        <p className="text-muted-foreground text-center py-4">
                          Loading...
                        </p>
                      ) : tasks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No tasks yet
                        </p>
                      ) : (
                        tasks.map((task) => {
                          const isExpanded = expandedTaskId === task.id;
                          const isEditing = editingTaskId === task.id;
                          const isOverdue =
                            task.dueDate && new Date(task.dueDate) < new Date();

                          return (
                            <div
                              key={task.id}
                              className="bg-muted/50 rounded-lg overflow-hidden"
                            >
                              {isEditing ? (
                                // Edit Mode
                                <div className="p-4 space-y-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Title *
                                    </Label>
                                    <Input
                                      value={editTaskTitle}
                                      onChange={(e) =>
                                        setEditTaskTitle(e.target.value)
                                      }
                                      className="bg-muted border-border h-9"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Description
                                    </Label>
                                    <textarea
                                      value={editTaskDesc}
                                      onChange={(e) =>
                                        setEditTaskDesc(e.target.value)
                                      }
                                      className="w-full h-20 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">
                                        Points
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={editTaskPoints}
                                        onChange={(e) =>
                                          setEditTaskPoints(e.target.value)
                                        }
                                        className="bg-muted border-border h-9"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">
                                        Due Date
                                      </Label>
                                      <Input
                                        type="datetime-local"
                                        value={editTaskDueDate}
                                        onChange={(e) =>
                                          setEditTaskDueDate(e.target.value)
                                        }
                                        className="bg-muted border-border h-9"
                                      />
                                    </div>
                                  </div>

                                  {/* LeetCode URL */}
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      LeetCode Problem URL
                                    </Label>
                                    <Input
                                      placeholder="https://leetcode.com/problems/two-sum/description/"
                                      value={editTaskLeetcodeUrl}
                                      onChange={(e) =>
                                        setEditTaskLeetcodeUrl(e.target.value)
                                      }
                                      className="bg-muted border-border h-9"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Optional. Students can auto-verify via LeetCode if provided.
                                    </p>
                                  </div>

                                  {/* Edit Assignment Type */}
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Assign To
                                    </Label>
                                    <div className="flex gap-4">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          checked={
                                            editTaskAssignmentType === "all"
                                          }
                                          onChange={() => {
                                            setEditTaskAssignmentType("all");
                                            setEditSelectedUserIds([]);
                                          }}
                                          className="text-blue-500"
                                        />
                                        <span className="text-xs">All</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          checked={
                                            editTaskAssignmentType ===
                                            "specific"
                                          }
                                          onChange={() =>
                                            setEditTaskAssignmentType(
                                              "specific",
                                            )
                                          }
                                          className="text-blue-500"
                                        />
                                        <span className="text-xs">
                                          Specific
                                        </span>
                                      </label>
                                    </div>
                                    {editTaskAssignmentType === "specific" && (
                                      <Select
                                        value=""
                                        onValueChange={(userId) => {
                                          if (
                                            !editSelectedUserIds.includes(
                                              userId,
                                            )
                                          ) {
                                            setEditSelectedUserIds([
                                              ...editSelectedUserIds,
                                              userId,
                                            ]);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="bg-muted border-border h-8 text-xs">
                                          <SelectValue placeholder="Add user..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-muted border-border max-h-32">
                                          {studentUsers
                                            .filter(
                                              (u) =>
                                                !editSelectedUserIds.includes(
                                                  u.id,
                                                ),
                                            )
                                            .map((u) => (
                                              <SelectItem
                                                key={u.id}
                                                value={u.id}
                                                className="text-xs"
                                              >
                                                {u.email}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    {editTaskAssignmentType === "specific" &&
                                      editSelectedUserIds.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {editSelectedUserIds.map((userId) => {
                                            const u = studentUsers.find(
                                              (su) => su.id === userId,
                                            );
                                            return (
                                              <span
                                                key={userId}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs"
                                              >
                                                {u?.email?.split("@")[0] ||
                                                  userId.slice(0, 8)}
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setEditSelectedUserIds(
                                                      editSelectedUserIds.filter(
                                                        (id) => id !== userId,
                                                      ),
                                                    )
                                                  }
                                                  className="hover:text-blue-300"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSaveEditTask(task.id)
                                      }
                                      disabled={
                                        !editTaskTitle || mutationLoading
                                      }
                                      className="gap-1"
                                    >
                                      <Check className="h-4 w-4" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEditTask}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // View Mode
                                <>
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="font-medium text-foreground truncate">
                                            {task.title}
                                          </p>
                                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                                            {task.points} pts
                                          </span>
                                          {task.assignedTo &&
                                            task.assignedTo.length > 0 ? (
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                              {task.assignedTo.length} user
                                              {task.assignedTo.length !== 1
                                                ? "s"
                                                : ""}
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                              All
                                            </span>
                                          )}
                                        </div>
                                        {task.description && (
                                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                          {task.dueDate && (
                                            <span
                                              className={
                                                isOverdue ? "text-red-400" : ""
                                              }
                                            >
                                              Due:{" "}
                                              {new Date(
                                                task.dueDate,
                                              ).toLocaleString()}
                                              {isOverdue && " (Overdue)"}
                                            </span>
                                          )}
                                          <span>
                                            Created:{" "}
                                            {new Date(
                                              task.createdAt,
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleToggleSubmissions(task.id)
                                          }
                                          className="h-8 w-8 p-0"
                                          title="View Submissions"
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleStartEditTask(task)
                                          }
                                          className="h-8 w-8 p-0"
                                          title="Edit"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleDeleteTask(task.id)
                                          }
                                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                          title="Delete"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Submissions Panel */}
                                  {isExpanded && (
                                    <div className="border-t border-border bg-card/50 p-4">
                                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                        Submissions ({taskSubmissions.length})
                                      </h4>
                                      {submissionsLoading ? (
                                        <p className="text-sm text-muted-foreground">
                                          Loading submissions...
                                        </p>
                                      ) : taskSubmissions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                          No submissions yet
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {taskSubmissions.map((sub) => {
                                            const isLate =
                                              task.dueDate &&
                                              new Date(sub.createdAt) >
                                              new Date(task.dueDate);
                                            return (
                                              <div
                                                key={sub.id}
                                                className="flex items-center justify-between gap-2 p-2 bg-muted rounded text-sm"
                                              >
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-muted-foreground truncate">
                                                      {sub.user?.email ||
                                                        sub.userId}
                                                    </span>
                                                    <span
                                                      className={`px-2 py-0.5 rounded text-xs font-medium ${getSubmissionStatusColor(sub.status)}`}
                                                    >
                                                      {sub.status}
                                                    </span>
                                                    {sub.status ===
                                                      "VERIFIED" && (
                                                        <span className="text-xs text-purple-400">
                                                          +{sub.points} pts
                                                        </span>
                                                      )}
                                                    {isLate && (
                                                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                                        Late
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 mt-1">
                                                    <a
                                                      href={sub.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs text-blue-400 hover:underline truncate max-w-[200px]"
                                                    >
                                                      {sub.link}
                                                    </a>
                                                    <span className="text-xs text-muted-foreground">
                                                      {new Date(
                                                        sub.createdAt,
                                                      ).toLocaleString()}
                                                    </span>
                                                  </div>
                                                </div>
                                                {sub.status === "PENDING" && (
                                                  <div className="flex gap-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        handleOpenVerifyModal(
                                                          sub,
                                                          task.points,
                                                        )
                                                      }
                                                      className="h-7 text-xs gap-1 text-green-400 border-green-400/50 hover:bg-green-400/10"
                                                    >
                                                      <Check className="h-3 w-3" />
                                                      Verify
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        handleRejectSubmission(
                                                          sub.id,
                                                        )
                                                      }
                                                      className="h-7 text-xs gap-1 text-red-400 border-red-400/50 hover:bg-red-400/10"
                                                    >
                                                      <X className="h-3 w-3" />
                                                      Reject
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Verify Modal */}
            {verifyModalOpen && selectedSubmission && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="bg-card border-border w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Verify Submission
                    </CardTitle>
                    <CardDescription>
                      Award points for this submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>User:</strong>{" "}
                        {selectedSubmission.user?.email ||
                          selectedSubmission.userId}
                      </p>
                      <p className="mt-1">
                        <strong>Link:</strong>{" "}
                        <a
                          href={selectedSubmission.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {selectedSubmission.link}
                        </a>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Points to Award</Label>
                      <Input
                        type="number"
                        min="0"
                        value={verifyPoints}
                        onChange={(e) =>
                          setVerifyPoints(Number(e.target.value))
                        }
                        className="bg-muted border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Default task points. Adjust if needed.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleVerifySubmission}
                        className="flex-1 gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Verify & Award {verifyPoints} pts
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVerifyModalOpen(false);
                          setSelectedSubmission(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Create Announcement
                </CardTitle>
                <CardDescription>
                  Post a new announcement for all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Title *</Label>
                    <Input
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="bg-muted border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Content *</Label>
                    <textarea
                      placeholder="Announcement content..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pinned"
                      checked={announcementPinned}
                      onChange={(e) => setAnnouncementPinned(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-muted text-yellow-500 focus:ring-yellow-500"
                    />
                    <Label
                      htmlFor="pinned"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Pin className="h-4 w-4 text-yellow-500" />
                      Pin this announcement
                    </Label>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Post Announcement"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">All Announcements</CardTitle>
                <CardDescription>
                  {announcements.length} announcement
                  {announcements.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tabLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {announcements.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No announcements yet
                      </p>
                    ) : (
                      announcements.map((a) => {
                        const isEditing = editingAnnouncementId === a.id;

                        return (
                          <div
                            key={a.id}
                            className={`p-4 rounded-lg ${a.pinned
                              ? "bg-yellow-500/10 border-l-4 border-yellow-500"
                              : "bg-muted/50"
                              }`}
                          >
                            {isEditing ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">
                                    Title *
                                  </Label>
                                  <Input
                                    value={editAnnTitle}
                                    onChange={(e) =>
                                      setEditAnnTitle(e.target.value)
                                    }
                                    className="bg-muted border-border h-9"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">
                                    Content *
                                  </Label>
                                  <textarea
                                    value={editAnnContent}
                                    onChange={(e) =>
                                      setEditAnnContent(e.target.value)
                                    }
                                    className="w-full h-24 px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none"
                                    required
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`edit-pinned-${a.id}`}
                                    checked={editAnnPinned}
                                    onChange={(e) =>
                                      setEditAnnPinned(e.target.checked)
                                    }
                                    className="w-4 h-4 rounded border-gray-600 bg-muted text-yellow-500 focus:ring-yellow-500"
                                  />
                                  <Label
                                    htmlFor={`edit-pinned-${a.id}`}
                                    className="flex items-center gap-1 cursor-pointer text-sm"
                                  >
                                    <Pin className="h-3 w-3 text-yellow-500" />
                                    Pinned
                                  </Label>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveEditAnnouncement(a.id)
                                    }
                                    disabled={!editAnnTitle || !editAnnContent}
                                    className="gap-1"
                                  >
                                    <Check className="h-4 w-4" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEditAnnouncement}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {a.pinned && (
                                        <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                      )}
                                      <p className="font-medium text-foreground">
                                        {a.title}
                                      </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                      {a.content}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {new Date(a.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleTogglePin(a)}
                                      className={`h-8 w-8 p-0 ${a.pinned
                                        ? "text-yellow-500 hover:text-yellow-400"
                                        : "text-muted-foreground hover:text-yellow-500"
                                        }`}
                                      title={a.pinned ? "Unpin" : "Pin"}
                                    >
                                      <Pin className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleStartEditAnnouncement(a)
                                      }
                                      className="h-8 w-8 p-0"
                                      title="Edit"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteAnnouncement(a.id)
                                      }
                                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                      title="Delete"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Pending Blog Approvals
              </CardTitle>
              <CardDescription>
                Review and approve or reject blog posts submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBlogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No pending blogs to review
                    </p>
                  ) : (
                    pendingBlogs.map((blog) => {
                      const isRejecting = rejectingBlogId === blog.id;

                      return (
                        <div
                          key={blog.id}
                          className="p-4 bg-muted/50 rounded-lg space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground">
                                {blog.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>
                                  By: {blog.author?.name || blog.authorId}
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    blog.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {blog.tags.slice(0, 5).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {blog.tags.length > 5 && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                      +{blog.tags.length - 5}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {!isRejecting && (
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleApproveBlog(blog.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => setRejectingBlogId(blog.id)}
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Blog content preview */}
                          <div
                            className="text-sm text-muted-foreground line-clamp-3 prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                          />

                          {/* View full blog link */}
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-blue-400 hover:text-blue-300"
                            onClick={() =>
                              window.open(`/blog/${blog.id}`, "_blank")
                            }
                          >
                            View full blog →
                          </Button>

                          {/* Rejection form */}
                          {isRejecting && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm text-red-400">
                                  Rejection Reason (optional)
                                </Label>
                                <textarea
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  placeholder="Provide feedback to help the author improve their blog..."
                                  className="w-full h-20 px-3 py-2 bg-muted border border-red-500/30 rounded-md text-sm resize-none text-foreground placeholder:text-muted-foreground"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectBlog(blog.id)}
                                  className="gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  Confirm Rejection
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingBlogId(null);
                                    setRejectionReason("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete User</h3>
            <p className="text-muted-foreground text-sm mb-1">
              Are you sure you want to delete <strong className="text-foreground">{deleteConfirm.userEmail}</strong>?
            </p>
            <p className="text-muted-foreground text-xs mb-5">
              This will permanently delete all their data including profile, task submissions, contest submissions, and blogs. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-muted"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDeleteUser}
                disabled={deleting}
              >
                {deleting ? (
                  <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-3 w-3 mr-1" /> Delete</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
