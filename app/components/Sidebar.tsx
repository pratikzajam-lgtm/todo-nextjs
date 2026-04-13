"use client";

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";

const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onTransitionEnd: () => void;
  onClose: () => void;
}

const MENU_ITEMS = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "My Tasks", icon: <TaskAltIcon />, path: "/dashboard/tasks" },
  { text: "Profile", icon: <PersonIcon />, path: "/dashboard/profile" },
  { text: "Settings", icon: <SettingsIcon />, path: "/dashboard/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onTransitionEnd,
  onClose,
}) => {
  const pathname = usePathname();

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.contrastText",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
          }}
        >
          <TaskAltIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
          TodoApp
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

      <List sx={{ px: 2, flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: "10px",
                  transition: "all 0.2s ease-in-out",
                  bgcolor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.secondary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "white" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            textAlign: "center"
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            TodoApp Pro
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }} color="text.primary">
            Upgrade for more features
          </Typography>
          <Typography 
            variant="button" 
            color="primary" 
            sx={{ fontWeight: "bold", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            Upgrade Now
          </Typography>
        </Box>
      </Box>

    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, zIndex: 1200 }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={onTransitionEnd}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.05)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
