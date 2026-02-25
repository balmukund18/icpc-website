"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
                toast.success("Password reset successfully!");
                setTimeout(() => router.push("/login"), 3000);
            } else {
                toast.error(data.error || "Failed to reset password");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="border border-border w-full max-w-sm">
                    <div className="p-4 pt-0">
                        <p className="text-destructive">&gt; error: invalid or missing reset token</p>
                        <Link href="/forgot-password">
                            <button className="text-sm border border-border px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" >[ request new link ]</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="border border-border w-full max-w-sm">
                <div className="p-4">
                    <div className="text-sm text-muted-foreground">&gt; reset-password:</div>
                    <p className="text-xl font-bold text-foreground">
                        New Password
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {success
                            ? "password has been reset successfully"
                            : "enter your new password below"}
                    </p>
                </div>
                <div className="p-4 pt-0">
                    {success ? (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 border border-[#3FB950]/30 bg-[#3FB950]/10 flex items-center justify-center rounded-sm">
                                    <CheckCircle className="h-6 w-6 text-[#3FB950]" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                redirecting to login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">new password:</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">confirm password:</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {password && confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-destructive">
                                    &gt; error: passwords do not match
                                </p>
                            )}
                            <button
                                className="w-full text-sm border border-foreground px-4 py-2 text-foreground hover:bg-muted transition-colors"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        resetting...
                                    </>
                                ) : (
                                    "[ RESET PASSWORD ]"
                                )}
                            </button>
                            <Link href="/login" className="block">
                                <button className="inline-flex items-center gap-2 w-full text-sm px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    back to login
                                </button>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-muted-foreground">&gt; loading...</div>
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
