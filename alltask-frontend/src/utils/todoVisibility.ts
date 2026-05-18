import type { DatedFilter, Todo, ViewMode } from "../types";
import {
  getTodoDateContext,
  isOverdueTodo,
  matchesDatedFilter,
  type TodoDateContext,
} from "./todoDate";

type DatedSortMode = "manual" | "dueDate";

type TodoViewOptions = {
  todos: Todo[];
  viewMode: ViewMode;
  selectedCategoryId: number | null;
  datedFilter: DatedFilter;
};

type VisibleTodoOptions = TodoViewOptions & {
  showDoneTodos: boolean;
};

const getTodoMap = (todos: Todo[]) =>
  new Map(todos.map((todo) => [todo.id, todo]));

const getChildrenByParentId = (todos: Todo[]) =>
  todos.reduce((map, todo) => {
    if (todo.parentId === null) return map;

    const current = map.get(todo.parentId) ?? [];
    current.push(todo);
    map.set(todo.parentId, current);
    return map;
  }, new Map<number, Todo[]>());

const compareTodosByManualOrder = (a: Todo, b: Todo) => {
  if (a.sortOrder === null && b.sortOrder !== null) return 1;
  if (a.sortOrder !== null && b.sortOrder === null) return -1;
  if (a.sortOrder !== null && b.sortOrder !== null) {
    return a.sortOrder - b.sortOrder;
  }

  return b.id - a.id;
};

const compareTodosByDueDate = (a: Todo, b: Todo) => {
  if (a.dueDateUndecided && !b.dueDateUndecided) return 1;
  if (!a.dueDateUndecided && b.dueDateUndecided) return -1;
  if (a.dueDate === null && b.dueDate !== null) return 1;
  if (a.dueDate !== null && b.dueDate === null) return -1;
  if (a.dueDate !== null && b.dueDate !== null) {
    const dueDateOrder = a.dueDate.localeCompare(b.dueDate);
    if (dueDateOrder !== 0) return dueDateOrder;
  }

  return compareTodosByManualOrder(a, b);
};

const sortDatedTodosWithParentGroups = (todos: Todo[]) => {
  const childrenByParentId = getChildrenByParentId(todos);
  const parentTodos = todos
    .filter((todo) => todo.parentId === null)
    .sort(compareTodosByDueDate);

  return parentTodos.flatMap((parentTodo) => [
    parentTodo,
    ...(childrenByParentId.get(parentTodo.id) ?? []).sort(compareTodosByManualOrder),
  ]);
};

const matchesTodoVisibleViewWithMap = ({
  todo,
  todoMap,
  viewMode,
  selectedCategoryId,
  datedFilter,
  dateContext,
}: Omit<TodoViewOptions, "todos"> & {
  todo: Todo;
  todoMap: Map<number, Todo>;
  dateContext: TodoDateContext;
}) => {
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
    return matchesDatedFilter(todo, datedFilter, dateContext);
  }

  if (viewMode === "DAILY") {
    return todo.daily;
  }

  if (viewMode === "FLAGGED") {
    return todo.hasFlag;
  }

  return true;
};

export function matchesTodoVisibleView({
  todo,
  todos,
  viewMode,
  selectedCategoryId,
  datedFilter,
}: TodoViewOptions & { todo: Todo }) {
  return matchesTodoVisibleViewWithMap({
    todo,
    todoMap: getTodoMap(todos),
    viewMode,
    selectedCategoryId,
    datedFilter,
    dateContext: getTodoDateContext(),
  });
}

export function getVisibleTodos({
  todos,
  viewMode,
  selectedCategoryId,
  datedFilter,
  showDoneTodos,
}: VisibleTodoOptions) {
  const dateContext = getTodoDateContext();
  const todoMap = getTodoMap(todos);
  const childrenByParentId = getChildrenByParentId(todos);

  const matchesCurrentView = (todo: Todo) =>
    matchesTodoVisibleViewWithMap({
      todo,
      todoMap,
      viewMode,
      selectedCategoryId,
      datedFilter,
      dateContext,
    });

  const passesDoneFilter = (todo: Todo) =>
    showDoneTodos || todo.status !== "DONE";

  return todos.filter((todo) => {
    if (viewMode === "TOP") {
      return false;
    }

    if (
      viewMode === "DATED" &&
      datedFilter === "undecided" &&
      isOverdueTodo(todo, dateContext.today)
    ) {
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

    return (
      (passesDoneFilter(todo) && matchesCurrentView(todo)) || hasVisibleChild
    );
  });
}

export function sortTodosForView(
  todos: Todo[],
  viewMode: ViewMode,
  datedSortMode: DatedSortMode,
) {
  if (viewMode === "DATED" && datedSortMode === "dueDate") {
    return sortDatedTodosWithParentGroups(todos);
  }

  return [...todos].sort(compareTodosByManualOrder);
}

export function getDisplayedTodos(
  sortedTodos: Todo[],
  randomTodoId: number | null,
) {
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
}

export function getCompletedTodosForView({
  todos,
  viewMode,
  selectedCategoryId,
  datedFilter,
}: TodoViewOptions) {
  const todoMap = getTodoMap(todos);
  const dateContext = getTodoDateContext();

  return todos.filter(
    (todo) =>
      todo.status === "DONE" &&
      matchesTodoVisibleViewWithMap({
        todo,
        todoMap,
        viewMode,
        selectedCategoryId,
        datedFilter,
        dateContext,
      }),
  );
}
