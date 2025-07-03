import React, { createContext, useContext, useEffect, useState } from "react";
import { useStorage } from "@/lib/storage/context";
import type { Theme } from "@/lib/storage/types";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { appSettings, updateAppSettings } = useStorage();
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  const theme = appSettings?.theme || "system";

  const isValidTheme = (value: string): value is Theme => {
    return ["light", "dark", "system"].includes(value);
  };

  useEffect(() => {
    const getActualTheme = (): "light" | "dark" => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return theme;
    };

    const updateActualTheme = () => {
      const newActualTheme = getActualTheme();
      setActualTheme(newActualTheme);

      const root = document.documentElement;
      if (newActualTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateActualTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateActualTheme);
      return () => mediaQuery.removeEventListener("change", updateActualTheme);
    }
  }, [theme]);

  const handleSetTheme = async (newTheme: Theme) => {
    if (isValidTheme(newTheme)) {
      try {
        await updateAppSettings({ theme: newTheme });
      } catch (error) {
        console.error("Failed to update theme:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        actualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
