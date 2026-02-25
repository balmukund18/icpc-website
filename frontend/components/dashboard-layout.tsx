"use client";

import { useEffect, useState, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { TopNavbar } from "@/components/top-navbar";
import { ChatWidget } from "@/components/chat-widget";

import api from "@/lib/axios";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

/* ── Keyboard shortcut map ── */
const SHORTCUTS: Record<string, string> = {
  d: "/dashboard",
  t: "/tasks",
  l: "/leaderboard",
  c: "/contests",
  s: "/sessions",
  b: "/blog",
  a: "/alumni",
};

export function DashboardLayout({
  children,
  requireProfile = true,
}: DashboardLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasProfile = useAuthStore((state) => state.hasProfile);
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();


  const [userName, setUserName] = useState<string>("");

  /* ── Global keyboard shortcuts ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return;

      const key = e.key.toLowerCase();
      if (SHORTCUTS[key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push(SHORTCUTS[key]);
      }
    },
    [router],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Compute initial loading state
  const shouldShowLoading =
    !hasHydrated ||
    (hasHydrated && isAuthenticated && requireProfile && hasProfile !== true);

  // Auth check
  useLayoutEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (requireProfile && hasProfile === false) { router.push("/profile"); return; }
  }, [isAuthenticated, hasHydrated, hasProfile, requireProfile, router]);

  // Fetch user name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || hasProfile !== true) return;
      try {
        const res = await api.get("/profile");
        setUserName(res.data.data?.name || user?.email?.split("@")[0] || "User");
      } catch {
        setUserName(user?.email?.split("@")[0] || "User");
      }
    };
    fetchProfile();
  }, [isAuthenticated, hasProfile, user?.email]);

  // Sync role changes
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !user?.id) return;
    const syncRole = async () => {
      try {
        const res = await api.get("/profile");
        const profile = res.data?.data;
        if (!profile) return;
        if (profile.role && profile.role !== user.role) {
          updateUser({ role: profile.role, email: profile.email || user.email });
        }
      } catch { /* ignore */ }
    };
    syncRole();
  }, [hasHydrated, isAuthenticated, user?.id, user?.role, user?.email, updateUser]);

  // Loading state
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-muted-foreground font-mono">&gt; loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navbar */}
      <TopNavbar userName={userName || user.email?.split("@")[0] || "User"} />

      {/* Main Content with page transition */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="min-h-full bg-background text-foreground">
          {children}
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
