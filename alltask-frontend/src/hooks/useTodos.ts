import { useEffect, useMemo, useState } from "react";
import type { NewTodo, Todo, TodoSearchParams, ViewMode } from "../types";
import { matchesTodoView } from "../utils/todoFilters";
import {
  fetchTodos as fetchTodosApi,
  addTodo as addTodoApi,
  updateTodo as updateTodoApi,
  updateTodoStatus,
  updateTodoSortOrder,
  deleteTodo as deleteTodoApi,
} from "../services/todoService";

const getLocalDateString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

const initialNewTodo: NewTodo = {
  title: "",
  details: "",
  categoryId: "",
  dueDate: "",
  daily: false,
  hasFlag: false,
  autoCarryOver: false,
  overdueBehavior: 0,
  sortOrder: null,
};

type UseTodosArgs = {
  viewMode: ViewMode;
  selectedCategoryId: number | null;
};

export function useTodos({ viewMode, selectedCategoryId }: UseTodosArgs) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<NewTodo>(initialNewTodo);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDoneTodos, setShowDoneTodos] = useState(true);
  const [datedSortMode, setDatedSortMode] = useState<"manual" | "dueDate">(
    "manual",
  );
  const [randomTodoId, setRandomTodoId] = useState<number | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const effectiveShowTodayOnly = viewMode === "DATED" && showTodayOnly;

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
        setRandomTodoId(null);
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
      setRandomTodoId(null);
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

    if (randomTodoId === id && newStatus === "DONE") {
      setRandomTodoId(null);
    }

    try {
      await updateTodoStatus(id, newStatus);
    } catch (error) {
      console.error("更新失敗:", error);
    }
  };

  const updateTodo = async (
    id: number,
    payload: {
      title: string;
      details: string;
      categoryId: number | null;
      dueDate: string | null;
      status: Todo["status"];
      daily: boolean;
      hasFlag: boolean;
      autoCarryOver: boolean;
      overdueBehavior: number;
      sortOrder: number | null;
    },
  ) => {
    if (!payload.title.trim()) {
      alert("タイトルを入力してください");
      return null;
    }

    if (!payload.categoryId) {
      alert("カテゴリが不正です");
      return null;
    }

    try {
      const updatedTodo = await updateTodoApi(id, {
        ...payload,
        categoryId: payload.categoryId,
        dueDate: payload.dueDate || null,
        sortOrder: payload.sortOrder,
      });

      setTodos((prev) => {
        if (!matchesTodoView(updatedTodo, viewMode, selectedCategoryId)) {
          return prev.filter((todo) => todo.id !== id);
        }

        return prev.map((todo) => (todo.id === id ? updatedTodo : todo));
      });

      if (
        randomTodoId === id &&
        (!matchesTodoView(updatedTodo, viewMode, selectedCategoryId) ||
          updatedTodo.status === "DONE")
      ) {
        setRandomTodoId(null);
      }

      return updatedTodo;
    } catch (error) {
      console.error("更新失敗:", error);
      return null;
    }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;

    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    if (randomTodoId === id) {
      setRandomTodoId(null);
    }

    try {
      await deleteTodoApi(id);
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  const today = getLocalDateString();
  const visibleTodos = todos.filter((todo) => {
    if (!showDoneTodos && todo.status === "DONE") {
      return false;
    }
    if (effectiveShowTodayOnly) {
      return todo.dueDate?.slice(0, 10) === today;
    }
    return true;
  });

  const sortedTodos = [...visibleTodos].sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") return 1;
    if (a.status !== "DONE" && b.status === "DONE") return -1;

    if (viewMode === "DATED" && datedSortMode === "dueDate") {
      if (a.dueDate === null && b.dueDate !== null) return 1;
      if (a.dueDate !== null && b.dueDate === null) return -1;
      if (a.dueDate !== null && b.dueDate !== null) {
        const dueDateOrder = a.dueDate.localeCompare(b.dueDate);
        if (dueDateOrder !== 0) return dueDateOrder;
      }
    }

    if (a.sortOrder === null && b.sortOrder !== null) return 1;
    if (a.sortOrder !== null && b.sortOrder === null) return -1;
    if (a.sortOrder !== null && b.sortOrder !== null) {
      return a.sortOrder - b.sortOrder;
    }

    return b.id - a.id;
  });

  const displayedTodos = useMemo(() => {
    if (randomTodoId === null) {
      return sortedTodos;
    }

    return sortedTodos.filter((todo) => todo.id === randomTodoId);
  }, [randomTodoId, sortedTodos]);

  const toggleShowTodayOnly = () => {
    setShowTodayOnly((prev) => !prev);
    setRandomTodoId(null);
  };

  const resetDatedFilters = () => {
    setShowTodayOnly(false);
    setRandomTodoId(null);
  };

  const toggleRandomTodo = () => {
    if (randomTodoId !== null) {
      setRandomTodoId(null);
      return;
    }

    const incompleteTodos = sortedTodos.filter(
      (todo) => todo.status === "INCOMPLETE",
    );

    if (incompleteTodos.length === 0) {
      alert("未完了のタスクがありません。");
      return;
    }

    const randomIndex = Math.floor(Math.random() * incompleteTodos.length);
    setRandomTodoId(incompleteTodos[randomIndex].id);
  };

  const reorderTodos = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (randomTodoId !== null) return;
    if (viewMode === "DATED" && datedSortMode === "dueDate") return;

    const reorderedTodos = [...sortedTodos];
    const [movedTodo] = reorderedTodos.splice(fromIndex, 1);
    reorderedTodos.splice(toIndex, 0, movedTodo);

    const updatedTodos = reorderedTodos.map((todo, index) => ({
      ...todo,
      sortOrder: index + 1,
    }));

    setTodos((prev) => {
      const updatedTodoMap = new Map(
        updatedTodos.map((todo) => [todo.id, todo]),
      );

      return prev.map((todo) => updatedTodoMap.get(todo.id) ?? todo);
    });

    try {
      await updateTodoSortOrder(
        updatedTodos.map((todo) => ({
          id: todo.id,
          sortOrder: todo.sortOrder,
        })),
      );
    } catch (error) {
      console.error("並び順更新失敗:", error);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return {
    sortedTodos: displayedTodos,
    isRandomMode: randomTodoId !== null,
    toggleRandomTodo,
    showDoneTodos,
    setShowDoneTodos,
    datedSortMode,
    setDatedSortMode,
    newTodo,
    setNewTodo,
    addTodo,
    updateTodo,
    toggleStatus,
    deleteTodo,
    reorderTodos,
    showTodayOnly: effectiveShowTodayOnly,
    toggleShowTodayOnly,
    resetDatedFilters,
  };
}
