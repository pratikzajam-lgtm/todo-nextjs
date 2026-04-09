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
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import { ThemeContext } from "@/app/context/ThemeContext";
import { AppDrawer } from "../components/drawer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import DraggableDialog from "../components/dialog";
import SearchBar from "../components/Searchbar";

const TODOS_QUERY_KEY = ["todos"];

function handleSearch(query: string) {
  // Implement search functionality here
  console.log("Search query:", query);
}

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff",
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...(theme.applyStyles
          ? theme.applyStyles("dark", {
              backgroundColor: "#8796A5",
            })
          : {}),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff",
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...(theme.applyStyles
      ? theme.applyStyles("dark", {
          backgroundColor: "#003892",
        })
      : {}),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...(theme.applyStyles
      ? theme.applyStyles("dark", {
          backgroundColor: "#8796A5",
        })
      : {}),
  },
}));

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

  const {
    data: todos = [],
    isLoading,
    isError,
    error: loadTodosError,
  } = useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: fetchTodos,
    enabled: token !== null && token !== "",
  });

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

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ flex: 1, maxWidth: "xl", mx: "auto", width: "100%" }}>
          <Box sx={{ height: "70vh", width: "100%" }}>
            <DataGrid
              rows={todos}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
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
