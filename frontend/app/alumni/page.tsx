"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Search,
  Briefcase,
  MapPin,
  Linkedin,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getAlumniList, AlumniProfile } from "@/lib/alumniService";
import { CP_PLATFORMS } from "@/lib/profileService";

export default function AlumniNetworkPage() {
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const getPlatformUrl = (platform: string, handle: string): string => {
    // If the handle is already a full URL, return it directly
    if (handle.startsWith("http://") || handle.startsWith("https://")) {
      return handle;
    }
    // Strip any accidental domain prefix (e.g. "leetcode.com/username" -> "username")
    const domainPatterns: Record<string, RegExp> = {
      leetcode: /^(?:www\.)?leetcode\.com\/(?:u\/)?/i,
      codeforces: /^(?:www\.)?codeforces\.com\/profile\//i,
      codechef: /^(?:www\.)?codechef\.com\/users\//i,
      atcoder: /^(?:www\.)?atcoder\.jp\/users\//i,
      hackerrank: /^(?:www\.)?hackerrank\.com\//i,
      github: /^(?:www\.)?github\.com\//i,
    };
    let cleanHandle = handle.trim();
    if (domainPatterns[platform]) {
      cleanHandle = cleanHandle.replace(domainPatterns[platform], "");
    }
    // Remove trailing slashes
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

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
              Alumni Network
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Connect with alumni for mentorship, guidance, and career advice
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlumni}
            className="gap-2 self-start sm:self-auto"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Alumni</p>
                  <p className="text-xl font-bold">{alumni.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Companies</p>
                  <p className="text-xl font-bold">
                    {new Set(alumni.map((a) => a.profile?.company).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 col-span-2 lg:col-span-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/20 rounded-lg">
                  <Linkedin className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">On LinkedIn</p>
                  <p className="text-xl font-bold">
                    {alumni.filter((a) => a.profile?.linkedIn).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, company, position, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-800 pl-10"
          />
        </div>

        {/* Alumni Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchQuery ? "No alumni match your search" : "No alumni profiles available yet"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery ? "Try a different search term" : "Check back later"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredAlumni.map((alumnus) => (
                <Card
                  key={alumnus.id}
                  className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  <CardContent className="p-5">
                    {/* Name & Branch */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {alumnus.profile?.name || "Unknown"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {alumnus.profile?.branch && (
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                            {alumnus.profile.branch}
                          </span>
                        )}
                        {alumnus.profile?.graduationYear && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded-full">
                            Class of {alumnus.profile.graduationYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Professional Info */}
                    {(alumnus.profile?.company || alumnus.profile?.position) && (
                      <div className="flex items-start gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          {alumnus.profile?.position && (
                            <span className="text-gray-200">{alumnus.profile.position}</span>
                          )}
                          {alumnus.profile?.position && alumnus.profile?.company && (
                            <span className="text-gray-500"> at </span>
                          )}
                          {alumnus.profile?.company && (
                            <span className="text-blue-400 font-medium">{alumnus.profile.company}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {alumnus.profile?.location && (
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-400">{alumnus.profile.location}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {alumnus.profile?.bio && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                        {alumnus.profile.bio}
                      </p>
                    )}

                    {/* CP Handles */}
                    {alumnus.profile?.handles && Object.keys(alumnus.profile.handles).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {CP_PLATFORMS.map((platform) => {
                          const handle = alumnus.profile?.handles?.[platform.key];
                          if (!handle) return null;
                          return (
                            <a
                              key={platform.key}
                              href={getPlatformUrl(platform.key, handle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {platform.label}
                              <ExternalLink className="h-3 w-3 text-gray-500" />
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-800 pt-3 mt-auto">
                      {/* Contact Actions */}
                      <div className="flex flex-wrap gap-2">
                        {alumnus.profile?.linkedIn && (
                          <a
                            href={alumnus.profile.linkedIn.startsWith("http") ? alumnus.profile.linkedIn : `https://${alumnus.profile.linkedIn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs h-8 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                            >
                              <Linkedin className="h-3.5 w-3.5" />
                              LinkedIn
                            </Button>
                          </a>
                        )}
                        <a href={`mailto:${alumnus.email}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-8 bg-gray-800 border-gray-700 hover:bg-gray-700"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </Button>
                        </a>
                        {alumnus.profile?.contact && (
                          <a href={`tel:${alumnus.profile.contact}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs h-8 bg-gray-800 border-gray-700 hover:bg-gray-700"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Call
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500">
              Showing {filteredAlumni.length} of {alumni.length} alumni
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
