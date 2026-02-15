"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatWidget } from "@/components/chat-widget";
import api from "@/lib/axios";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

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

  // Compute initial loading state - true until we can verify auth
  const shouldShowLoading =
    !hasHydrated ||
    (hasHydrated && isAuthenticated && requireProfile && hasProfile !== true);

  // Auth check - handle redirects
  useLayoutEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect to profile if hasProfile is explicitly false (and requireProfile is true)
    if (requireProfile && hasProfile === false) {
      router.push("/profile");
      return;
    }
  }, [isAuthenticated, hasHydrated, hasProfile, requireProfile, router]);

  // Fetch user name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || hasProfile !== true) return;

      try {
        const res = await api.get("/profile");
        setUserName(
          res.data.data?.name || user?.email?.split("@")[0] || "User",
        );
      } catch {
        setUserName(user?.email?.split("@")[0] || "User");
      }
    };

    fetchProfile();
  }, [isAuthenticated, hasProfile, user?.email]);

  // Sync role changes (e.g., when user is promoted to admin)
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !user?.id) return;

    const syncRole = async () => {
      try {
        const res = await api.get(`/profile`);
        const profile = res.data?.data;
        if (!profile) return;

        if (profile.role && profile.role !== user.role) {
          updateUser({ role: profile.role, email: profile.email || user.email });
        }
      } catch {
        // Ignore sync errors to avoid blocking UI
      }
    };

    syncRole();
  }, [
    hasHydrated,
    isAuthenticated,
    user?.id,
    user?.role,
    user?.email,
    updateUser,
  ]);

  // Loading state
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar userName={userName || user.email?.split("@")[0] || "User"} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="min-h-full bg-background text-foreground">
          {children}
        </div>
      </main>

      {/* Chat Widget - only visible for authenticated users */}
      <ChatWidget />
    </div>
  );
}
