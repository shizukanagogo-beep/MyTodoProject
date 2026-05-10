import type { Todo, ViewMode } from "../types";

export function matchesTodoView(
  todo: Todo,
  viewMode: ViewMode,
  selectedCategoryId: number | null,
) {
  if (viewMode === "CATEGORY_DETAIL") {
    return todo.categoryId === selectedCategoryId;
  }

  if (viewMode === "DATED") {
    return !!todo.dueDate;
  }

  if (viewMode === "DAILY") {
    return todo.daily;
  }

  if (viewMode === "FLAGGED") {
    return todo.hasFlag;
  }

  return true;
}
