"use client";

import {
  LayoutDashboard,
  Trophy,
  Play,
  CheckSquare,
  Calendar,
  FileText,
  Megaphone,
  UserCog,
  Shield,
  GraduationCap,
  LogOut,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarButton,
  Logo,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "motion/react";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // If specified, only show for these roles
}

const mainLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: <Trophy className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Contests",
    href: "/contests",
    icon: <Play className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: <Calendar className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: <FileText className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <UserCog className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Alumni",
    href: "/alumni",
    icon: <GraduationCap className="h-5 w-5 flex-shrink-0" />,
  },
];

const roleBasedLinks: NavLink[] = [
  {
    label: "Admin",
    href: "/admin",
    icon: <Shield className="h-5 w-5 flex-shrink-0" />,
    roles: ["ADMIN"],
  },
];

function SidebarContent({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { open, animate, setOpen } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeMobileSidebar = () => {
    // Only close on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  // Filter role-based links
  const visibleRoleLinks = roleBasedLinks.filter(
    (link) => !link.roles || link.roles.includes(user?.role || "")
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo */}
      <div className="mb-6">
        <Logo />
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        {mainLinks.map((link) => (
          <SidebarLink
            key={link.href}
            link={link}
            active={isActive(link.href)}
            onClick={closeMobileSidebar}
          />
        ))}

        {/* Role-based links */}
        {visibleRoleLinks.length > 0 && (
          <>
            <div className="my-2 border-t border-border" />
            {visibleRoleLinks.map((link) => (
              <SidebarLink
                key={link.href}
                link={link}
                active={isActive(link.href)}
                onClick={closeMobileSidebar}
              />
            ))}
          </>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-border pt-4 mt-4">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2 overflow-hidden">
          <div className="h-6 w-6 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {userName}
          </motion.span>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-center px-3 py-2">
          <ModeToggle />
        </div>

        {/* Logout Button */}
        <SidebarButton
          icon={<LogOut className="h-5 w-5 flex-shrink-0 text-[#FF4D4F]" />}
          label="Log Out"
          onClick={handleLogout}
          className="text-[#FF4D4F] hover:text-[#FF4D4F] hover:bg-[#FF4D4F]/10"
        />
      </div>
    </>
  );
}

export function AppSidebar({ userName }: { userName: string }) {
  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-4">
        <SidebarContent userName={userName} />
      </SidebarBody>
    </Sidebar>
  );
}
