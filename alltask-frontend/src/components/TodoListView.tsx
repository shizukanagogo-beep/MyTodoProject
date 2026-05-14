import TodoItem from "./TodoItem";
import { useMemo, useState } from "react";
import type { Category, Todo, ViewMode } from "../types";

type DatedFilter = "all" | "today" | "tomorrow" | "undecided";

type TodoListViewProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  showDoneTodos: boolean;
  datedSortMode: "manual" | "dueDate";
  onToggleShowDoneTodos: () => void;
  onChangeDatedSortMode: (mode: "manual" | "dueDate") => void;
  onOpenTodoModal: () => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (fromIndex: number, toIndex: number) => void;
  onReorderSubtasks: (
    parentId: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
  isRandomMode: boolean;
  onToggleRandomTodo: () => void;
  datedFilter: DatedFilter;
  onChangeDatedFilter: (filter: DatedFilter) => void;
};

const getLocalDateString = (offsetDays = 0) => {
  const dateValue = new Date();
  dateValue.setDate(dateValue.getDate() + offsetDays);

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const date = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

const filterButtonBaseClass =
  "px-3 py-2 rounded-xl text-sm font-bold border transition-colors";

const activeFilterButtonClass =
  "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";

const inactiveFilterButtonClass =
  "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

const datedFilterButtonBaseClass =
  "px-3 py-2 text-sm font-bold transition-colors";

const activeDatedFilterButtonClass = "bg-indigo-50 text-indigo-600";

const inactiveDatedFilterButtonClass = "text-slate-600 hover:bg-slate-50";

const datedFilterItems: { value: DatedFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "today", label: "今日" },
  { value: "tomorrow", label: "明日" },
  { value: "undecided", label: "未定" },
];

