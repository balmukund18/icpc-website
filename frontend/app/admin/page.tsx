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
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  updateUserRole,
  createTask,
  getAnnouncements,
  createAnnouncement,
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

  // User filter
  const [userFilter, setUserFilter] = useState<"all" | "pending">("all");

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
  const [taskPoints, setTaskPoints] = useState(0);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

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
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create session"
      );
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
        points: taskPoints,
      });
      showMessage("success", "Task created successfully!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPoints(0);
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAnnouncement({
        title: announcementTitle,
        content: announcementContent,
      });
      showMessage("success", "Announcement created successfully!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
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
          <Card className="bg-gray-900 border-gray-800 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-white">Create Task</CardTitle>
              <CardDescription>Create a new task for students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label>Task Title</Label>
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
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
                    <Label>Title</Label>
                    <Input
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <textarea
                      placeholder="Announcement content..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm resize-none"
                      required
                    />
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
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No announcements yet
                    </p>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {a.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
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
