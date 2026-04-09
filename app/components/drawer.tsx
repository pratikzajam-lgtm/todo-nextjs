import React from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setNewTodoText: React.Dispatch<React.SetStateAction<string>>;
  todo: string;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  onClose,
  handleFormSubmit,
  setNewTodoText,
  todo,
}) => {
  
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 320, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
           Todo
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, p: 2 }}
        >
          <TextField
            label="Todo"
            variant="outlined"
            fullWidth
            value={todo}
            onChange={(e) => setNewTodoText(e.target.value)}
          />

          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
