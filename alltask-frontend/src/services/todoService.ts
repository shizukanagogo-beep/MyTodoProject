import { api } from "../api";
import type { Todo, TodoSearchParams, NewTodo } from "../types";

export type AddTodoPayload = Omit<NewTodo, "categoryId" | "dueDate"> & {
  categoryId: number;
  dueDate: string | null;
  status: "INCOMPLETE";
};

export async function fetchTodos(params: TodoSearchParams) {
  const response = await api.get<Todo[]>("/todos", { params });
  return response.data;
}

export async function addTodo(payload: AddTodoPayload) {
  await api.post("/todos", payload);
}

export async function updateTodoStatus(id: number, status: Todo["status"]) {
  await api.patch(`/todos/${id}/status`, `"${status}"`, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteTodo(id: number) {
  await api.delete(`/todos/${id}`);
}
