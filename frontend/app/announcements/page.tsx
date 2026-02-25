"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AnnouncementsPageSkeleton } from "@/components/ui/skeletons";
import { useAnnouncements } from "@/lib/hooks/useData";
import { motion } from "framer-motion";

export default function AnnouncementsPage() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasProfile = useAuthStore((state) => state.hasProfile);
  const { announcements, isLoading } = useAnnouncements();

  // Consider announcements from the last 24h as "new"
  const isNew = (createdAt: string) => {
    return Date.now() - new Date(createdAt).getTime() < 86400000;
  };

  if (!hasHydrated || hasProfile !== true || isLoading) {
    return (<DashboardLayout><AnnouncementsPageSkeleton /></DashboardLayout>);
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-0">

        {/* Header */}
        <section className="py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">announcements</span>{" "}
            <span className="font-normal text-muted-foreground">--broadcast</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            system broadcasts and updates
          </p>
        </section>

        <hr className="border-border" />

        {/* Announcements list */}
        {announcements.length === 0 ? (
          <section className="py-8 text-center">
            <p className="text-muted-foreground text-sm">&gt; no announcements yet</p>
          </section>
        ) : (
          <section className="py-2">
            {announcements.map((announcement, i) => {
              const fresh = isNew(announcement.createdAt);
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.25 }}
                  className={`py-4 border-b border-border/50 ${announcement.pinned ? "border-l-2 border-l-[#D29922] pl-4" : ""
                    } ${fresh ? "bg-[#58A6FF]/3" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-mono ${announcement.pinned ? "text-[#D29922]" : "text-[#58A6FF]"}`}>
                      {announcement.pinned ? "[📌 PINNED]" : "[📢 ANNOUNCEMENT]"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{announcement.title}</p>
                        {fresh && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
