import { api } from "../api";
import type { Todo, TodoSearchParams, NewTodo } from "../types";

export type AddTodoPayload = Omit<NewTodo, "categoryId" | "dueDate"> & {
  categoryId: number;
  dueDate: string | null;
  status: "INCOMPLETE";
};

export type UpdateTodoPayload = Omit<NewTodo, "categoryId" | "dueDate"> & {
  categoryId: number;
  dueDate: string | null;
  status: Todo["status"];
};

export type TodoSortOrderPayload = {
  id: number;
  sortOrder: number;
};

export async function fetchTodos(params: TodoSearchParams) {
  const response = await api.get<Todo[]>("/todos", { params });
  return response.data;
}

export async function addTodo(payload: AddTodoPayload) {
  await api.post("/todos", payload);
}

export async function updateTodo(id: number, payload: UpdateTodoPayload) {
  const response = await api.put<Todo>(`/todos/${id}`, payload);
  return response.data;
}

export async function updateTodoStatus(id: number, status: Todo["status"]) {
  await api.patch(`/todos/${id}/status`, `"${status}"`, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function updatedTodoSortOrder(payload: TodoSortOrderPayload[]) {
  await api.patch("/todos/sort-order", payload);
}

export async function deleteTodo(id: number) {
  await api.delete(`/todos/${id}`);
}
