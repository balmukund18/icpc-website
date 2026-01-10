"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
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
  ArrowLeft,
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
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  updateUserRole,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPendingBlogs,
  approveBlog,
  createContest,
  addProblemToContest,
  deleteContest,
  User,
  Announcement,
  Blog,
} from "@/lib/adminService";
import { getContests, Contest } from "@/lib/contestService";
import { useSessionStore } from "@/store/useSessionStore";
import { useTaskStore } from "@/store/useTaskStore";
import {
  Task,
  Submission,
  getSubmissionStatusColor,
} from "@/lib/taskService";

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
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
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

  // Task store (Zustand)
  const {
    tasks,
    submissions: taskSubmissions,
    loading: tasksLoading,
    submissionsLoading,
    editingTaskId,
    fetchTasks,
    fetchTaskSubmissions,
    createTask,
    updateTask,
    deleteTask: removeTask,
    verifySubmission,
    rejectSubmission,
    setEditingTaskId,
    clearSubmissions,
  } = useTaskStore();

  // User filter
  const [userFilter, setUserFilter] = useState<"all" | "pending">("all");

  // Task form state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskAssignmentType, setTaskAssignmentType] = useState<"all" | "specific">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [verifyPoints, setVerifyPoints] = useState<number>(0);

  // Task edit form state
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPoints, setEditTaskPoints] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskAssignmentType, setEditTaskAssignmentType] = useState<"all" | "specific">("all");
  const [editSelectedUserIds, setEditSelectedUserIds] = useState<string[]>([]);

  // Form states
  const [contestTitle, setContestTitle] = useState("");
  const [contestStartTime, setContestStartTime] = useState("");
  const [contestTimer, setContestTimer] = useState("");
  const [selectedContestId, setSelectedContestId] = useState("");
  const [problemName, setProblemName] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [problemTags, setProblemTags] = useState("");
  const [problemTimeLimit, setProblemTimeLimit] = useState("1");
  const [problemMemoryLimit, setProblemMemoryLimit] = useState("256");
  const [sampleTestCases, setSampleTestCases] = useState("");
  const [sampleTestCasesError, setSampleTestCasesError] = useState<string | null>(null);
  const [sampleTestCasesCount, setSampleTestCasesCount] = useState<number>(0);
  const [hiddenTestCases, setHiddenTestCases] = useState("");
  const [hiddenTestCasesError, setHiddenTestCasesError] = useState<string | null>(null);
  const [hiddenTestCasesCount, setHiddenTestCasesCount] = useState<number>(0);

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

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPinned, setAnnouncementPinned] = useState(false);

  // Announcement edit states
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnContent, setEditAnnContent] = useState("");
  const [editAnnPinned, setEditAnnPinned] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  useEffect(() => {
    if (hasHydrated && user?.role === "ADMIN") {
      fetchDataForTab(activeTab);
    }
  }, [activeTab, hasHydrated, user]);

  const fetchDataForTab = async (tab: TabType) => {
    try {
      switch (tab) {
        case "users":
          const [allUsers, pending] = await Promise.all([
            getUsers(),
            getPendingUsers(),
          ]);
          setUsers(allUsers);
          setPendingUsers(pending);
          break;
        case "contests":
          const contestsData = await getContests();
          setContests(contestsData);
          break;
        case "sessions":
          await fetchSessions();
          break;
        case "tasks":
          await Promise.all([
            fetchTasks(),
            // Also fetch users for assignment dropdown
            getUsers().then((users) => setUsers(users)),
          ]);
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
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      showMessage("success", "User approved successfully!");
      fetchDataForTab("users");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to approve user"
      );
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      showMessage("success", "Role updated successfully!");
      fetchDataForTab("users");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update role"
      );
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
        timer: parseInt(contestTimer),
        startTime: utcISOString,
      });
      showMessage("success", "Contest created successfully!");
      setContestTitle("");
      setContestStartTime("");
      setContestTimer("");
      fetchDataForTab("contests");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create contest"
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate test cases JSON in real-time
  const validateTestCases = (
    value: string,
    setError: (e: string | null) => void,
    setCount: (c: number) => void
  ) => {
    if (!value.trim()) {
      setError(null);
      setCount(0);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setError("Must be an array of test cases");
        setCount(0);
        return;
      }
      for (let i = 0; i < parsed.length; i++) {
        if (typeof parsed[i].input !== "string" || typeof parsed[i].output !== "string") {
          setError(`Test case ${i + 1}: must have "input" and "output" as strings`);
          setCount(0);
          return;
        }
      }
      setError(null);
      setCount(parsed.length);
    } catch (e) {
      setError("Invalid JSON format");
      setCount(0);
    }
  };

  const formatTestCasesJSON = (
    value: string,
    setValue: (v: string) => void
  ) => {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Can't format invalid JSON
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestId) {
      showMessage("error", "Please select a contest");
      return;
    }
    if (sampleTestCasesError) {
      showMessage("error", "Please fix sample test cases JSON errors");
      return;
    }
    if (hiddenTestCasesError) {
      showMessage("error", "Please fix hidden test cases JSON errors");
      return;
    }
    if (sampleTestCasesCount === 0) {
      showMessage("error", "At least 1 sample test case is required");
      return;
    }
    setLoading(true);
    try {
      let sampleTCs: { input: string; output: string }[] = [];
      let hiddenTCs: { input: string; output: string }[] = [];
      
      if (sampleTestCases.trim()) {
        sampleTCs = JSON.parse(sampleTestCases);
      }
      if (hiddenTestCases.trim()) {
        hiddenTCs = JSON.parse(hiddenTestCases);
      }
      
      // Parse tags from comma-separated string
      const tags = problemTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await addProblemToContest(selectedContestId, {
        name: problemName,
        description: problemDescription,
        difficulty: problemDifficulty,
        tags: tags.length > 0 ? tags : undefined,
        constraints: {
          timeLimit: parseFloat(problemTimeLimit) || 1,
          memoryLimit: parseInt(problemMemoryLimit) || 256,
        },
        sampleTestCases: sampleTCs,
        hiddenTestCases: hiddenTCs,
      });
      showMessage("success", "Problem added successfully!");
      setProblemName("");
      setProblemDescription("");
      setProblemDifficulty("Medium");
      setProblemTags("");
      setProblemTimeLimit("1");
      setProblemMemoryLimit("256");
      setSampleTestCases("");
      setSampleTestCasesError(null);
      setSampleTestCasesCount(0);
      setHiddenTestCases("");
      setHiddenTestCasesError(null);
      setHiddenTestCasesCount(0);
      fetchDataForTab("contests");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to add problem"
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
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to create session";
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
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete session"
      );
    }
  };

  const handleStartEdit = (session: typeof sessions[0]) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setEditDetails(session.details || "");
    setEditMeetLink(session.meetLink);
    setEditDate(session.date ? new Date(session.date).toISOString().slice(0, 16) : "");
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
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update session"
      );
    }
  };

  const handleCopyLink = async (meetLink: string) => {
    try {
      await navigator.clipboard.writeText(meetLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  const handleDeleteContest = async (contestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this contest? This will also delete all submissions."
      )
    )
      return;
    try {
      await deleteContest(contestId);
      showMessage("success", "Contest deleted successfully!");
      fetchDataForTab("contests");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete contest"
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({
        title: taskTitle,
        description: taskDesc || undefined,
        points: taskPoints ? parseInt(taskPoints) : 0,
        dueDate: taskDueDate || undefined,
        assignedTo: taskAssignmentType === "specific" ? selectedUserIds : undefined,
      });
      showMessage("success", "Task created successfully!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPoints("");
      setTaskDueDate("");
      setTaskAssignmentType("all");
      setSelectedUserIds([]);
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.error || error.message || "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This will also delete all submissions.")) return;
    try {
      await removeTask(taskId);
      showMessage("success", "Task deleted successfully!");
      if (expandedTaskId === taskId) {
        setExpandedTaskId(null);
        clearSubmissions();
      }
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.error || error.message || "Failed to delete task"
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
    setEditTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
    setEditTaskAssignmentType(task.assignedTo && task.assignedTo.length > 0 ? "specific" : "all");
    setEditSelectedUserIds(task.assignedTo || []);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskDesc("");
    setEditTaskPoints("");
    setEditTaskDueDate("");
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
        assignedTo: editTaskAssignmentType === "specific" ? editSelectedUserIds : null,
      });
      showMessage("success", "Task updated successfully!");
      handleCancelEditTask();
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.error || error.message || "Failed to update task"
      );
    }
  };

  const handleOpenVerifyModal = (submission: Submission, taskPoints: number) => {
    setSelectedSubmission(submission);
    setVerifyPoints(taskPoints);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmission = async () => {
    if (!selectedSubmission) return;
    try {
      await verifySubmission(selectedSubmission.id, verifyPoints);
      showMessage("success", `Submission verified! ${verifyPoints} points awarded.`);
      setVerifyModalOpen(false);
      setSelectedSubmission(null);
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.error || error.message || "Failed to verify submission"
      );
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    if (!confirm("Are you sure you want to reject this submission?")) return;
    try {
      await rejectSubmission(subId);
      showMessage("success", "Submission rejected.");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.error || error.message || "Failed to reject submission"
      );
    }
  };

  // Get only STUDENT users for task assignment
  const studentUsers = users.filter((u) => u.role === "STUDENT" && u.approved);

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
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create announcement"
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
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update announcement"
      );
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      showMessage("success", "Announcement deleted successfully!");
      fetchDataForTab("announcements");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete announcement"
      );
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, { pinned: !announcement.pinned });
      showMessage("success", announcement.pinned ? "Announcement unpinned" : "Announcement pinned");
      fetchDataForTab("announcements");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update announcement"
      );
    }
  };

  const handleApproveBlog = async (blogId: string) => {
    try {
      await approveBlog(blogId);
      showMessage("success", "Blog approved successfully!");
      fetchDataForTab("blogs");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to approve blog"
      );
    }
  };

  if (!hasHydrated || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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

  const displayedUsers = userFilter === "pending" ? pendingUsers : users;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500"
                : "bg-red-500/20 text-red-400 border border-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
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
              <Select
                value={userFilter}
                onValueChange={(v) => setUserFilter(v as "all" | "pending")}
              >
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">
                    All Users ({users.length})
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending ({pendingUsers.length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {displayedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">{u.email}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={u.role}
                            onValueChange={(role) =>
                              handleUpdateRole(u.id, role)
                            }
                          >
                            <SelectTrigger className="w-28 h-8 bg-gray-800 border-gray-700 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="ALUMNI">Alumni</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              u.approved
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {u.approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {!u.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleApproveUser(u.id)}
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === "contests" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Create Contest</CardTitle>
                <CardDescription>
                  Set up a new competitive programming contest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContest} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contest Title *</Label>
                    <Input
                      placeholder="e.g. Weekly Contest #45"
                      value={contestTitle}
                      onChange={(e) => setContestTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="datetime-local"
                      value={contestStartTime}
                      onChange={(e) => setContestStartTime(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Schedule when the contest will start (your local timezone)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 90"
                      value={contestTimer}
                      onChange={(e) => setContestTimer(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Contest"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Add Problem</CardTitle>
                <CardDescription>
                  Add a problem to an existing contest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProblem} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Contest</Label>
                    <Select
                      value={selectedContestId}
                      onValueChange={setSelectedContestId}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select a contest" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {contests.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Problem Name *</Label>
                    <Input
                      placeholder="e.g. Two Sum"
                      value={problemName}
                      onChange={(e) => setProblemName(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      placeholder="Problem description..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                    />
                  </div>

                  {/* Difficulty and Tags Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={problemDifficulty}
                        onValueChange={(v) => setProblemDifficulty(v as "Easy" | "Medium" | "Hard")}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="Easy">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Easy
                            </span>
                          </SelectItem>
                          <SelectItem value="Medium">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              Medium
                            </span>
                          </SelectItem>
                          <SelectItem value="Hard">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Hard
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        placeholder="e.g. Arrays, DP, Greedy"
                        value={problemTags}
                        onChange={(e) => setProblemTags(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                      <p className="text-xs text-gray-500">Comma-separated</p>
                    </div>
                  </div>

                  {/* Constraints Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time Limit (seconds)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="1"
                        value={problemTimeLimit}
                        onChange={(e) => setProblemTimeLimit(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory Limit (MB)</Label>
                      <Input
                        type="number"
                        min="16"
                        placeholder="256"
                        value={problemMemoryLimit}
                        onChange={(e) => setProblemMemoryLimit(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Sample Test Cases */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Sample Test Cases (JSON) *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatTestCasesJSON(sampleTestCases, setSampleTestCases)}
                        className="h-6 text-xs text-gray-400 hover:text-white"
                      >
                        Format JSON
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Visible to users. At least 1 required. Format: {`[{"input": "...", "output": "..."}]`}
                    </p>
                    <textarea
                      placeholder={`[\n  {"input": "5\\n1 2 3 4 5", "output": "15"},\n  {"input": "3\\n1 2 3", "output": "6"}\n]`}
                      value={sampleTestCases}
                      onChange={(e) => {
                        setSampleTestCases(e.target.value);
                        validateTestCases(e.target.value, setSampleTestCasesError, setSampleTestCasesCount);
                      }}
                      className={`w-full h-24 px-3 py-2 bg-gray-800 border rounded-md text-sm font-mono resize-none ${
                        sampleTestCasesError 
                          ? "border-red-500 focus:border-red-500" 
                          : sampleTestCases.trim() && !sampleTestCasesError
                          ? "border-green-500 focus:border-green-500"
                          : "border-gray-700"
                      }`}
                    />
                    {sampleTestCasesError ? (
                      <p className="text-xs text-red-400">{sampleTestCasesError}</p>
                    ) : sampleTestCasesCount > 0 ? (
                      <p className="text-xs text-green-400">Valid JSON - {sampleTestCasesCount} sample test case{sampleTestCasesCount > 1 ? "s" : ""}</p>
                    ) : (
                      <p className="text-xs text-yellow-400">Required: At least 1 sample test case</p>
                    )}
                  </div>

                  {/* Hidden Test Cases */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Hidden Test Cases (JSON)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatTestCasesJSON(hiddenTestCases, setHiddenTestCases)}
                        className="h-6 text-xs text-gray-400 hover:text-white"
                      >
                        Format JSON
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Hidden from users. Used for final judging. Optional.
                    </p>
                    <textarea
                      placeholder={`[\n  {"input": "10000\\n...", "output": "..."}\n]`}
                      value={hiddenTestCases}
                      onChange={(e) => {
                        setHiddenTestCases(e.target.value);
                        validateTestCases(e.target.value, setHiddenTestCasesError, setHiddenTestCasesCount);
                      }}
                      className={`w-full h-24 px-3 py-2 bg-gray-800 border rounded-md text-sm font-mono resize-none ${
                        hiddenTestCasesError 
                          ? "border-red-500 focus:border-red-500" 
                          : hiddenTestCases.trim() && !hiddenTestCasesError
                          ? "border-green-500 focus:border-green-500"
                          : "border-gray-700"
                      }`}
                    />
                    {hiddenTestCasesError ? (
                      <p className="text-xs text-red-400">{hiddenTestCasesError}</p>
                    ) : hiddenTestCasesCount > 0 ? (
                      <p className="text-xs text-green-400">Valid JSON - {hiddenTestCasesCount} hidden test case{hiddenTestCasesCount > 1 ? "s" : ""}</p>
                    ) : null}
                  </div>

                  <Button type="submit" disabled={loading || !!sampleTestCasesError || !!hiddenTestCasesError || sampleTestCasesCount === 0} className="w-full">
                    {loading ? "Adding..." : "Add Problem"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contest List */}
            <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Existing Contests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No contests yet
                    </p>
                  ) : (
                    contests.map((c) => {
                      const startTime = new Date(c.startTime);
                      const now = new Date();
                      const isUpcoming = startTime > now;
                      const endTime = new Date(startTime.getTime() + c.timer * 60 * 1000);
                      const isEnded = now > endTime;
                      const status = isUpcoming ? "upcoming" : isEnded ? "ended" : "active";
                      
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{c.title}</p>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : status === "upcoming"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {c.problems?.length || 0} problems • {c.timer} min
                            </p>
                            <p className="text-xs text-gray-500">
                              Starts: {startTime.toLocaleString()}
                            </p>
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Create Session</CardTitle>
                <CardDescription>
                  Schedule a learning session or workshop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Title *</Label>
                    <Input
                      placeholder="e.g. Intro to Dynamic Programming"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Details</Label>
                    <textarea
                      placeholder="Session details..."
                      value={sessionDetails}
                      onChange={(e) => setSessionDetails(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Link *</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={sessionMeetLink}
                        onChange={(e) => setSessionMeetLink(e.target.value)}
                        className="bg-gray-800 border-gray-700 pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Google Meet, Zoom, or any video call URL
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button type="submit" disabled={loading || sessionsLoading} className="w-full">
                    {loading || sessionsLoading ? "Creating..." : "Create Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Existing Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No sessions yet
                    </p>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 bg-gray-800/50 rounded-lg"
                      >
                        {editingId === s.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-400">Title *</Label>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-gray-800 border-gray-700 h-9"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-400">Details</Label>
                              <textarea
                                value={editDetails}
                                onChange={(e) => setEditDetails(e.target.value)}
                                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-400">Meeting Link *</Label>
                              <Input
                                type="url"
                                value={editMeetLink}
                                onChange={(e) => setEditMeetLink(e.target.value)}
                                className="bg-gray-800 border-gray-700 h-9"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-400">Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 h-9"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(s.id)}
                                disabled={!editTitle || !editMeetLink || sessionsLoading}
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
                              <p className="font-medium text-white">{s.title}</p>
                              {s.details && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                  {s.details}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create Task Form */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Create Task</CardTitle>
                  <CardDescription>Create a new task for students</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Task Title *</Label>
                      <Input
                        placeholder="e.g. Solve 5 DP problems"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        placeholder="Task details..."
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Points *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="100"
                          value={taskPoints}
                          onChange={(e) => setTaskPoints(e.target.value)}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="datetime-local"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                    
                    {/* Assignment Type */}
                    <div className="space-y-3">
                      <Label>Assign To</Label>
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
                          <Globe className="h-4 w-4 text-gray-400" />
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
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Specific Users</span>
                        </label>
                      </div>
                      
                      {taskAssignmentType === "specific" && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-md min-h-[40px]">
                            {selectedUserIds.length === 0 ? (
                              <span className="text-sm text-gray-500">No users selected</span>
                            ) : (
                              selectedUserIds.map((userId) => {
                                const u = studentUsers.find((su) => su.id === userId);
                                return (
                                  <span
                                    key={userId}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                  >
                                    {u?.email || userId}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))}
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
                                setSelectedUserIds([...selectedUserIds, userId]);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Add a student..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 max-h-48">
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
                    
                    <Button type="submit" disabled={loading || tasksLoading} className="w-full">
                      {loading || tasksLoading ? "Creating..." : "Create Task"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Existing Tasks</CardTitle>
                  <CardDescription>{tasks.length} task{tasks.length !== 1 ? "s" : ""} created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {tasksLoading ? (
                      <p className="text-gray-500 text-center py-4">Loading...</p>
                    ) : tasks.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No tasks yet</p>
                    ) : (
                      tasks.map((task) => {
                        const isExpanded = expandedTaskId === task.id;
                        const isEditing = editingTaskId === task.id;
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                        
                        return (
                          <div key={task.id} className="bg-gray-800/50 rounded-lg overflow-hidden">
                            {isEditing ? (
                              // Edit Mode
                              <div className="p-4 space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-400">Title *</Label>
                                  <Input
                                    value={editTaskTitle}
                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                    className="bg-gray-800 border-gray-700 h-9"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-400">Description</Label>
                                  <textarea
                                    value={editTaskDesc}
                                    onChange={(e) => setEditTaskDesc(e.target.value)}
                                    className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Points</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editTaskPoints}
                                      onChange={(e) => setEditTaskPoints(e.target.value)}
                                      className="bg-gray-800 border-gray-700 h-9"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Due Date</Label>
                                    <Input
                                      type="datetime-local"
                                      value={editTaskDueDate}
                                      onChange={(e) => setEditTaskDueDate(e.target.value)}
                                      className="bg-gray-800 border-gray-700 h-9"
                                    />
                                  </div>
                                </div>
                                
                                {/* Edit Assignment Type */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-400">Assign To</Label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={editTaskAssignmentType === "all"}
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
                                        checked={editTaskAssignmentType === "specific"}
                                        onChange={() => setEditTaskAssignmentType("specific")}
                                        className="text-blue-500"
                                      />
                                      <span className="text-xs">Specific</span>
                                    </label>
                                  </div>
                                  {editTaskAssignmentType === "specific" && (
                                    <Select
                                      value=""
                                      onValueChange={(userId) => {
                                        if (!editSelectedUserIds.includes(userId)) {
                                          setEditSelectedUserIds([...editSelectedUserIds, userId]);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="bg-gray-800 border-gray-700 h-8 text-xs">
                                        <SelectValue placeholder="Add user..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-800 border-gray-700 max-h-32">
                                        {studentUsers
                                          .filter((u) => !editSelectedUserIds.includes(u.id))
                                          .map((u) => (
                                            <SelectItem key={u.id} value={u.id} className="text-xs">
                                              {u.email}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {editTaskAssignmentType === "specific" && editSelectedUserIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {editSelectedUserIds.map((userId) => {
                                        const u = studentUsers.find((su) => su.id === userId);
                                        return (
                                          <span
                                            key={userId}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs"
                                          >
                                            {u?.email?.split("@")[0] || userId.slice(0, 8)}
                                            <button
                                              type="button"
                                              onClick={() => setEditSelectedUserIds(editSelectedUserIds.filter((id) => id !== userId))}
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
                                    onClick={() => handleSaveEditTask(task.id)}
                                    disabled={!editTaskTitle || tasksLoading}
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
                                        <p className="font-medium text-white truncate">{task.title}</p>
                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                                          {task.points} pts
                                        </span>
                                        {task.assignedTo && task.assignedTo.length > 0 ? (
                                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                            {task.assignedTo.length} user{task.assignedTo.length !== 1 ? "s" : ""}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                            All
                                          </span>
                                        )}
                                      </div>
                                      {task.description && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        {task.dueDate && (
                                          <span className={isOverdue ? "text-red-400" : ""}>
                                            Due: {new Date(task.dueDate).toLocaleString()}
                                            {isOverdue && " (Overdue)"}
                                          </span>
                                        )}
                                        <span>
                                          Created: {new Date(task.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleSubmissions(task.id)}
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
                                        onClick={() => handleStartEditTask(task)}
                                        className="h-8 w-8 p-0"
                                        title="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
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
                                  <div className="border-t border-gray-700 bg-gray-900/50 p-4">
                                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                                      Submissions ({taskSubmissions.length})
                                    </h4>
                                    {submissionsLoading ? (
                                      <p className="text-sm text-gray-500">Loading submissions...</p>
                                    ) : taskSubmissions.length === 0 ? (
                                      <p className="text-sm text-gray-500">No submissions yet</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {taskSubmissions.map((sub) => {
                                          const isLate = task.dueDate && new Date(sub.createdAt) > new Date(task.dueDate);
                                          return (
                                            <div
                                              key={sub.id}
                                              className="flex items-center justify-between gap-2 p-2 bg-gray-800 rounded text-sm"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="text-gray-300 truncate">
                                                    {sub.user?.email || sub.userId}
                                                  </span>
                                                  <span
                                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getSubmissionStatusColor(sub.status)}`}
                                                  >
                                                    {sub.status}
                                                  </span>
                                                  {sub.status === "VERIFIED" && (
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
                                                  <span className="text-xs text-gray-500">
                                                    {new Date(sub.createdAt).toLocaleString()}
                                                  </span>
                                                </div>
                                              </div>
                                              {sub.status === "PENDING" && (
                                                <div className="flex gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenVerifyModal(sub, task.points)}
                                                    className="h-7 text-xs gap-1 text-green-400 border-green-400/50 hover:bg-green-400/10"
                                                  >
                                                    <Check className="h-3 w-3" />
                                                    Verify
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRejectSubmission(sub.id)}
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
                </CardContent>
              </Card>
            </div>
            
            {/* Verify Modal */}
            {verifyModalOpen && selectedSubmission && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="bg-gray-900 border-gray-700 w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle className="text-white">Verify Submission</CardTitle>
                    <CardDescription>
                      Award points for this submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-400">
                      <p><strong>User:</strong> {selectedSubmission.user?.email || selectedSubmission.userId}</p>
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
                      <Label>Points to Award</Label>
                      <Input
                        type="number"
                        min="0"
                        value={verifyPoints}
                        onChange={(e) => setVerifyPoints(Number(e.target.value))}
                        className="bg-gray-800 border-gray-700"
                      />
                      <p className="text-xs text-gray-500">
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Create Announcement
                </CardTitle>
                <CardDescription>
                  Post a new announcement for all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <textarea
                      placeholder="Announcement content..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pinned"
                      checked={announcementPinned}
                      onChange={(e) => setAnnouncementPinned(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                    />
                    <Label htmlFor="pinned" className="flex items-center gap-1 cursor-pointer">
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

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  All Announcements
                </CardTitle>
                <CardDescription>
                  {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {announcements.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No announcements yet
                    </p>
                  ) : (
                    announcements.map((a) => {
                      const isEditing = editingAnnouncementId === a.id;
                      
                      return (
                        <div
                          key={a.id}
                          className={`p-4 rounded-lg ${
                            a.pinned
                              ? "bg-yellow-500/10 border-l-4 border-yellow-500"
                              : "bg-gray-800/50"
                          }`}
                        >
                          {isEditing ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Title *</Label>
                                <Input
                                  value={editAnnTitle}
                                  onChange={(e) => setEditAnnTitle(e.target.value)}
                                  className="bg-gray-800 border-gray-700 h-9"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Content *</Label>
                                <textarea
                                  value={editAnnContent}
                                  onChange={(e) => setEditAnnContent(e.target.value)}
                                  className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                                  required
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`edit-pinned-${a.id}`}
                                  checked={editAnnPinned}
                                  onChange={(e) => setEditAnnPinned(e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                                />
                                <Label htmlFor={`edit-pinned-${a.id}`} className="flex items-center gap-1 cursor-pointer text-sm">
                                  <Pin className="h-3 w-3 text-yellow-500" />
                                  Pinned
                                </Label>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEditAnnouncement(a.id)}
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
                                    <p className="font-medium text-white">{a.title}</p>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">
                                    {a.content}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(a.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleTogglePin(a)}
                                    className={`h-8 w-8 p-0 ${
                                      a.pinned ? "text-yellow-500 hover:text-yellow-400" : "text-gray-400 hover:text-yellow-500"
                                    }`}
                                    title={a.pinned ? "Unpin" : "Pin"}
                                  >
                                    <Pin className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStartEditAnnouncement(a)}
                                    className="h-8 w-8 p-0"
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteAnnouncement(a.id)}
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Pending Blog Approvals
              </CardTitle>
              <CardDescription>
                Review and approve blog posts submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBlogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No pending blogs
                  </p>
                ) : (
                  pendingBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="p-4 bg-gray-800/50 rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{blog.title}</h3>
                          <p className="text-sm text-gray-400">
                            By: {blog.authorId} •{" "}
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleApproveBlog(blog.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {blog.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
