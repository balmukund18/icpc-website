import { cn } from "@/lib/utils";

// Base Skeleton component with shimmer animation
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// ==========================================
// Card-level Skeletons
// ==========================================

export function StatsCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-4" />
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Skeleton className="h-6 w-3/4 bg-muted" />
        <Skeleton className="h-6 w-16 rounded bg-muted" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-5 w-24 rounded bg-muted" />
        <Skeleton className="h-5 w-16 rounded bg-muted" />
      </div>
      <Skeleton className="h-4 w-full mb-2 bg-muted" />
      <Skeleton className="h-4 w-2/3 mb-4 bg-muted" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 bg-muted" />
          <Skeleton className="h-4 w-40 bg-muted" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <Skeleton className="h-9 w-28 bg-muted" />
        <Skeleton className="h-9 w-20 bg-muted" />
      </div>
    </div>
  );
}

export function AnnouncementCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 mt-1" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-full">
      <Skeleton className="h-6 w-3/4 mb-2 bg-white/10" />
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-3 w-3 bg-white/10" />
        <Skeleton className="h-3 w-24 bg-white/10" />
        <Skeleton className="h-3 w-3 bg-white/10" />
        <Skeleton className="h-3 w-20 bg-white/10" />
      </div>
      <Skeleton className="h-4 w-full mb-2 bg-white/10" />
      <Skeleton className="h-4 w-full mb-2 bg-white/10" />
      <Skeleton className="h-4 w-2/3 mb-4 bg-white/10" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
        <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-4 w-24 bg-white/10" />
    </div>
  );
}

export function ContestCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4 bg-muted" />
          <Skeleton className="h-5 w-16 rounded bg-muted" />
        </div>
        <Skeleton className="h-4 w-24 mb-4 bg-muted" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16 bg-muted" />
            <Skeleton className="h-4 w-20 bg-muted" />
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <Skeleton className="h-10 w-full bg-muted" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Page-level Skeletons
// ==========================================

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Announcement Banner */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Tasks & Points Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tasks Widget */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Points Widget */}
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-24 w-full rounded-lg mb-4" />
          <Skeleton className="h-3 w-24 mb-2" />
          <LeaderboardSkeleton />
        </div>
      </div>

      {/* Contests & Submissions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="col-span-3 bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessionsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Section Title */}
      <Skeleton className="h-8 w-48" />

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SessionDetailSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Skeleton className="h-9 w-36" />

        {/* Session Content */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Status Badge */}
          <Skeleton className="h-8 w-24 rounded-full" />

          {/* Title */}
          <Skeleton className="h-10 w-3/4" />

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Details Section */}
          <div>
            <Skeleton className="h-6 w-20 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-border">
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2 bg-muted" />
          <Skeleton className="h-5 w-48 bg-muted" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg bg-muted" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-28 bg-muted" />
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Skeleton className="h-9 w-32 bg-muted" />

        {/* Task Content */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-8 w-20 rounded-full bg-muted" />
            <Skeleton className="h-8 w-32 rounded-full bg-muted" />
          </div>

          {/* Title */}
          <Skeleton className="h-10 w-3/4 bg-muted" />

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-5 w-48 bg-muted" />
            <Skeleton className="h-5 w-32 bg-muted" />
          </div>

          {/* Description */}
          <div>
            <Skeleton className="h-6 w-28 mb-3 bg-muted" />
            <Skeleton className="h-4 w-full mb-2 bg-muted" />
            <Skeleton className="h-4 w-full mb-2 bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted" />
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-border">
            <Skeleton className="h-11 w-40 bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <AnnouncementCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogsPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-24 mb-2 bg-white/10" />
            <Skeleton className="h-5 w-64 bg-white/10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 bg-white/10" />
            <Skeleton className="h-10 w-32 bg-white/10" />
          </div>
        </div>

        {/* Tags Filter */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <Skeleton className="h-5 w-24 mb-4 bg-white/10" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContestsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-40 mb-2 bg-muted" />
        <Skeleton className="h-5 w-80 bg-muted" />
      </div>

      {/* Contests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ContestCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export { Skeleton };
