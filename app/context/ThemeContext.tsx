"use client";
import { createContext, useState, ReactNode, useMemo } from "react";
import { LightTheme, DarkTheme } from "./Theme";
import { useMediaQuery } from "@mui/material";
import { Theme as MuiTheme } from "@mui/material/styles";

interface ThemeContextType {
  theme: MuiTheme;
  toggleTheme: () => void;
}

type ThemeMode = "light" | "dark" | "system";

export const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  toggleTheme: () => {},
});

export const ThemeContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ThemeMode>("light");

  const theme = useMemo(() => {
    if (mode === "light") return LightTheme;
    if (mode === "dark") return DarkTheme;
    return prefersDarkMode ? DarkTheme : LightTheme;
  }, [mode, prefersDarkMode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
