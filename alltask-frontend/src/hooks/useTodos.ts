import { useEffect, useState } from "react";
import type { NewTodo, Todo, TodoSearchParams, ViewMode } from "../types";
import {
  fetchTodos as fetchTodosApi,
  addTodo as addTodoApi,
  updateTodoStatus,
  deleteTodo as deleteTodoApi,
} from "../services/todoService";

const initialNewTodo: NewTodo = {
  title: "",
  details: "",
  categoryId: "",
  dueDate: "",
  daily: false,
  hasFlag: false,
  autoCarryOver: false,
  overdueBehavior: 0,
};

type UseTodosArgs = {
  viewMode: ViewMode;
  selectedCategoryId: number | null;
};

export function useTodos({ viewMode, selectedCategoryId }: UseTodosArgs) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<NewTodo>(initialNewTodo);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (viewMode === "TOP") return;

    const loadTodos = async () => {
      const params: TodoSearchParams = {};

      if (viewMode === "CATEGORY_DETAIL") {
        params.categoryId = selectedCategoryId;
      }
      if (viewMode === "DATED") params.existsDueDate = true;
      if (viewMode === "DAILY") params.daily = true;
      if (viewMode === "FLAGGED") params.hasFlag = true;

      try {
        const todos = await fetchTodosApi(params);
        setTodos(todos);
      } catch (error) {
        console.error("タスクの取得に失敗:", error);
      }
    };

    loadTodos();
  }, [viewMode, selectedCategoryId, refreshKey]);

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      alert("タイトルを入力してください");
      return false;
    }

    const finalCategoryId =
      viewMode === "CATEGORY_DETAIL" ? selectedCategoryId : newTodo.categoryId;

    if (!finalCategoryId) {
      alert("カテゴリを選択してください");
      return false;
    }

    const payload = {
      ...newTodo,
      categoryId: Number(finalCategoryId),
      dueDate: newTodo.dueDate || null,
      status: "INCOMPLETE" as const,
    };

    try {
      await addTodoApi(payload);
      setRefreshKey((prev) => prev + 1);
      setNewTodo(initialNewTodo);
      return true;
    } catch (error) {
      console.error("作成失敗:", error);
      return false;
    }
  };

  const toggleStatus = async (id: number, currentStatus: Todo["status"]) => {
    const newStatus = currentStatus === "DONE" ? "INCOMPLETE" : "DONE";

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: newStatus } : todo,
      ),
    );

    try {
      await updateTodoStatus(id, newStatus);
    } catch (error) {
      console.error("更新失敗:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;

    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await deleteTodoApi(id);
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") return 1;
    if (a.status !== "DONE" && b.status === "DONE") return -1;
    return 0;
  });

  return {
    sortedTodos,
    newTodo,
    setNewTodo,
    addTodo,
    toggleStatus,
    deleteTodo,
  };
}
