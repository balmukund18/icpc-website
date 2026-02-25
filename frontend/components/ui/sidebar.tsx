"use client";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import Image from "next/image";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-2 py-4 hidden md:flex md:flex-col bg-sidebar border-r border-border shrink-0 overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "200px" : "56px") : "200px",
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-sidebar border-b border-border w-full"
      )}
      {...props}
    >
      <div className="flex items-center z-20">
        <IconMenu2
          className="h-5 w-5 text-foreground cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Image
          src="/logo/icpc-logo.png"
          alt="ICPC"
          width={24}
          height={24}
          className="rounded"
        />
        <span className="font-bold text-xl text-foreground">ICPC</span>
      </div>
      <div className="w-5" /> {/* Spacer for centering */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-sidebar p-6 z-[100] flex flex-col",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-foreground cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <IconX className="h-5 w-5" />
            </div>
            <div className="flex flex-col h-full pt-10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  active,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  active?: boolean;
  onClick?: () => void;
} & Omit<LinkProps, "href">) => {
  const { open, animate } = useSidebar();

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2 px-3 rounded-sm transition-colors overflow-hidden",
        active
          ? "bg-[#3FB950]/10 text-foreground border-l-2 border-[#3FB950]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{link.icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-nowrap overflow-hidden"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const SidebarButton = ({
  icon,
  label,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) => {
  const { open, animate } = useSidebar();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2 px-3 rounded-sm transition-colors w-full overflow-hidden",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-nowrap overflow-hidden"
      >
        {label}
      </motion.span>
    </button>
  );
};

export const Logo = () => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href="/dashboard"
      className="font-bold flex items-center text-sm text-foreground py-2 px-3 relative z-20"
    >
      <Image
        src="/logo/icpc-logo.png"
        alt="ICPC"
        width={28}
        height={28}
        className="flex-shrink-0 rounded"
      />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="font-bold text-lg ml-2 whitespace-nowrap text-foreground"
      >
        ICPC
      </motion.span>
    </Link>
  );
};
