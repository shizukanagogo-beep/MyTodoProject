import { api } from "../api";
import type { Category } from "../types";

export async function fetchCategories() {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function addCategory(name: string) {
  const response = await api.post<Category>("/categories", { name });
  return response.data;
}
