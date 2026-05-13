import { useEffect, useMemo, useState } from "react";
import type { NewTodo, Todo, ViewMode } from "../types";
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

  return formatLocalDate(today);
};

const getTomorrowLocalDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return formatLocalDate(tomorrow);
};

const formatLocalDate = (dateValue: Date) => {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const date = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

const initialNewTodo: NewTodo = {
  title: "",
  details: "",
  categoryId: "",
  parentId: null,
  dueDate: "",
  dueDateUndecided: false,
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

type DatedFilter = "all" | "today" | "tomorrow" | "undecided";

export function useTodos({ viewMode, selectedCategoryId }: UseTodosArgs) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<NewTodo>(initialNewTodo);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDoneTodos, setShowDoneTodos] = useState(true);
  const [datedSortMode, setDatedSortMode] = useState<"manual" | "dueDate">(
    "manual",
  );
  const [randomTodoId, setRandomTodoId] = useState<number | null>(null);
  const [datedFilter, setDatedFilter] = useState<DatedFilter>("all");
  const effectiveDatedFilter: DatedFilter =
    viewMode === "DATED" ? datedFilter : "all";

  useEffect(() => {
    if (viewMode === "TOP") return;

    const loadTodos = async () => {
      try {
        const todos = await fetchTodosApi({});
        setTodos(todos);
        setRandomTodoId(null);
      } catch (error) {
        console.error("タスクの取得に失敗:", error);
      }
    };

    loadTodos();
  }, [viewMode, selectedCategoryId, refreshKey]);

  useEffect(() => {
    if (viewMode !== "DATED") {
      setDatedFilter("all");
      setRandomTodoId(null);
    }
  }, [viewMode]);

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      alert("タイトルを入力してください");
      return false;
    }

    const finalCategoryId =
      newTodo.categoryId === "" ? null : newTodo.categoryId;

    const payload = {
      ...newTodo,
      categoryId:
        typeof finalCategoryId === "number" ? Number(finalCategoryId) : null,
      parentId: null,
      dueDate: newTodo.dueDate || null,
      dueDateUndecided: newTodo.dueDateUndecided,
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
      parentId?: number | null;
      dueDate: string | null;
      dueDateUndecided: boolean;
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

    try {
      const updatedTodo = await updateTodoApi(id, {
        ...payload,
        categoryId: payload.categoryId,
        parentId: payload.parentId ?? null,
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

  const addSubtask = async (
    parentId: number,
    payload: {
      title: string;
      details: string;
      dueDate: string | null;
      dueDateUndecided: boolean;
      daily: boolean;
      hasFlag: boolean;
      autoCarryOver: boolean;
      overdueBehavior: number;
      sortOrder: number | null;
    },
  ) => {
    if (!payload.title.trim()) {
      alert("タイトルを入力してください");
      return false;
    }

    try {
      await addTodoApi({
        ...payload,
        categoryId: null,
        parentId,
        dueDate: payload.dueDate || null,
        dueDateUndecided: payload.dueDateUndecided,
        status: "INCOMPLETE",
      });
      setRefreshKey((prev) => prev + 1);
      setRandomTodoId(null);
      return true;
    } catch (error) {
      console.error("サブタスク作成失敗:", error);
      return false;
    }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;

    setTodos((prev) =>
      prev.filter((todo) => todo.id !== id && todo.parentId !== id),
    );

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
  const tomorrow = getTomorrowLocalDateString();
  const todoMap = new Map(todos.map((todo) => [todo.id, todo]));
  const childrenByParentId = todos.reduce((map, todo) => {
    if (todo.parentId === null) return map;

    const current = map.get(todo.parentId) ?? [];
    current.push(todo);
    map.set(todo.parentId, current);
    return map;
  }, new Map<number, Todo[]>());
  const matchesCurrentView = (todo: Todo) => {
    if (viewMode === "CATEGORY_DETAIL") {
      const parentTodo =
        todo.parentId === null ? todo : todoMap.get(todo.parentId);
      return parentTodo?.categoryId === selectedCategoryId;
    }

    if (viewMode === "UNCATEGORIZED") {
      const parentTodo =
        todo.parentId === null ? todo : todoMap.get(todo.parentId);
      return parentTodo?.categoryId === null;
    }

    if (viewMode === "DATED") {
      if (effectiveDatedFilter === "today") {
        return todo.dueDate?.slice(0, 10) === today;
      }
      if (effectiveDatedFilter === "tomorrow") {
        return todo.dueDate?.slice(0, 10) === tomorrow;
      }
      if (effectiveDatedFilter === "undecided") {
        return todo.dueDateUndecided;
      }
      return todo.dueDate !== null || todo.dueDateUndecided;
    }

    if (viewMode === "DAILY") {
      return todo.daily;
    }

    if (viewMode === "FLAGGED") {
      return todo.hasFlag;
    }

    return true;
  };

  const passesDoneFilter = (todo: Todo) =>
    showDoneTodos || todo.status !== "DONE";

  const visibleTodos = todos.filter((todo) => {
    if (viewMode === "TOP") {
      return false;
    }

    if (todo.parentId !== null) {
      const parentTodo = todoMap.get(todo.parentId);
      return (
        parentTodo !== undefined &&
        passesDoneFilter(todo) &&
        (matchesCurrentView(todo) || matchesCurrentView(parentTodo))
      );
    }

    const hasVisibleChild = (childrenByParentId.get(todo.id) ?? []).some(
      (child) => passesDoneFilter(child) && matchesCurrentView(child),
    );

    return (passesDoneFilter(todo) && matchesCurrentView(todo)) || hasVisibleChild;
  });

  const sortedTodos = [...visibleTodos].sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") return 1;
    if (a.status !== "DONE" && b.status === "DONE") return -1;

    if (viewMode === "DATED" && datedSortMode === "dueDate") {
      if (a.dueDateUndecided && !b.dueDateUndecided) return 1;
      if (!a.dueDateUndecided && b.dueDateUndecided) return -1;
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

    const randomTodo = sortedTodos.find((todo) => todo.id === randomTodoId);
    if (randomTodo === undefined) {
      return sortedTodos;
    }

    if (randomTodo.parentId !== null) {
      return sortedTodos.filter(
        (todo) => todo.id === randomTodo.parentId || todo.id === randomTodoId,
      );
    }

    return sortedTodos.filter(
      (todo) => todo.id === randomTodoId || todo.parentId === randomTodoId,
    );
  }, [randomTodoId, sortedTodos]);

  const changeDatedFilter = (filter: DatedFilter) => {
    setDatedFilter(filter);
    setRandomTodoId(null);
  };

  const resetDatedFilters = () => {
    setDatedFilter("all");
    setRandomTodoId(null);
  };

  const toggleRandomTodo = () => {
    if (randomTodoId !== null) {
      setRandomTodoId(null);
      return;
    }

    const incompleteTodos = sortedTodos.filter(
      (todo) => todo.status === "INCOMPLETE" && matchesCurrentView(todo),
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

    const reorderedTodos = sortedTodos.filter((todo) => todo.parentId === null);
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

  const reorderSubtasks = async (
    parentId: number,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;

    const subtasks = sortedTodos.filter((todo) => todo.parentId === parentId);
    const reorderedSubtasks = [...subtasks];
    const [movedTodo] = reorderedSubtasks.splice(fromIndex, 1);
    reorderedSubtasks.splice(toIndex, 0, movedTodo);

    const updatedSubtasks = reorderedSubtasks.map((todo, index) => ({
      ...todo,
      sortOrder: index + 1,
    }));

    setTodos((prev) => {
      const updatedTodoMap = new Map(
        updatedSubtasks.map((todo) => [todo.id, todo]),
      );

      return prev.map((todo) => updatedTodoMap.get(todo.id) ?? todo);
    });

    try {
      await updateTodoSortOrder(
        updatedSubtasks.map((todo) => ({
          id: todo.id,
          sortOrder: todo.sortOrder,
        })),
      );
    } catch (error) {
      console.error("サブタスク並び順更新失敗:", error);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return {
    sortedTodos: displayedTodos,
    allTodos: todos,
    isRandomMode: randomTodoId !== null,
    toggleRandomTodo,
    showDoneTodos,
    setShowDoneTodos,
    datedSortMode,
    setDatedSortMode,
    newTodo,
    setNewTodo,
    addTodo,
    addSubtask,
    updateTodo,
    toggleStatus,
    deleteTodo,
    reorderTodos,
    reorderSubtasks,
    datedFilter: effectiveDatedFilter,
    setDatedFilter: changeDatedFilter,
    resetDatedFilters,
  };
}
