"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DarkVariant = "purple" | "blue";

interface ThemeState {
    darkVariant: DarkVariant;
    setDarkVariant: (v: DarkVariant) => void;
    toggleDarkVariant: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            darkVariant: "purple" as DarkVariant,
            setDarkVariant: (v) => set({ darkVariant: v }),
            toggleDarkVariant: () =>
                set((s) => ({
                    darkVariant: s.darkVariant === "purple" ? "blue" : "purple",
                })),
        }),
        { name: "theme-variant" },
    ),
);
