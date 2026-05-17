import { useEffect, useMemo, useState } from "react";
import { APP_MESSAGES } from "../constants/messages";
import type { DatedFilter, NewTodo, Todo, ViewMode } from "../types";
import {
  getApiErrorMessage,
  getApiFieldErrors,
  type ApiFieldErrors,
} from "../utils/apiError";
import { showErrorToast, showInfoToast } from "../utils/toast";
import {
  getDisplayedTodos,
  getVisibleTodos,
  getCompletedTodosForView,
  matchesTodoVisibleView,
  sortTodosForView,
} from "../utils/todoVisibility";
import { matchesTodoView } from "../utils/todoFilters";
import {
  fetchTodos as fetchTodosApi,
  addTodo as addTodoApi,
  updateTodo as updateTodoApi,
  updateTodoStatus,
  updateTodoSortOrder,
  deleteTodo as deleteTodoApi,
} from "../services/todoService";

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

type AddTodoResult = {
  success: boolean;
  fieldErrors?: ApiFieldErrors | null;
};

export type UpdateTodoResult = {
  success: boolean;
  updatedTodo?: Todo;
  fieldErrors?: ApiFieldErrors | null;
};

const getTitleRequiredFieldErrors = (): ApiFieldErrors => ({
  title: APP_MESSAGES.validation.titleRequired,
});

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
        showErrorToast(getApiErrorMessage(error));
      }
    };

    loadTodos();
  }, [viewMode, selectedCategoryId, refreshKey]);

  const addTodo = async (): Promise<AddTodoResult> => {
    if (!newTodo.title.trim()) {
      return {
        success: false,
        fieldErrors: getTitleRequiredFieldErrors(),
      };
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
      return { success: true };
    } catch (error) {
      console.error("作成失敗:", error);

      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors) {
        return { success: false, fieldErrors };
      }

      showErrorToast(getApiErrorMessage(error));
      return { success: false };
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
      showErrorToast(getApiErrorMessage(error));
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
  ): Promise<UpdateTodoResult> => {
    if (!payload.title.trim()) {
      return {
        success: false,
        fieldErrors: getTitleRequiredFieldErrors(),
      };
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

      return { success: true, updatedTodo };
    } catch (error) {
      console.error("更新失敗:", error);

      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors) {
        return { success: false, fieldErrors };
      }

      showErrorToast(getApiErrorMessage(error));
      return { success: false };
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
      showErrorToast(getApiErrorMessage(error));
      return false;
    }
  };

  const deleteTodo = async (id: number) => {
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
      showErrorToast(getApiErrorMessage(error));
      setRefreshKey((prev) => prev + 1);
    }
  };

  const deleteCompletedTodos = async (targetTodos: Todo[]) => {
    if (targetTodos.length === 0) {
      return;
    }

    const targetIds = new Set(targetTodos.map((todo) => todo.id));
    const requestIds = targetTodos
      .filter((todo) => todo.parentId === null || !targetIds.has(todo.parentId))
      .map((todo) => todo.id);

    setTodos((prev) =>
      prev.filter(
        (todo) =>
          !targetIds.has(todo.id) &&
          (todo.parentId === null || !targetIds.has(todo.parentId)),
      ),
    );

    if (randomTodoId !== null) {
      setRandomTodoId(null);
    }

    try {
      await Promise.all(requestIds.map((id) => deleteTodoApi(id)));
    } catch (error) {
      console.error("完了済みタスク削除失敗:", error);
      showErrorToast(getApiErrorMessage(error));
      setRefreshKey((prev) => prev + 1);
    }
  };

  const visibleTodos = useMemo(
    () =>
      getVisibleTodos({
        todos,
        viewMode,
        selectedCategoryId,
        datedFilter: effectiveDatedFilter,
        showDoneTodos,
      }),
    [todos, viewMode, selectedCategoryId, effectiveDatedFilter, showDoneTodos],
  );

  const sortedTodos = useMemo(
    () => sortTodosForView(visibleTodos, viewMode, datedSortMode),
    [visibleTodos, viewMode, datedSortMode],
  );

  const displayedTodos = useMemo(
    () => getDisplayedTodos(sortedTodos, randomTodoId),
    [randomTodoId, sortedTodos],
  );

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
      (todo) =>
        todo.status === "INCOMPLETE" &&
        matchesTodoVisibleView({
          todo,
          todos,
          viewMode,
          selectedCategoryId,
          datedFilter: effectiveDatedFilter,
        }),
    );

    if (incompleteTodos.length === 0) {
      showInfoToast(APP_MESSAGES.random.noIncompleteTodos);
      return;
    }

    const randomIndex = Math.floor(Math.random() * incompleteTodos.length);
    setRandomTodoId(incompleteTodos[randomIndex].id);
  };

  const getCompletedTodosByCurrentView = () =>
    getCompletedTodosForView({
      todos,
      viewMode,
      selectedCategoryId,
      datedFilter: effectiveDatedFilter,
    });

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
      showErrorToast(getApiErrorMessage(error));
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
      showErrorToast(getApiErrorMessage(error));
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
    deleteCompletedTodos,
    getCompletedTodosByCurrentView,
    reorderTodos,
    reorderSubtasks,
    datedFilter: effectiveDatedFilter,
    setDatedFilter: changeDatedFilter,
    resetDatedFilters,
  };
}
