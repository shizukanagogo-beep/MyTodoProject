import type { Category, DatedFilter, Todo, ViewMode } from "../types";
import { getLocalDateString } from "./date";

export type TodoCategoryGroup = {
  id: number | null;
  name: string;
  canReorder: boolean;
  todos: Todo[];
};

export type ParentContextType = "completed" | "related";

const isOverdueTodo = (todo: Todo, today: string) =>
  todo.dueDate !== null && todo.dueDate < today && todo.status !== "DONE";

export const canGroupTodoListByCategory = (viewMode: ViewMode) =>
  viewMode === "DATED" || viewMode === "DAILY" || viewMode === "FLAGGED";

export function matchesDirectListCondition(
  todo: Todo,
  viewMode: ViewMode,
  datedFilter: DatedFilter,
) {
  if (viewMode === "DATED") {
    const today = getLocalDateString();

    if (datedFilter === "today") {
      return todo.dueDate?.slice(0, 10) === today;
    }

    if (datedFilter === "tomorrow") {
      return todo.dueDate?.slice(0, 10) === getLocalDateString(1);
    }

    if (datedFilter === "undecided") {
      return todo.dueDateUndecided && !isOverdueTodo(todo, today);
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
}

export function getListTodos({
  sortedTodos,
  viewMode,
  datedFilter,
  showDoneTodos,
  showsDirectMatchesOnly,
}: {
  sortedTodos: Todo[];
  viewMode: ViewMode;
  datedFilter: DatedFilter;
  showDoneTodos: boolean;
  showsDirectMatchesOnly: boolean;
}) {
  if (!showsDirectMatchesOnly) {
    return sortedTodos;
  }

  const sortedTodoById = new Map(sortedTodos.map((todo) => [todo.id, todo]));
  const listTodos: Todo[] = [];
  const addedTodoIds = new Set<number>();

  sortedTodos.forEach((todo) => {
    const isVisibleDirectMatch =
      matchesDirectListCondition(todo, viewMode, datedFilter) &&
      (showDoneTodos || todo.status !== "DONE");

    if (!isVisibleDirectMatch) {
      return;
    }

    if (todo.parentId !== null) {
      const parentTodo = sortedTodoById.get(todo.parentId);

      if (parentTodo !== undefined && !addedTodoIds.has(parentTodo.id)) {
        listTodos.push(parentTodo);
        addedTodoIds.add(parentTodo.id);
      }
    }

    if (!addedTodoIds.has(todo.id)) {
      listTodos.push(todo);
      addedTodoIds.add(todo.id);
    }
  });

  return listTodos;
}

export function getParentTodos(listTodos: Todo[]) {
  const listTodoIds = new Set(listTodos.map((todo) => todo.id));

  return listTodos.filter(
    (todo) => todo.parentId === null || !listTodoIds.has(todo.parentId),
  );
}

export function getSubtasks(listTodos: Todo[], parentId: number) {
  return listTodos.filter((todo) => todo.parentId === parentId);
}

export function getParentContextType({
  todo,
  subtasks,
  showDoneTodos,
  showsDirectMatchesOnly,
  viewMode,
  datedFilter,
}: {
  todo: Todo;
  subtasks: Todo[];
  showDoneTodos: boolean;
  showsDirectMatchesOnly: boolean;
  viewMode: ViewMode;
  datedFilter: DatedFilter;
}): ParentContextType | null {
  if (subtasks.length === 0) {
    return null;
  }

  if (!showDoneTodos && todo.status === "DONE") {
    return "completed";
  }

  if (
    showsDirectMatchesOnly &&
    !matchesDirectListCondition(todo, viewMode, datedFilter)
  ) {
    return "related";
  }

  return null;
}

export function getTodoCount({
  todos,
  listTodos,
  showDoneTodos,
  showsDirectMatchesOnly,
  viewMode,
  datedFilter,
}: {
  todos: Todo[];
  listTodos: Todo[];
  showDoneTodos: boolean;
  showsDirectMatchesOnly: boolean;
  viewMode: ViewMode;
  datedFilter: DatedFilter;
}) {
  return todos.reduce((count, todo) => {
    const subtasks = getSubtasks(listTodos, todo.id);
    const parentContextType = getParentContextType({
      todo,
      subtasks,
      showDoneTodos,
      showsDirectMatchesOnly,
      viewMode,
      datedFilter,
    });
    const parentCount = parentContextType === null ? 1 : 0;

    return count + parentCount + subtasks.length;
  }, 0);
}

function getSourceTodo(todo: Todo, todoById: Map<number, Todo>) {
  return todo.parentId === null ? todo : (todoById.get(todo.parentId) ?? todo);
}

function getSourceCategoryId(todo: Todo, todoById: Map<number, Todo>) {
  return getSourceTodo(todo, todoById).categoryId;
}

export function getTodosByCategory({
  categories,
  parentTodos,
  allTodos,
}: {
  categories: Category[];
  parentTodos: Todo[];
  allTodos: Todo[];
}): TodoCategoryGroup[] {
  const todoById = new Map(allTodos.map((todo) => [todo.id, todo]));
  const categoryGroups = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      canReorder: true,
      todos: parentTodos.filter(
        (todo) => getSourceCategoryId(todo, todoById) === category.id,
      ),
    }))
    .filter((group) => group.todos.length > 0);

  const uncategorizedTodos = parentTodos.filter(
    (todo) => getSourceCategoryId(todo, todoById) === null,
  );

  if (uncategorizedTodos.length === 0) {
    return categoryGroups;
  }

  return [
    ...categoryGroups,
    {
      id: null,
      name: "カテゴリなし",
      canReorder: false,
      todos: uncategorizedTodos,
    },
  ];
}
