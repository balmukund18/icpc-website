"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  User,
  Code,
  Save,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Briefcase,
  MapPin,
  Linkedin,
  FileText,
} from "lucide-react";
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

  // Form state
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [handles, setHandles] = useState<Handles>({});
  const [leetcodeLocked, setLeetcodeLocked] = useState(false);

  // Alumni-specific form state
  const [graduationYear, setGraduationYear] = useState<number | null>(null);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is ALUMNI
  const isAlumni = user?.role === "ALUMNI";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const profile = await getProfile();

        if (profile) {
          // Existing profile - pre-fill form
          setName(profile.name || "");
          setBranch(profile.branch || "");
          setYear(profile.year || 1);
          setPhone(profile.contact || "");
          setHandles(profile.handles || {});
          // Lock LeetCode handle if already set (only admin can change)
          if ((profile.handles as Record<string, string>)?.leetcode) {
            setLeetcodeLocked(true);
          }
          // Alumni fields
          setGraduationYear(profile.graduationYear || null);
          setCompany(profile.company || "");
          setPosition(profile.position || "");
          setLocation(profile.location || "");
          setBio(profile.bio || "");
          setLinkedIn(profile.linkedIn || "");
          setIsFirstTime(false);
        } else {
          // No profile - first time setup
          setIsFirstTime(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Assume first time if error (profile doesn't exist)
        setIsFirstTime(true);
      } finally {
        setLoading(false);
      }
    };

    if (hasHydrated && isAuthenticated) {
      fetchProfile();
    }
  }, [hasHydrated, isAuthenticated]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error || "Invalid name";
    }

    // Validate branch
    if (!branch) {
      newErrors.branch = "Please select your branch";
    }

    // Validate year (only if not alumni)
    if (!isAlumni && !year) {
      newErrors.year = "Please select your year";
    }

    // Validate graduation year (required for alumni)
    if (isAlumni && !graduationYear) {
      newErrors.graduationYear = "Please select your graduation year";
    }

    // Validate phone (optional but must be valid if provided)
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

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
        year: isAlumni ? 1 : year, // Default to 1 for alumni
        contact: phone.trim() || "",
        handles,
        // Alumni fields
        graduationYear: isAlumni ? graduationYear : null,
        company: isAlumni ? company.trim() || null : null,
        position: isAlumni ? position.trim() || null : null,
        location: isAlumni ? location.trim() || null : null,
        bio: isAlumni ? bio.trim() || null : null,
        linkedIn: isAlumni ? linkedIn.trim() || null : null,
      });

      // Update auth store - profile now exists
      setHasProfile(true);

      toast.success(
        isFirstTime
          ? "Profile created successfully!"
          : "Profile updated successfully!"
      );

      if (isFirstTime) {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.error || err.message || "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleHandleChange = (platform: string, value: string) => {
    setHandles((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  if (!hasHydrated || loading) {
    return (
      <DashboardLayout requireProfile={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  // If first-time profile setup, render without sidebar
  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Profile Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete your profile to continue
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Welcome message for first-time users */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-400 mb-1">
              Welcome to ICPC Portal!
            </h2>
            <p className="text-sm text-muted-foreground">
              Please complete your profile to access the dashboard and start
              your competitive programming journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormContent()}
          </form>
        </div>
      </div>
    );
  }

  // Regular profile editing with sidebar
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              Profile Settings
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormContent()}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );

  function renderFormContent() {
    return (
      <>
        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            type="email"
            value={user!.email}
            disabled
            className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Personal Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Basic details about you. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`bg-muted border-border ${errors.name ? "border-red-500" : ""
                  }`}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label>
                Branch <span className="text-red-400">*</span>
              </Label>
              <Select
                value={branch}
                onValueChange={(value) => {
                  setBranch(value);
                  if (errors.branch) {
                    setErrors((prev) => ({ ...prev, branch: "" }));
                  }
                }}
              >
                <SelectTrigger
                  className={`bg-muted border-border ${errors.branch ? "border-red-500" : ""
                    }`}
                >
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  {BRANCH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch && (
                <p className="text-xs text-red-400">{errors.branch}</p>
              )}
            </div>

            {/* Year (hidden for Alumni) */}
            {!isAlumni && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Year <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => {
                    setYear(parseInt(value));
                    if (errors.year) {
                      setErrors((prev) => ({ ...prev, year: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`bg-muted border-border ${errors.year ? "border-red-500" : ""
                      }`}
                  >
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    {YEAR_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-xs text-red-400">{errors.year}</p>
                )}
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                className={`bg-muted border-border ${errors.phone ? "border-red-500" : ""
                  }`}
              />
              {errors.phone ? (
                <p className="text-xs text-red-400">{errors.phone}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Optional. Enter your 10-digit mobile number.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alumni Information (only for alumni users) */}
        {isAlumni && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Alumni Information
              </CardTitle>
              <CardDescription>
                Professional details visible to current students. Graduation
                year is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Graduation Year */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Graduation Year <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={graduationYear?.toString() || ""}
                  onValueChange={(value) => {
                    setGraduationYear(parseInt(value));
                    if (errors.graduationYear) {
                      setErrors((prev) => ({ ...prev, graduationYear: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`bg-muted border-border ${errors.graduationYear ? "border-red-500" : ""
                      }`}
                  >
                    <SelectValue placeholder="Select graduation year" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border max-h-48">
                    {GRADUATION_YEAR_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.graduationYear && (
                  <p className="text-xs text-red-400">
                    {errors.graduationYear}
                  </p>
                )}
              </div>

              {/* Company and Position in a row */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Company
                  </Label>
                  <Input
                    placeholder="e.g. Google, Microsoft"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    placeholder="e.g. Software Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  placeholder="e.g. Bangalore, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </Label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bio
                </Label>
                <textarea
                  placeholder="Tell students about your journey, achievements, and advice..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Share your experience and tips for current students.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitive Programming Handles */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Code className="h-5 w-5" />
              Competitive Programming Handles
            </CardTitle>
            <CardDescription>
              Add your usernames on various platforms. All fields are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {CP_PLATFORMS.map((platform) => {
                const isLocked = platform.key === "leetcode" && leetcodeLocked;
                return (
                  <div key={platform.key} className="space-y-2">
                    <Label htmlFor={platform.key}>
                      {platform.label}
                      {isLocked && (
                        <span className="ml-2 text-xs text-muted-foreground">(locked — contact admin to change)</span>
                      )}
                    </Label>
                    <Input
                      id={platform.key}
                      placeholder={platform.placeholder}
                      value={handles[platform.key as keyof Handles] || ""}
                      onChange={(e) =>
                        handleHandleChange(platform.key, e.target.value)
                      }
                      className={`bg-muted border-border ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={isLocked}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              saving ||
              !name ||
              !branch ||
              (!isAlumni && !year) ||
              (isAlumni && !graduationYear)
            }
            className="gap-2 min-w-37.5"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isFirstTime ? "Save & Continue" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </>
    );
  }
}
