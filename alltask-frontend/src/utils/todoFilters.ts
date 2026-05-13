import type { Todo, ViewMode } from "../types";

export function matchesTodoView(
  todo: Todo,
  viewMode: ViewMode,
  selectedCategoryId: number | null,
) {
  if (viewMode === "CATEGORY_DETAIL") {
    return todo.categoryId === selectedCategoryId;
  }

  if (viewMode === "UNCATEGORIZED") {
    return todo.categoryId === null;
  }

  if (viewMode === "DATED") {
    return !!todo.dueDate || todo.dueDateUndecided;
  }

  if (viewMode === "DAILY") {
    return todo.daily;
  }

  if (viewMode === "FLAGGED") {
    return todo.hasFlag;
  }

  return true;
}
