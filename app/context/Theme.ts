import { createTheme } from "@mui/material/styles";

const baseTheme = {
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    button: {
      textTransform: "none" as const,
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(79, 70, 229, 0.23)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation0: {
          boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },
};

export const LightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" }, // Indigo 600
    secondary: { main: "#ec4899" }, // Pink 500
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#64748b", // Slate 500
    },
    divider: "#e2e8f0", // Slate 200
  },
});

export const DarkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: { main: "#6366f1" }, // Indigo 500
    secondary: { main: "#f472b6" }, // Pink 400
    background: {
      default: "#0f172a", // Slate 900
      paper: "#1e293b", // Slate 800
    },
    text: {
      primary: "#f8fafc", // Slate 50
      secondary: "#94a3b8", // Slate 400
    },
    divider: "#334155", // Slate 700
  },
});
