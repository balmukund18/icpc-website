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
} from "@/components/ui/card";
import { ArrowLeft, Megaphone, Pin } from "lucide-react";
import Link from "next/link";
import { getAnnouncements, Announcement } from "@/lib/adminService";

export default function AnnouncementsPage() {
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasProfile = useAuthStore((state) => state.hasProfile);
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (hasProfile === false) {
      router.push("/profile");
      return;
    }
  }, [isAuthenticated, hasHydrated, hasProfile, router]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!isAuthenticated || hasProfile !== true) return;

      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [isAuthenticated, hasProfile]);

  if (!hasHydrated || hasProfile !== true || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse text-xl">Loading Announcements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-yellow-500" />
              Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with the latest news and updates
            </p>
          </div>
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
                        {announcement.updatedAt !== announcement.createdAt && (
                          <span className="ml-2 text-xs">
                            (Updated:{" "}
                            {new Date(announcement.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                            )
                          </span>
                        )}
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
  );
}