function TodoListView({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  showDoneTodos,
  datedSortMode,
  onToggleShowDoneTodos,
  onChangeDatedSortMode,
  onOpenTodoModal,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  onReorderTodos,
  onReorderSubtasks,
  onReorderCategories,
  isRandomMode,
  onToggleRandomTodo,
  datedFilter,
  onChangeDatedFilter,
}: TodoListViewProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(
    null,
  );
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<
    Set<number | "uncategorized">
  >(new Set());
  const [collapsedSubtaskParentIds, setCollapsedSubtaskParentIds] = useState<
    Set<number>
  >(new Set());
  const [draggingSubtask, setDraggingSubtask] = useState<{
    parentId: number;
    index: number;
  } | null>(null);
  const canGroupByCategory =
    viewMode === "DATED" || viewMode === "DAILY" || viewMode === "FLAGGED";
  const effectiveGroupByCategory = canGroupByCategory && groupByCategory;
  const canReorder =
    !effectiveGroupByCategory &&
    !isRandomMode &&
    (viewMode !== "DATED" || datedSortMode === "manual");

  const viewTitle =
    viewMode === "CATEGORY_DETAIL"
      ? categories.find((category) => category.id === selectedCategoryId)?.name
      : viewMode === "UNCATEGORIZED"
        ? "カテゴリなし"
        : viewMode === "DATED"
          ? "日付ありタスク"
          : viewMode === "DAILY"
            ? "日課タスク"
            : viewMode === "FLAGGED"
              ? "フラグ付き"
              : "";

  const parentTodos = sortedTodos.filter((todo) => todo.parentId === null);
  const getSubtasks = (parentId: number) =>
    sortedTodos.filter((todo) => todo.parentId === parentId);
  const isOverdueTodo = (todo: Todo) =>
    todo.dueDate !== null &&
    todo.dueDate < getLocalDateString() &&
    todo.status !== "DONE";
  const matchesDirectListCondition = (todo: Todo) => {
    if (viewMode === "DATED") {
      if (datedFilter === "today") {
        return todo.dueDate?.slice(0, 10) === getLocalDateString();
      }
      if (datedFilter === "tomorrow") {
        return todo.dueDate?.slice(0, 10) === getLocalDateString(1);
      }
      if (datedFilter === "undecided") {
        return todo.dueDateUndecided && !isOverdueTodo(todo);
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
  const shouldSubdueTodo = (todo: Todo) =>
    (viewMode === "DATED" || viewMode === "DAILY" || viewMode === "FLAGGED") &&
    !matchesDirectListCondition(todo);
  const todosByCategory = useMemo(() => {
    const categoryGroups = categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        canReorder: true,
        todos: parentTodos.filter((todo) => todo.categoryId === category.id),
      }))
      .filter((group) => group.todos.length > 0);

    const uncategorizedTodos = parentTodos.filter(
      (todo) => todo.categoryId === null,
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
  }, [categories, parentTodos]);

  const handleDropCategory = (targetCategoryId: number | null) => {
    if (targetCategoryId === null) {
      setDraggingCategoryId(null);
      return;
    }

    if (
      draggingCategoryId === null ||
      draggingCategoryId === targetCategoryId
    ) {
      setDraggingCategoryId(null);
      return;
    }

    const fromIndex = categories.findIndex(
      (category) => category.id === draggingCategoryId,
    );
    const toIndex = categories.findIndex(
      (category) => category.id === targetCategoryId,
    );

    if (fromIndex !== -1 && toIndex !== -1) {
      onReorderCategories(fromIndex, toIndex);
    }

    setDraggingCategoryId(null);
  };

  const toggleCategoryCollapsed = (categoryId: number | "uncategorized") => {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  const toggleSubtasksCollapsed = (parentId: number) => {
    setCollapsedSubtaskParentIds((prev) => {
      const next = new Set(prev);

      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }

      return next;
    });
  };

  const renderHeader = () => (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onBackToTop}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold text-slate-800 truncate">
          {viewTitle}
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "DATED" && (
            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              {datedFilterItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onChangeDatedFilter(item.value)}
                  className={`${datedFilterButtonBaseClass} ${
                    datedFilter === item.value
                      ? activeDatedFilterButtonClass
                      : inactiveDatedFilterButtonClass
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {viewMode === "DATED" && (
            <button
              onClick={() =>
                onChangeDatedSortMode(
                  datedSortMode === "dueDate" ? "manual" : "dueDate",
                )
              }
              className={`${filterButtonBaseClass} ${
                datedSortMode === "dueDate"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : inactiveFilterButtonClass
              }`}
            >
              期限順
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleShowDoneTodos}
            className={`${filterButtonBaseClass} ${
              showDoneTodos
                ? activeFilterButtonClass
                : inactiveFilterButtonClass
            }`}
          >
            {showDoneTodos ? "未完了のみ表示" : "完了済みも表示"}
          </button>

          {canGroupByCategory && (
            <button
              onClick={() => {
                setGroupByCategory((prev) => !prev);
                setDraggingIndex(null);
                setDraggingCategoryId(null);
              }}
              className={`${filterButtonBaseClass} ${
                groupByCategory
                  ? activeFilterButtonClass
                  : inactiveFilterButtonClass
              }`}
            >
              カテゴリ別
            </button>
          )}

          <span className="h-6 border-l border-slate-200" />

          <button
            onClick={onToggleRandomTodo}
            className={`${filterButtonBaseClass} ${
              isRandomMode ? activeFilterButtonClass : inactiveFilterButtonClass
            }`}
          >
            ランダム
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onOpenTodoModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-colors"
        >
          +新規タスク
        </button>
      </div>
    </div>
  );

  const renderTodoWithSubtasks = (todo: Todo, index: number) => {
    const subtasks = getSubtasks(todo.id);
    const isSubtasksCollapsed = collapsedSubtaskParentIds.has(todo.id);

    const renderEmptyMessage = () => (
      <div className="text-center py-20 text-slate-400">タスクがありません</div>
    );

    const renderTodoList = () => {
      if (parentTodos.length === 0) {
        return renderEmptyMessage();
      }

      if (effectiveGroupByCategory) {
        return todosByCategory.map(({ id, name, canReorder, todos }) => {
          const collapseId = id ?? "uncategorized";
          const isCollapsed = collapsedCategoryIds.has(collapseId);

          return (
            <section
              key={id ?? "uncategorized"}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropCategory(id)}
              onDragEnd={() => setDraggingCategoryId(null)}
              className={`space-y-2 ${
                id !== null && draggingCategoryId === id ? "opacity-50" : ""
              }`}
            >
              <div
                draggable={canReorder}
                onDragStart={(e) => {
                  if (id === null) {
                    e.preventDefault();
                    return;
                  }
                  setDraggingCategoryId(id);
                }}
                className={`flex items-center gap-2 px-1 pt-2 ${
                  canReorder ? "cursor-move" : ""
                }`}
              >
                <button
                  className="h-6 w-6 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryCollapsed(collapseId);
                  }}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {isCollapsed ? "▶" : "▼"}
                </button>

                <span className="text-sm font-bold text-slate-600">{name}</span>

                <span className="text-xs font-bold text-slate-400">
                  {todos.length}
                </span>
              </div>

              {!isCollapsed && (
                <div className="space-y-3">
                  {todos.map((todo) =>
                    renderTodoWithSubtasks(
                      todo,
                      parentTodos.findIndex(
                        (parentTodo) => parentTodo.id === todo.id,
                      ),
                    ),
                  )}
                </div>
              )}
            </section>
          );
        });
      }

      return parentTodos.map((todo, index) =>
        renderTodoWithSubtasks(todo, index),
      );
    };

    return (
      <div key={todo.id} className="space-y-2">
        <div
          draggable={canReorder}
          onDragStart={() => setDraggingIndex(index)}
          onDragOver={(e) => {
            if (canReorder) e.preventDefault();
          }}
          onDrop={() => {
            if (!canReorder) return;
            if (draggingIndex === null) return;

            onReorderTodos(draggingIndex, index);
            setDraggingIndex(null);
          }}
          onDragEnd={() => setDraggingIndex(null)}
          className={draggingIndex === index ? "opacity-50" : ""}
        >
          <div className="relative">
            {subtasks.length > 0 && (
              <button
                className="absolute -left-5 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-slate-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubtasksCollapsed(todo.id);
                }}
              >
                {isSubtasksCollapsed ? "▶" : "▼"}
              </button>
            )}

            <TodoItem
              todo={todo}
              onToggleStatus={onToggleStatus}
              onDeleteTodo={onDeleteTodo}
              onOpenTodoDetail={onOpenTodoDetail}
              subdued={shouldSubdueTodo(todo)}
            />
          </div>
        </div>

        {subtasks.length > 0 && !isSubtasksCollapsed && (
          <div className="ml-10 space-y-2">
            {subtasks.map((subtask, subtaskIndex) => (
              <div
                key={subtask.id}
                draggable
                onDragStart={() =>
                  setDraggingSubtask({
                    parentId: todo.id,
                    index: subtaskIndex,
                  })
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggingSubtask?.parentId !== todo.id) return;

                  onReorderSubtasks(
                    todo.id,
                    draggingSubtask.index,
                    subtaskIndex,
                  );
                  setDraggingSubtask(null);
                }}
                onDragEnd={() => setDraggingSubtask(null)}
                className={
                  draggingSubtask?.parentId === todo.id &&
                  draggingSubtask.index === subtaskIndex
                    ? "opacity-50"
                    : ""
                }
              >
                <TodoItem
                  todo={subtask}
                  onToggleStatus={onToggleStatus}
                  onDeleteTodo={onDeleteTodo}
                  onOpenTodoDetail={onOpenTodoDetail}
                  subdued={shouldSubdueTodo(subtask)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderHeader()}

      <div className="space-y-3">{renderTodoList()}</div>
    </div>
  );
}

export default TodoListView;
