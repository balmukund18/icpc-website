"use client";

import * as React from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeStore } from "@/store/useThemeStore";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const { darkVariant, toggleDarkVariant } = useThemeStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Apply the dark variant class to <html>
  React.useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (theme === "dark" || theme === "system") {
      if (darkVariant === "blue") {
        html.classList.remove("dark");
        html.classList.add("dark-blue");
      } else {
        html.classList.remove("dark-blue");
        html.classList.add("dark");
      }
    } else {
      html.classList.remove("dark-blue");
    }
  }, [theme, darkVariant, mounted]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1">
      {/* Dark variant toggle — only visible in dark mode */}
      {isDark && (
        <button
          onClick={toggleDarkVariant}
          className="h-8 w-8 flex items-center justify-center rounded-sm border border-border bg-background hover:bg-muted transition-colors flex-shrink-0"
          title={`Switch to ${darkVariant === "purple" ? "blue" : "purple"} theme`}
        >
          <Palette className="h-3.5 w-3.5 text-foreground" />
        </button>
      )}

      {/* Light/Dark toggle */}
      <button
        onClick={toggleTheme}
        className="h-8 w-8 flex items-center justify-center rounded-sm border border-border bg-background hover:bg-muted transition-colors flex-shrink-0"
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-foreground" />
        )}
      </button>
    </div>
  );
}
