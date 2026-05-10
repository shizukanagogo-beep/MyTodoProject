import { useState } from "react";
import type { Todo } from "../types";

export function useSelectedTodoModal() {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const openTodoDetailModal = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const closeTodoDetailModal = () => {
    setSelectedTodo(null);
  };

  return {
    selectedTodo,
    openTodoDetailModal,
    closeTodoDetailModal,
  };
}
