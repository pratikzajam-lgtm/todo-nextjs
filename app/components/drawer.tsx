import React, { useState } from "react";
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
      <Box
        sx={{ width: 320 }}
        className="h-full flex flex-col justify-between"
      >
        {/* Header */}
        <Box className="p-4 border-b">
          <Typography variant="h6" fontWeight="bold">
            Add Todo
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          className="flex-1 flex flex-col gap-4 p-4"
        >
          <TextField
            label="Todo"
            variant="outlined"
            fullWidth
            value={todo}
            onChange={(e) => setNewTodoText(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
          >
            Submit
          </Button>
        </Box>

        <Divider />

        {/* Footer */}
        <Box className="p-4">
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