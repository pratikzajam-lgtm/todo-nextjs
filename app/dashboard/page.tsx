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
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ThemeContext } from "@/app/context/ThemeContext";
import { AppDrawer } from "../components/drawer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import DraggableDialog from "../components/dialog";
import SearchBar from "../components/Searchbar";

import { MaterialUISwitch } from "../components/switch";
import ArcStack from "../components/spinner";

const TODOS_QUERY_KEY = ["todos"];function handleApiAuthError(
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
      console.log("edit");
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
      (charCode >= 91 && charCode <= 96)
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
    setIsOpen(true);
  }

  if (!token) {
    return (
      <Box
        sx={{
          maxWidth: "sm",
          mx: "auto",
          mt: 10,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography>Checking login…</Typography>
      </Box>
    );
  }

  const isSavingTodo =
    createTodoMutation.isPending || updateTodoTextMutation.isPending;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "text", headerName: "TODO", width: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(e) =>
            handleStatusSelectChange(
              e.target.value as TodoStatus,
              params.row.id,
            )
          }
          size="small"
          sx={{ minWidth: 120, bgcolor: "background.paper" }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <EditIcon
          onClick={() => startEditingTodo(params.row.id)}
          className="text-yellow-500 cursor-pointer hover:text-yellow-600"
        />
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <DeleteIcon
          onClick={() => handleDeleteClick(params.row.id)}
          className="text-red-500 cursor-pointer hover:text-red-600"
        />
      ),
    },
  ];

  return (
    <>
      <AppDrawer
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        handleFormSubmit={handleFormSubmit}
        setNewTodoText={setNewTodoText}
        todo={newTodoText}
      />

      <>
        <DraggableDialog
          open={isModalOpen}
          title="Confirm Deletion"
          description="Are you sure you want to delete this todo?"
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
      </>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          bgcolor: "grey.100",
          p: 3,
        }}
      >
        {/* Header */}

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            borderRadius: 4,
            border: 1,
            borderColor: "grey.200",
            bgcolor: "background.paper",
            p: 3,
            alignItems: { xs: "center", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              color="text.primary"
            >
              Todo Application
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your tasks, update status, and add new todos quickly.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexDirection: { xs: "column", sm: "row" } }}>
            <SearchBar
              placeholder="Search"
              size="small"
              sx={{
                width: 250,
                "& .MuiInputBase-root": {
                  height: 32,
                },
                "& .MuiInputBase-input": {
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                },
              }}
              onSearch={handleSearch}
            />
            <Select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value ? e.target.value : undefined)}
              displayEmpty
              size="small"
              sx={{ height: 32, minWidth: 120, fontSize: "0.8rem" }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <MaterialUISwitch checked={isDarkMode} onChange={toggleTheme} />
            <Button
              variant="contained"
              color="primary"
              onClick={handleaddtodo}
              disabled={isSavingTodo}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 10, px: 3, py: 1 }}
            >
              Add Todo
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogoutClick}
              sx={{ borderRadius: 10, px: 3, py: 1, color: "text.secondary" }}
            >
              Log out
            </Button>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, maxWidth: "xl", mx: "auto", width: "100%" }}>
          <Box sx={{ height: "70vh", width: "100%" }}>
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
                pagination: { paginationModel: { pageSize: 5 } },
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
                borderRadius: 2,
                border: 1,
                borderColor: "grey.300",
                bgcolor: "background.paper",
                "& .MuiDataGrid-cell": { outline: "none" },
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
