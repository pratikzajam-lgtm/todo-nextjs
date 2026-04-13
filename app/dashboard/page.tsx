"use client";
import { useState, FormEvent, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/app/lib/api";
import { clearSession } from "@/app/lib/auth";
import {
  fetchTodos,
  createTodoApi,
  updateTodoApi,
  deleteTodoApi,
  TodoStatus,
} from "@/app/lib/todos";
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ThemeContext } from "@/app/context/ThemeContext";
import { AppDrawer } from "../components/drawer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import DraggableDialog from "../components/dialog";
import SearchBar from "../components/Searchbar";
import { MaterialUISwitch } from "../components/switch";
import ArcStack from "../components/spinner";

const TODOS_QUERY_KEY = ["todos"];

function handleApiAuthError(
  error: unknown,
  router: { replace: (href: string) => void },
) {
  const isUnauthorized =
    axios.isAxiosError(error) && error.response?.status === 401;

  if (isUnauthorized) {
    clearSession();
    toast.error("Session expired. Please sign in again.");
    router.replace("/auth/login");
    return;
  }

  toast.error(getApiErrorMessage(error));
}

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [DeleteId, setDeleteId] = useState<number | null>(null);

  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const isDarkMode = theme.palette.mode === "dark";

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    startTransition(() => {
      setToken(savedToken);
    });
    if (!savedToken) {
      router.replace("/auth/login");
    }
  }, [router]);

  const [newTodoText, setNewTodoText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const {
    data: todos = [],
    isLoading,
    isError,
    error: loadTodosError,
  } = useQuery({
    queryKey: [...TODOS_QUERY_KEY, searchQuery, sortBy, order, statusFilter],
    queryFn: () => fetchTodos({
      search: searchQuery || undefined,
      sortBy,
      order,
      status: statusFilter,
    }),
    enabled: token !== null && token !== "",
  });

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  useEffect(() => {
    if (!isError || loadTodosError === undefined) return;
    handleApiAuthError(loadTodosError, router);
  }, [isError, loadTodosError, router]);

  const createTodoMutation = useMutation({
    mutationFn: createTodoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast.success("Todo created successfully");
      setNewTodoText("");
    },
    onError: (error) => handleApiAuthError(error, router),
  });

  const updateTodoTextMutation = useMutation({
    mutationFn: (input: { id: number; text: string }) =>
      updateTodoApi(input.id, { text: input.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast.success("Todo updated successfully");
      setIsOpen(false);
      setNewTodoText("");
      setIsEditing(false);
      setEditingTodoId(null);
    },
    onError: (error) => handleApiAuthError(error, router),
  });

  const changeStatusMutation = useMutation({
    mutationFn: (input: { id: number; status: TodoStatus }) =>
      updateTodoApi(input.id, { status: input.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast.success("Status updated successfully");
    },
    onError: (error) => handleApiAuthError(error, router),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodoApi,
    onSuccess: () => {
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast.success("Todo deleted successfully");
    },
    onError: (error) => handleApiAuthError(error, router),
  });

  function startEditingTodo(todoId: number) {
    const todoToEdit = todos.find((todo) => todo.id === todoId);
    if (todoToEdit === undefined) return;

    setIsEditing(true);
    setIsOpen(true);
    setEditingTodoId(todoId);
    setNewTodoText(todoToEdit.text);
  }

  function isContainSpecialChar(word: string) {
    const charCode = word.charCodeAt(0);
    if (
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      return true;
    }
    return false;
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = newTodoText.trim();

    if (trimmed.length < 3) {
      toast.error("Todo text must be at least 3 characters long");
      return;
    }

    if (isContainSpecialChar(trimmed)) {
      toast.error("Todo text contains special characters");
      return;
    }

    if (!isEditing) {
      if (trimmed === "") {
        toast.error("Please enter a todo");
        return;
      }
      createTodoMutation.mutate({ text: trimmed });
      setIsOpen(false);
      return;
    }

    if (editingTodoId === null) return;

    if (trimmed === "") {
      toast.error("Todo text cannot be empty");
      return;
    }

    updateTodoTextMutation.mutate({
      id: editingTodoId,
      text: trimmed,
    });
  }

  function handleDeleteClick(todoId: number) {
    setIsOpen(false);
    setModalOpen(true);
    setDeleteId(todoId);
  }

  function handleStatusSelectChange(newStatus: TodoStatus, todoId: number) {
    changeStatusMutation.mutate({ id: todoId, status: newStatus });
  }

  function handleLogoutClick() {
    clearSession();
    queryClient.clear();
    router.replace("/auth/login");
  }

  function handleaddtodo() {
    setIsEditing(false);
    setNewTodoText("");
    setEditingTodoId(null);
    setIsOpen(true);
  }

  if (!token) {
    return (
      <Box sx={{ maxWidth: "sm", mx: "auto", mt: 10, textAlign: "center", color: "text.secondary" }}>
        <Typography>Checking login…</Typography>
      </Box>
    );
  }

  const isSavingTodo = createTodoMutation.isPending || updateTodoTextMutation.isPending;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "text", headerName: "Task Description", flex: 1, minWidth: 250 },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const isCompleted = params.row.status === "Completed";
        return (
          <Select
            value={params.row.status}
            onChange={(e) =>
              handleStatusSelectChange(
                e.target.value as TodoStatus,
                params.row.id,
              )
            }
            size="small"
            sx={{ 
              minWidth: 120, 
              bgcolor: isCompleted ? "success.light" : "warning.light",
              color: isCompleted ? "success.dark" : "warning.dark",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover": {
                bgcolor: isCompleted ? "success.main" : "warning.main",
                color: "white"
              }
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
          <Tooltip title="Edit Task">
            <IconButton
              size="small"
              onClick={() => startEditingTodo(params.row.id)}
              sx={{ color: "primary.main", bgcolor: "primary.light", "&:hover": { bgcolor: "primary.main", color: "white" } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Task">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.id)}
              sx={{ color: "error.main", bgcolor: "error.light", "&:hover": { bgcolor: "error.main", color: "white" } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
      <AppDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        handleFormSubmit={handleFormSubmit}
        setNewTodoText={setNewTodoText}
        todo={newTodoText}
      />

      <DraggableDialog
        open={isModalOpen}
        title="Confirm Deletion"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onClose={() => {
          setModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={() => {
          if (DeleteId !== null) {
            deleteTodoMutation.mutate(DeleteId);
          }
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 3 }}>
        {/* Header Section (Glassmorphism) */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: isDarkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            p: 3,
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="800" color="text.primary" sx={{ letterSpacing: "-1px" }}>
              My Tasks
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay organized, focused, and get things done.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexDirection: { xs: "column", sm: "row" } }}>
            <SearchBar
              placeholder="Search tasks..."
              size="small"
              sx={{
                width: { xs: "100%", sm: 280 },
                "& .MuiInputBase-root": {
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                },
              }}
              onSearch={handleSearch}
            />
            <Select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value ? e.target.value : undefined)}
              displayEmpty
              size="small"
              sx={{ height: 40, minWidth: 140, borderRadius: 2, bgcolor: "background.paper" }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: { xs: "space-between", lg: "flex-start" }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MaterialUISwitch checked={isDarkMode} onChange={toggleTheme} />
              <Tooltip title="Logout">
                <IconButton onClick={handleLogoutClick} sx={{ color: "text.secondary" }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleaddtodo}
              disabled={isSavingTodo}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, px: 3, py: 1 }}
            >
              Add Task
            </Button>
          </Box>
        </Paper>

        {/* Data List */}
        <Paper
          elevation={0}
          sx={{
            height: "65vh",
            width: "100%",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: "0px 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          <DataGrid
            rows={todos}
            loading={isLoading}
            slots={{
              loadingOverlay: () => (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <ArcStack size={60} />
                </Box>
              )
            }}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sortingMode="server"
            onSortModelChange={(newSortModel) => {
              if (newSortModel.length > 0) {
                setSortBy(newSortModel[0].field);
                setOrder(newSortModel[0].sort === "desc" ? "desc" : "asc");
              } else {
                setSortBy(undefined);
                setOrder(undefined);
              }
            }}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                borderBottom: "1px solid",
                borderColor: "divider"
              },
              "& .MuiDataGrid-cell": { 
                borderBottom: "1px solid",
                borderColor: "divider",
                outline: "none !important" 
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
              }
            }}
          />
        </Paper>
      </Box>
    </>
  );
}

