import React, { createContext, useContext, useEffect, useState } from "react";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyThemeSetting, Theme } from "@/lib/storage/types";
import {
  createCssVariablesFromMisskeyTheme,
  parseMisskeyTheme,
} from "./misskey";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
  customTheme?: MisskeyThemeSetting;
  importMisskeyTheme: (json: string) => Promise<MisskeyThemeSetting>;
  clearCustomTheme: () => Promise<void>;
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
  const appliedVariablesRef = React.useRef<string[]>([]);
  const defaultThemeColorRef = React.useRef<string | null>(null);

  const theme = appSettings?.theme || "system";
  const customTheme = appSettings?.customTheme;

  const isValidTheme = (value: string): value is Theme => {
    return ["light", "dark", "system", "custom"].includes(value);
  };

  useEffect(() => {
    const getActualTheme = (): "light" | "dark" => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      if (theme === "custom") {
        if (customTheme?.base === "dark") {
          return "dark";
        }
        return "light";
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
  }, [theme, customTheme?.base]);

  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.querySelector("meta[name='theme-color']");

    if (metaTheme && defaultThemeColorRef.current === null) {
      defaultThemeColorRef.current = metaTheme.getAttribute("content");
    }

    const clearVariables = () => {
      appliedVariablesRef.current.forEach((variable) => {
        root.style.removeProperty(variable);
      });
      appliedVariablesRef.current = [];
      if (metaTheme) {
        const defaultThemeColor = defaultThemeColorRef.current;
        if (defaultThemeColor && defaultThemeColor.length > 0) {
          metaTheme.setAttribute("content", defaultThemeColor);
        } else {
          metaTheme.removeAttribute("content");
        }
      }
    };

    if (theme === "custom" && customTheme) {
      const cssVariables = createCssVariablesFromMisskeyTheme(customTheme);
      clearVariables();
      Object.entries(cssVariables).forEach(([variable, value]) => {
        root.style.setProperty(variable, value);
      });
      appliedVariablesRef.current = Object.keys(cssVariables);
      if (metaTheme) {
        const themeColor =
          cssVariables["--background"] ?? cssVariables["--card"] ?? "";
        if (themeColor) {
          metaTheme.setAttribute("content", themeColor);
        } else {
          metaTheme.removeAttribute("content");
        }
      }
      return () => {
        clearVariables();
      };
    }

    clearVariables();
    return () => {
      clearVariables();
    };
  }, [theme, customTheme]);

  const handleSetTheme = async (newTheme: Theme) => {
    if (isValidTheme(newTheme)) {
      try {
        await updateAppSettings({ theme: newTheme });
      } catch (error) {
        console.error("Failed to update theme:", error);
      }
    }
  };

  const importMisskeyTheme = async (
    json: string,
  ): Promise<MisskeyThemeSetting> => {
    const parsedTheme = parseMisskeyTheme(json);
    try {
      await updateAppSettings({
        customTheme: parsedTheme,
        theme: "custom",
      });
    } catch (error) {
      console.error("Failed to import Misskey theme:", error);
      throw error;
    }
    return parsedTheme;
  };

  const clearCustomTheme = async () => {
    try {
      await updateAppSettings({
        customTheme: undefined,
        theme: theme === "custom" ? "system" : theme,
      });
    } catch (error) {
      console.error("Failed to clear custom theme:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        actualTheme,
        customTheme,
        importMisskeyTheme,
        clearCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
