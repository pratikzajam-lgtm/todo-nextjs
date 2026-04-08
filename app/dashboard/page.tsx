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
import dialog from "../components/dialog";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { AppDrawer } from "../components/drawer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import DraggableDialog from "../components/dialog";

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

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = newTodoText.trim();

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
    setIsOpen(false)
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
      <div className="max-w-md mx-auto mt-10 text-center text-gray-600">
        Checking login…
      </div>
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
        <select
          value={params.row.status}
          onChange={(e) =>
            handleStatusSelectChange(
              e.target.value as TodoStatus,
              params.row.id,
            )
          }
          className="px-2 py-1 border rounded bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
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

      <div className="flex flex-col min-h-screen w-full bg-gray-100 p-6">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-semibold text-slate-900">
              Todo Application
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your tasks, update status, and add new todos quickly.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleaddtodo}
              disabled={isSavingTodo}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <AddIcon className="h-5 w-5" />
              Add Todo
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>

        {isLoading && (
          <p className="text-center text-gray-600 py-4">Loading…</p>
        )}

        <div className="flex-1 max-w-6xl mx-auto w-full">
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
                borderColor: "gray.300",
                "& .MuiDataGrid-cell": { outline: "none" },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
}
