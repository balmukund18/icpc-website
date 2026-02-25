"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getProfile,
  updateProfile,
  validateName,
  validatePhone,
  BRANCH_OPTIONS,
  YEAR_OPTIONS,
  GRADUATION_YEAR_OPTIONS,
  CP_PLATFORMS,
  type Handles,
} from "@/lib/profileService";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setHasProfile = useAuthStore((state) => state.setHasProfile);
  const router = useRouter();

  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [handles, setHandles] = useState<Handles>({});
  const [leetcodeLocked, setLeetcodeLocked] = useState(false);

  const [graduationYear, setGraduationYear] = useState<number | null>(null);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAlumni = user?.role === "ALUMNI";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const profile = await getProfile();
        if (profile) {
          setName(profile.name || "");
          setBranch(profile.branch || "");
          setYear(profile.year || 1);
          setPhone(profile.contact || "");
          setHandles(profile.handles || {});
          if ((profile.handles as Record<string, string>)?.leetcode) {
            setLeetcodeLocked(true);
          }
          setGraduationYear(profile.graduationYear || null);
          setCompany(profile.company || "");
          setPosition(profile.position || "");
          setLocation(profile.location || "");
          setBio(profile.bio || "");
          setLinkedIn(profile.linkedIn || "");
          const isComplete = profile.name?.trim() && profile.branch?.trim() && profile.contact?.trim();
          setIsFirstTime(!isComplete);
        } else {
          setIsFirstTime(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsFirstTime(true);
      } finally {
        setLoading(false);
      }
    };
    if (hasHydrated && isAuthenticated) fetchProfile();
  }, [hasHydrated, isAuthenticated]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameValidation = validateName(name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error || "Invalid name";
    if (!branch) newErrors.branch = "Please select your branch";
    if (!isAlumni && !year) newErrors.year = "Please select your year";
    if (isAlumni && !graduationYear) newErrors.graduationYear = "Please select your graduation year";
    if (phone && !validatePhone(phone)) newErrors.phone = "Please enter a valid 10-digit mobile number";
    if (isAlumni && !linkedIn.trim()) newErrors.linkedIn = "LinkedIn profile is required for alumni";
    if (!isAlumni && !handles.leetcode?.trim()) newErrors.leetcode = "LeetCode handle is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        branch,
        year: isAlumni ? 1 : year,
        contact: phone.trim() || "",
        handles,
        graduationYear: isAlumni ? graduationYear : null,
        company: isAlumni ? company.trim() || null : null,
        position: isAlumni ? position.trim() || null : null,
        location: isAlumni ? location.trim() || null : null,
        bio: isAlumni ? bio.trim() || null : null,
        linkedIn: isAlumni ? linkedIn.trim() || null : null,
      });
      setHasProfile(true);
      toast.success(isFirstTime ? "Profile created!" : "Profile updated!");
      if (isFirstTime) router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err.response?.data?.error || err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleHandleChange = (platform: string, value: string) => {
    setHandles((prev) => ({ ...prev, [platform]: value }));
  };

  if (!hasHydrated || loading) {
    return (
      <DashboardLayout requireProfile={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-foreground">
              &gt; <span className="font-bold">profile</span>{" "}
              <span className="font-normal text-muted-foreground">--setup</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              complete your profile to continue
            </p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="mb-6 p-4 border border-[#58A6FF]/30 text-sm">
            <p className="text-[#58A6FF] font-semibold">&gt; welcome to ICPC Portal!</p>
            <p className="text-muted-foreground mt-1">please complete your profile to access the dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormContent()}
          </form>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back
          </button>
          <h1 className="text-xl font-bold text-foreground">
            &gt; <span className="font-bold">profile</span>{" "}
            <span className="font-normal text-muted-foreground">--settings</span>
          </h1>
        </div>

        <div className="mb-6 border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">&gt; rank_info</span>
            <span className="text-xs text-[#484F58]">profile identity panel</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">user:</span>
            <span className="text-foreground font-semibold">{name.replace(/\s+/g, "_") || user!.email}</span>
          </div>
          <p className="text-[10px] text-[#484F58]">
            complete tasks and compete in contests to level up your rank tier
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormContent()}
        </form>
      </div>
    </DashboardLayout>
  );

  function renderFormContent() {
    return (
      <>
        {/* Email (Read-only) */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">email (read-only)</label>
          <input
            type="email"
            value={user!.email}
            disabled
            className="w-full px-3 py-2 bg-transparent border border-border text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

        <hr className="border-border" />

        {/* ── Personal Information ── */}
        <section>
          <p className="text-sm font-semibold text-foreground mb-4">
            &gt; personal_info
          </p>
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                name <span className="text-[#F85149]">*</span>
              </Label>
              <Input
                id="name"
                placeholder="enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`bg-transparent border-border ${errors.name ? "border-[#F85149]" : ""}`}
              />
              {errors.name && <p className="text-xs text-[#F85149]">{errors.name}</p>}
            </div>

            {/* Branch */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                branch <span className="text-[#F85149]">*</span>
              </Label>
              <Select
                value={branch}
                onValueChange={(value) => {
                  setBranch(value);
                  if (errors.branch) setErrors((prev) => ({ ...prev, branch: "" }));
                }}
              >
                <SelectTrigger className={`bg-transparent border-border ${errors.branch ? "border-[#F85149]" : ""}`}>
                  <SelectValue placeholder="select your branch" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {BRANCH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch && <p className="text-xs text-[#F85149]">{errors.branch}</p>}
            </div>

            {/* Year */}
            {!isAlumni && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  year <span className="text-[#F85149]">*</span>
                </Label>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => {
                    setYear(parseInt(value));
                    if (errors.year) setErrors((prev) => ({ ...prev, year: "" }));
                  }}
                >
                  <SelectTrigger className={`bg-transparent border-border ${errors.year ? "border-[#F85149]" : ""}`}>
                    <SelectValue placeholder="select your year" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {YEAR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && <p className="text-xs text-[#F85149]">{errors.year}</p>}
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">phone</Label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={`bg-transparent border-border ${errors.phone ? "border-[#F85149]" : ""}`}
              />
              {errors.phone ? (
                <p className="text-xs text-[#F85149]">{errors.phone}</p>
              ) : (
                <p className="text-xs text-[#484F58]">optional — 10-digit mobile number</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Alumni Information ── */}
        {isAlumni && (
          <>
            <hr className="border-border" />
            <section>
              <p className="text-sm font-semibold text-foreground mb-4">
                &gt; alumni_info
              </p>
              <div className="space-y-4">
                {/* Graduation Year */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    graduation_year <span className="text-[#F85149]">*</span>
                  </Label>
                  <Select
                    value={graduationYear?.toString() || ""}
                    onValueChange={(value) => {
                      setGraduationYear(parseInt(value));
                      if (errors.graduationYear) setErrors((prev) => ({ ...prev, graduationYear: "" }));
                    }}
                  >
                    <SelectTrigger className={`bg-transparent border-border ${errors.graduationYear ? "border-[#F85149]" : ""}`}>
                      <SelectValue placeholder="select graduation year" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-48">
                      {GRADUATION_YEAR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.graduationYear && <p className="text-xs text-[#F85149]">{errors.graduationYear}</p>}
                </div>

                {/* Company + Position */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">company</Label>
                    <Input
                      placeholder="e.g. Google, Microsoft"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-transparent border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">position</Label>
                    <Input
                      placeholder="e.g. Software Engineer"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="bg-transparent border-border"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">location</Label>
                  <Input
                    placeholder="e.g. Bangalore, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent border-border"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    linkedin <span className="text-[#F85149]">*</span>
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className={`bg-transparent border-border ${errors.linkedIn ? "border-[#F85149]" : ""}`}
                  />
                  {errors.linkedIn && <p className="text-xs text-[#F85149]">{errors.linkedIn}</p>}
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">bio</Label>
                  <textarea
                    placeholder="tell students about your journey, achievements, and advice..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-transparent border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-foreground"
                  />
                  <p className="text-xs text-[#484F58]">optional — share your experience with students</p>
                </div>
              </div>
            </section>
          </>
        )}

        <hr className="border-border" />

        {/* ── CP Handles ── */}
        <section>
          <p className="text-sm font-semibold text-foreground mb-1">
            &gt; handles --competitive_programming
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            add your usernames on various platforms{!isAlumni && " — leetcode is required"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {CP_PLATFORMS.map((platform) => {
              const isLocked = platform.key === "leetcode" && leetcodeLocked;
              return (
                <div key={platform.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {platform.label.toLowerCase()}
                    {platform.key === "leetcode" && !isAlumni && (
                      <span className="text-[#F85149] ml-1">*</span>
                    )}
                    {isLocked && (
                      <span className="ml-2 text-[#484F58]">(locked)</span>
                    )}
                  </Label>
                  <Input
                    id={platform.key}
                    placeholder={platform.placeholder}
                    value={handles[platform.key as keyof Handles] || ""}
                    onChange={(e) => handleHandleChange(platform.key, e.target.value)}
                    className={`bg-transparent border-border ${isLocked ? "opacity-50 cursor-not-allowed" : ""} ${platform.key === "leetcode" && errors.leetcode ? "border-[#F85149]" : ""}`}
                    disabled={isLocked}
                  />
                  {platform.key === "leetcode" && errors.leetcode && (
                    <p className="text-xs text-[#F85149]">{errors.leetcode}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-border" />

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm border border-border px-6 py-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            [ CANCEL ]
          </button>
          <button
            type="submit"
            disabled={saving || !name || !branch || (!isAlumni && !year) || (isAlumni && !graduationYear)}
            className="text-sm border border-foreground px-6 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "saving..." : isFirstTime ? "[ SAVE & CONTINUE ]" : "[ SAVE CHANGES ]"}
          </button>
        </div>
      </>
    );
  }
}
