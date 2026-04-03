import { api } from "./api";

export type TodoStatus = "Pending" | "Completed";

export type Todo = {
  id: number;
  text: string;
  status: TodoStatus;
  userId: number;
};

type TodosListResponse = {
  success: boolean;
  message: string;
  data: Todo[];
};

type TodoMutationResponse = {
  success: boolean;
  message: string;
  data: Todo;
};

type DeleteTodoResponse = {
  success: boolean;
  message: string;
};

export async function fetchTodos(): Promise<Todo[]> {
  const { data } = await api.get<TodosListResponse>("/todos");
  return data.data ?? [];
}

export async function createTodoApi(body: { text: string }) {
  const { data } = await api.post<TodoMutationResponse>("/todos", body);
  return data.data;
}

export async function updateTodoApi(
  id: number,
  body: { text?: string; status?: TodoStatus },
) {
  const { data } = await api.patch<TodoMutationResponse>(`/todos/${id}`, body);
  return data.data;
}

export async function deleteTodoApi(id: number) {
  const { data } = await api.delete<DeleteTodoResponse>(`/todos/${id}`);
  return data;
}
