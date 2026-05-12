import TodoItem from "./TodoItem";
import { useMemo, useState } from "react";
import type { Category, Todo, ViewMode } from "../types";

type TodoListViewProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  showDoneTodos: boolean;
  datedSortMode: "manual" | "dueDate";
  onToggleShowDoneTodos: () => void;
  onChangeDatedSortMode: (mode: "manual" | "dueDate") => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (fromIndex: number, toIndex: number) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
  isRandomMode: boolean;
  onToggleRandomTodo: () => void;
  showTodayOnly: boolean;
  onToggleShowTodayOnly: () => void;
  showTomorrowOnly: boolean;
  onToggleShowTomorrowOnly: () => void;
};

function TodoListView({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  showDoneTodos,
  datedSortMode,
  onToggleShowDoneTodos,
  onChangeDatedSortMode,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  onReorderTodos,
  onReorderCategories,
  isRandomMode,
  onToggleRandomTodo,
  showTodayOnly,
  onToggleShowTodayOnly,
  showTomorrowOnly,
  onToggleShowTomorrowOnly,
}: TodoListViewProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(
    null,
  );
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<
    Set<number | "uncategorized">
  >(new Set());
  const canGroupByCategory =
    viewMode === "DATED" || viewMode === "DAILY" || viewMode === "FLAGGED";
  const effectiveGroupByCategory = canGroupByCategory && groupByCategory;
  const canReorder =
    !effectiveGroupByCategory &&
    !isRandomMode &&
    (viewMode !== "DATED" || datedSortMode === "manual");
  const todosByCategory = useMemo(
    () => {
      const categoryGroups = categories
        .map((category) => ({
          id: category.id,
          name: category.name,
          canReorder: true,
          todos: sortedTodos.filter((todo) => todo.categoryId === category.id),
        }))
        .filter((group) => group.todos.length > 0);

      const uncategorizedTodos = sortedTodos.filter(
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
    },
    [categories, sortedTodos],
  );

  const handleDropCategory = (targetCategoryId: number | null) => {
    if (targetCategoryId === null) {
      setDraggingCategoryId(null);
      return;
    }

    if (draggingCategoryId === null || draggingCategoryId === targetCategoryId) {
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBackToTop}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            ←
          </button>

          <h2 className="text-2xl font-bold text-slate-800 truncate">
            {viewMode === "CATEGORY_DETAIL" &&
              `${categories.find((category) => category.id === selectedCategoryId)?.name}`}
            {viewMode === "UNCATEGORIZED" && "カテゴリなし"}
            {viewMode === "DATED" && "日付ありタスク"}
            {viewMode === "DAILY" && "日課タスク"}
            {viewMode === "FLAGGED" && "フラグ付き"}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {viewMode === "DATED" && (
            <button
              onClick={() =>
                onChangeDatedSortMode(
                  datedSortMode === "dueDate" ? "manual" : "dueDate",
                )
              }
              className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                datedSortMode === "dueDate"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              期限順に並び替える
            </button>
          )}

          {viewMode === "DATED" && (
            <button
              onClick={onToggleShowTodayOnly}
              className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                showTodayOnly
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              今日のタスクのみ
            </button>
          )}

          {viewMode === "DATED" && (
            <button
              onClick={onToggleShowTomorrowOnly}
              className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                showTomorrowOnly
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              明日のタスクのみ
            </button>
          )}

          {canGroupByCategory && (
            <button
              onClick={() => {
                setGroupByCategory((prev) => !prev);
                setDraggingIndex(null);
                setDraggingCategoryId(null);
              }}
              className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                groupByCategory
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              カテゴリごとに表示
            </button>
          )}

          <button
            onClick={onToggleRandomTodo}
            className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
              isRandomMode
                ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            ランダム
          </button>

          <button
            onClick={onToggleShowDoneTodos}
            className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
              showDoneTodos
                ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {showDoneTodos ? "未完了のみ表示" : "完了済みも表示"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {effectiveGroupByCategory
          ? todosByCategory.map(({ id, name, canReorder, todos }) => {
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
                    <span className="text-sm font-bold text-slate-600">
                      {name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {todos.length}
                    </span>
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-3">
                      {todos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggleStatus={onToggleStatus}
                          onDeleteTodo={onDeleteTodo}
                          onOpenTodoDetail={onOpenTodoDetail}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          : sortedTodos.map((todo, index) => (
              <div
                key={todo.id}
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
                <TodoItem
                  todo={todo}
                  onToggleStatus={onToggleStatus}
                  onDeleteTodo={onDeleteTodo}
                  onOpenTodoDetail={onOpenTodoDetail}
                />
              </div>
            ))}

        {sortedTodos.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoListView;
