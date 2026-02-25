"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  ChevronDown,
  Briefcase,
  MapPin,
  GraduationCap,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getAlumniList, AlumniProfile } from "@/lib/alumniService";
import { CP_PLATFORMS } from "@/lib/profileService";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function AlumniNetworkPage() {
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      fetchAlumni();
    }
  }, [hasHydrated, isAuthenticated]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const data = await getAlumniList();
      setAlumni(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to fetch alumni");
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumni.filter((a) => {
    const query = searchQuery.toLowerCase();
    const name = a.profile?.name?.toLowerCase() || "";
    const company = a.profile?.company?.toLowerCase() || "";
    const position = a.profile?.position?.toLowerCase() || "";
    const branch = a.profile?.branch?.toLowerCase() || "";
    return (
      name.includes(query) ||
      company.includes(query) ||
      position.includes(query) ||
      branch.includes(query)
    );
  });

  // Keyboard shortcut: / to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getPlatformUrl = (platform: string, handle: string): string => {
    if (handle.startsWith("http://") || handle.startsWith("https://")) return handle;
    const domainPatterns: Record<string, RegExp> = {
      leetcode: /^(?:www\.)?leetcode\.com\/(?:u\/)?/i,
      codeforces: /^(?:www\.)?codeforces\.com\/profile\//i,
      codechef: /^(?:www\.)?codechef\.com\/users\//i,
      atcoder: /^(?:www\.)?atcoder\.jp\/users\//i,
      hackerrank: /^(?:www\.)?hackerrank\.com\//i,
      github: /^(?:www\.)?github\.com\//i,
    };
    let cleanHandle = handle.trim();
    if (domainPatterns[platform]) cleanHandle = cleanHandle.replace(domainPatterns[platform], "");
    cleanHandle = cleanHandle.replace(/\/+$/, "");
    const urls: Record<string, string> = {
      leetcode: `https://leetcode.com/${cleanHandle}`,
      codeforces: `https://codeforces.com/profile/${cleanHandle}`,
      codechef: `https://www.codechef.com/users/${cleanHandle}`,
      atcoder: `https://atcoder.jp/users/${cleanHandle}`,
      hackerrank: `https://www.hackerrank.com/${cleanHandle}`,
      github: `https://github.com/${cleanHandle}`,
    };
    return urls[platform] || "#";
  };

  const getInitials = (name: string) => {
    const parts = name.split(/[\s_]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-[#58A6FF] to-[#388BFD]",
      "from-[#3FB950] to-[#238636]",
      "from-[#D29922] to-[#BB8009]",
      "from-[#F85149] to-[#DA3633]",
      "from-[#BC8CFF] to-[#8B5CF6]",
      "from-[#79C0FF] to-[#58A6FF]",
      "from-[#56D364] to-[#3FB950]",
      "from-[#E3B341] to-[#D29922]",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Stats
  const uniqueCompanies = new Set(alumni.map((a) => a.profile?.company).filter(Boolean));
  const linkedInCount = alumni.filter((a) => a.profile?.linkedIn).length;

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-2">

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            &gt; <span className="font-bold">alumni</span>{" "}
            <span className="font-normal text-muted-foreground">--network</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            connect with alumni for mentorship, guidance, and career advice.
          </p>
        </motion.section>

        <hr className="border-border" />

        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="py-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border p-4 text-center hover:border-[#58A6FF]/40 transition-colors">
              <p className="text-2xl font-bold text-foreground">{alumni.length}</p>
              <p className="text-xs text-muted-foreground mt-1">alumni</p>
            </div>
            <div className="border border-border p-4 text-center hover:border-[#3FB950]/40 transition-colors">
              <p className="text-2xl font-bold text-foreground">{uniqueCompanies.size}</p>
              <p className="text-xs text-muted-foreground mt-1">companies</p>
            </div>
            <div className="border border-border p-4 text-center hover:border-[#D29922]/40 transition-colors">
              <p className="text-2xl font-bold text-foreground">{linkedInCount}</p>
              <p className="text-xs text-muted-foreground mt-1">linkedin</p>
            </div>
          </div>
        </motion.section>

        {/* Search */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="py-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="search alumni: _ (press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-transparent border-border focus:border-[#58A6FF] transition-colors"
            />
            {searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                {filteredAlumni.length} result{filteredAlumni.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </motion.section>

        <hr className="border-border" />

        {/* Alumni List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">&gt; loading alumni data...</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <section className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              &gt; {searchQuery ? `no alumni matching "${searchQuery}"` : "no alumni data available"}
            </p>
          </section>
        ) : (
          <motion.section
            className="py-2 space-y-3"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {filteredAlumni.map((alumnus) => {
              const p = alumnus.profile;
              const name = p?.name || alumnus.email.split("@")[0];
              const handles = p?.handles as Record<string, string> | undefined;
              const hasHandles = handles && Object.values(handles).some((v) => v);
              const isExpanded = expandedId === alumnus.id;
              const hasExtra = p?.location || hasHandles;

              return (
                <motion.div
                  key={alumnus.id}
                  variants={fadeUp}
                  className={`border transition-all duration-200 ${isExpanded
                      ? "border-[#58A6FF]/40 bg-[#58A6FF]/[0.02]"
                      : "border-border hover:border-muted-foreground/30"
                    }`}
                >
                  {/* Main card content */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : alumnus.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 shrink-0 bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center`}
                      >
                        <span className="text-white text-sm font-bold">{getInitials(name)}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {name}
                          </h3>
                          {p?.graduationYear && (
                            <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 shrink-0">
                              {p.graduationYear}
                            </span>
                          )}
                        </div>

                        {/* Role & Company */}
                        {(p?.position || p?.company) && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {p?.position && p?.company
                                ? `${p.position} @ ${p.company}`
                                : p?.position || p?.company}
                            </span>
                          </div>
                        )}

                        {/* Branch */}
                        {p?.branch && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                            <GraduationCap className="h-3 w-3 shrink-0" />
                            <span>{p.branch}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons + expand */}
                      <div className="flex items-center gap-2 shrink-0">
                        {p?.linkedIn && (
                          <a
                            href={p.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 border border-border flex items-center justify-center text-muted-foreground hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="LinkedIn"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${alumnus.email}`}
                          className="h-8 w-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="Email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        {hasExtra && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {isExpanded && hasExtra && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-3">
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {p?.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{p.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{alumnus.email}</span>
                            </div>
                          </div>

                          {/* Platform handles */}
                          {hasHandles && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(handles!).map(([key, val]) => {
                                if (!val) return null;
                                const platformInfo = CP_PLATFORMS.find((p) => p.key === key);
                                const isGithub = key === "github";
                                return (
                                  <a
                                    key={key}
                                    href={getPlatformUrl(key, val)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
                                  >
                                    {isGithub ? (
                                      <Github className="h-3 w-3" />
                                    ) : (
                                      <ExternalLink className="h-3 w-3" />
                                    )}
                                    {platformInfo?.label || key}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.section>
        )}
      </div>
    </DashboardLayout>
  );
}
