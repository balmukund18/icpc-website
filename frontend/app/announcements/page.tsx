"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AnnouncementsPageSkeleton } from "@/components/ui/skeletons";
import { useAnnouncements } from "@/lib/hooks/useData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone, Pin } from "lucide-react";

export default function AnnouncementsPage() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasProfile = useAuthStore((state) => state.hasProfile);

  // Use SWR hook for announcements data
  const { announcements, isLoading } = useAnnouncements();

  if (!hasHydrated || hasProfile !== true || isLoading) {
    return (
      <DashboardLayout>
        <AnnouncementsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-yellow-500" />
              Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with the latest news and updates
            </p>
          </div>

          {/* Announcements List */}
          {announcements.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No announcements yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`bg-card border-border ${
                    announcement.pinned
                      ? "border-l-4 border-l-yellow-500 bg-yellow-500/5"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      {announcement.pinned && (
                        <Pin className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl text-card-foreground">
                          {announcement.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
