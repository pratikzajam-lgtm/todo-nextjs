"use client";
import { useState, FormEvent, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/app/lib/api";
import { clearSession } from "@/app/lib/auth";
import {
  fetchTodos,
  createTodoApi,
  updateTodoApi,
  deleteTodoApi,
} from "@/app/lib/todos";
import type { TodoStatus } from "@/app/lib/todos";


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
  const router = useRouter();
  const queryClient = useQueryClient();


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
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast.success("Todo deleted successfully");
    },
    onError: (error) => handleApiAuthError(error, router),
  });

  function cancelEditing() {
    setIsEditing(false);
    setEditingTodoId(null);
    setNewTodoText("");
  }

  function startEditingTodo(todoId: number) {
    const todoToEdit = todos.find((todo) => todo.id === todoId);
    if (todoToEdit === undefined) return;

    setIsEditing(true);
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
    const userConfirmed = window.confirm(
      "Do you really want to delete this todo?",
    );
    if (userConfirmed) {
      deleteTodoMutation.mutate(todoId);
    }
  }

  function handleStatusSelectChange(
    newStatus: TodoStatus,
    todoId: number,
  ) {
    changeStatusMutation.mutate({ id: todoId, status: newStatus });
  }

  function handleLogoutClick() {
    clearSession();
    queryClient.clear();
    router.replace("/auth/login");
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
  const isStatusBusy = changeStatusMutation.isPending;

  return (
    <div className="max-w-md mx-auto mt-10 font-sans px-4">
      <header className="mb-6 text-center relative">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="absolute right-0 top-0 text-sm text-blue-600 hover:underline"
        >
          Log out
        </button>
        <h1 className="text-3xl font-bold">Todo Application</h1>
      </header>

      <form onSubmit={handleFormSubmit}>
        <section className="mb-4 flex gap-2">
          <input
            value={newTodoText}
            onChange={(event) => setNewTodoText(event.target.value)}
            type="text"
            placeholder="Enter new todo"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSavingTodo}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
          >
            {isEditing ? "Update" : "Submit"}
          </button>
        </section>
      </form>

      {isEditing && (
        <button
          type="button"
          onClick={cancelEditing}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel edit
        </button>
      )}

      {isLoading && (
        <p className="text-center text-gray-600 py-4">Loading…</p>
      )}

      <ul className="divide-y divide-gray-300">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="py-2 flex justify-between items-center gap-2 flex-wrap"
          >
            <span className="min-w-0 flex-1">{todo.text}</span>

            <span>
              <select
                value={todo.status}
                disabled={isStatusBusy}
                onChange={(event) =>
                  handleStatusSelectChange(
                    event.target.value as TodoStatus,
                    todo.id,
                  )
                }
                className="px-2 py-1 border rounded bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </span>

            <span>
              <button
                type="button"
                onClick={() => startEditingTodo(todo.id)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
            </span>

            <span>
              <button
                type="button"
                onClick={() => handleDeleteClick(todo.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
