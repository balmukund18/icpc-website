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
  ArrowLeft,
  User,
  Code,
  Save,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  Profile,
  Handles,
  getProfile,
  updateProfile,
  validatePhone,
  validateName,
  BRANCH_OPTIONS,
  YEAR_OPTIONS,
  CP_PLATFORMS,
} from "@/lib/profileService";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [handles, setHandles] = useState<Handles>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is ALUMNI
  const isAlumni = user?.role === "ALUMNI";

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

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
      });

      toast.success(
        isFirstTime
          ? "Profile created successfully!"
          : "Profile updated successfully!"
      );

      if (isFirstTime) {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to save profile"
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isFirstTime && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Profile Settings
              </h1>
              {isFirstTime && (
                <p className="text-sm text-gray-400">
                  Complete your profile to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome message for first-time users */}
        {isFirstTime && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-400 mb-1">
              Welcome to ICPC Portal!
            </h2>
            <p className="text-sm text-gray-400">
              Please complete your profile to access the dashboard and start
              your competitive programming journey.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-400">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Personal Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
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
                  className={`bg-gray-800 border-gray-700 ${
                    errors.name ? "border-red-500" : ""
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
                    className={`bg-gray-800 border-gray-700 ${
                      errors.branch ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
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
                      className={`bg-gray-800 border-gray-700 ${
                        errors.year ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
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
                  className={`bg-gray-800 border-gray-700 ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                {errors.phone ? (
                  <p className="text-xs text-red-400">{errors.phone}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Optional. Enter your 10-digit mobile number.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Competitive Programming Handles */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5" />
                Competitive Programming Handles
              </CardTitle>
              <CardDescription>
                Add your usernames on various platforms. All fields are
                optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {CP_PLATFORMS.map((platform) => (
                  <div key={platform.key} className="space-y-2">
                    <Label htmlFor={platform.key}>{platform.label}</Label>
                    <Input
                      id={platform.key}
                      placeholder={platform.placeholder}
                      value={handles[platform.key as keyof Handles] || ""}
                      onChange={(e) =>
                        handleHandleChange(platform.key, e.target.value)
                      }
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving || !name || !branch || (!isAlumni && !year)}
              className="gap-2 min-w-[150px]"
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
        </form>
      </div>
    </div>
  );
}
