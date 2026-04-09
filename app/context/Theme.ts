import { createTheme } from "@mui/material/styles";

export const LightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#42a5f5" },
    secondary: { main: "#7e57c2" },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
  },
});

export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#42a5f5" },
    secondary: { main: "#9575cd" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});
