"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ModeToggle } from "@/components/mode-toggle";
import { FeaturesOverlay } from "@/components/features-overlay";
import { useState, useRef, useEffect } from "react";
import {
    Menu,
    X,
    LayoutDashboard,
    ListChecks,
    Trophy,
    Crown,
    PenLine,
    Megaphone,
    Video,
    Users,
    Shield,
    LogOut,
    User,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
    { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "tasks", href: "/tasks", icon: ListChecks },
    { label: "contests", href: "/contests", icon: Trophy },
    { label: "leaderboard", href: "/leaderboard", icon: Crown },
    { label: "blog", href: "/blog", icon: PenLine },
    { label: "sessions", href: "/sessions", icon: Video },
    { label: "alumni", href: "/alumni", icon: Users },
];

export function TopNavbar({ userName }: { userName: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const isAdmin = user?.role === "ADMIN";

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Get user initials for avatar
    const initials = userName
        .split(/[\s_]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "U";

    return (
        <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Desktop Nav */}
                <div className="flex items-center h-11">
                    {/* Brand — opens features overlay */}
                    <button
                        onClick={() => setFeaturesOpen(true)}
                        className="font-bold text-sm text-foreground mr-5 flex-shrink-0 flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <span className="text-[#3FB950] font-mono text-base">&gt;_</span>
                        <span className="hidden sm:inline">ICPC USICT</span>
                    </button>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-5 bg-border mr-2" />

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-0.5 flex-1 min-w-0">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap transition-all rounded-sm",
                                        active
                                            ? "bg-muted text-foreground font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">{link.label}</span>
                                </Link>
                            );
                        })}

                        {/* Announcements - compact icon with label */}
                        <Link
                            href="/announcements"
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap transition-all rounded-sm relative",
                                isActive("/announcements")
                                    ? "bg-muted text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Megaphone className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">alerts</span>
                        </Link>

                        {/* Admin */}
                        {isAdmin && (
                            <>
                                <div className="w-px h-4 bg-border mx-1" />
                                <Link
                                    href="/admin"
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap transition-all rounded-sm",
                                        isActive("/admin")
                                            ? "bg-[#D29922]/15 text-[#D29922] font-semibold"
                                            : "text-[#D29922]/60 hover:text-[#D29922] hover:bg-[#D29922]/10"
                                    )}
                                >
                                    <Shield className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">admin</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right side - Desktop */}
                    <div className="hidden md:flex items-center gap-1.5 ml-auto flex-shrink-0">
                        <ModeToggle />

                        {/* User dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1 rounded-sm transition-all text-sm",
                                    userMenuOpen
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {/* Avatar */}
                                <div className="w-6 h-6 bg-gradient-to-br from-[#58A6FF] to-[#388BFD] flex items-center justify-center rounded-sm">
                                    <span className="text-white text-[10px] font-bold">{initials}</span>
                                </div>
                                <span className="hidden lg:inline text-xs max-w-[100px] truncate">
                                    {userName}
                                </span>
                                <ChevronDown className={cn(
                                    "h-3 w-3 transition-transform duration-200",
                                    userMenuOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Dropdown menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 border border-border bg-background shadow-lg py-1 z-50">
                                    <div className="px-3 py-2 border-b border-border">
                                        <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <User className="h-3.5 w-3.5" />
                                        profile
                                    </Link>
                                    <button
                                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F85149] hover:bg-[#F85149]/10 transition-colors"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden ml-auto text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted/50 rounded-sm transition-colors"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-border py-2 space-y-0.5">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm mx-1",
                                        active
                                            ? "bg-muted text-foreground font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <Link
                            href="/announcements"
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm mx-1",
                                isActive("/announcements")
                                    ? "bg-muted text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Megaphone className="h-4 w-4" />
                            announcements
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm mx-1",
                                    isActive("/admin")
                                        ? "bg-[#D29922]/15 text-[#D29922] font-semibold"
                                        : "text-[#D29922]/60 hover:text-[#D29922] hover:bg-[#D29922]/10"
                                )}
                            >
                                <Shield className="h-4 w-4" />
                                admin
                            </Link>
                        )}
                        <div className="border-t border-border mt-2 pt-2 mx-1">
                            <Link
                                href="/profile"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm transition-colors"
                            >
                                <div className="w-5 h-5 bg-gradient-to-br from-[#58A6FF] to-[#388BFD] flex items-center justify-center rounded-sm">
                                    <span className="text-white text-[8px] font-bold">{initials}</span>
                                </div>
                                {userName}
                            </Link>
                            <div className="flex items-center justify-between px-3 py-2">
                                <ModeToggle />
                                <button
                                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                                    className="flex items-center gap-2 text-sm text-[#F85149] hover:bg-[#F85149]/10 px-2 py-1 rounded-sm transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Features Overlay */}
            <FeaturesOverlay open={featuresOpen} onClose={() => setFeaturesOpen(false)} />
        </nav>
    );
}
