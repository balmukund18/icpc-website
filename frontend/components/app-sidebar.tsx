"use client";

import {
  LayoutDashboard,
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
    label: "Alumni Network",
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
            <div className="my-2 border-t border-neutral-800" />
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
      <div className="border-t border-neutral-800 pt-4 mt-4">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2 overflow-hidden">
          <div className="h-6 w-6 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-neutral-300" />
          </div>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-sm text-neutral-200 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {userName}
          </motion.span>
        </div>

        {/* Logout Button */}
        <SidebarButton
          icon={<LogOut className="h-5 w-5 flex-shrink-0 text-red-400" />}
          label="Logout"
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
