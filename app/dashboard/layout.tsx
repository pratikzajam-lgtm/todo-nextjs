"use client";

import React, { useState } from "react";
import { Box, IconButton, AppBar, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Sidebar } from "../components/Sidebar";

const drawerWidth = 260;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile App Bar just for the hamburger menu */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { sm: "none" },
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, sm: 4 }, flexGrow: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
