import TodoItem from "./TodoItem";
import { useState } from "react";
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
  randomTodo: Todo | null;
  onPickRandomTodo: () => void;
  onClearRandomTodo: () => void;
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
  randomTodo,
  onPickRandomTodo,
  onClearRandomTodo,
}: TodoListViewProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const canReorder = viewMode !== "DATED" || datedSortMode === "manual";

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
          <button
            onClick={onPickRandomTodo}
            className="px-3 py-2 rounded-xl text-sm font-bold border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ランダム
          </button>
        </div>
      </div>

      {randomTodo && (
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-500 mb-1">
                ランダムに選ばれたタスク
              </p>

              <button
                className="text-left font-bold text-slate-800 hover:text-indigo-600"
                onClick={() => onOpenTodoDetail(randomTodo)}
              >
                {randomTodo.title}
              </button>

              {randomTodo.details && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                  {randomTodo.details}
                </p>
              )}
            </div>

            <button
              className="text-sm font-bold text-slate-400 hover:text-slate-600"
              onClick={onClearRandomTodo}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sortedTodos.map((todo, index) => (
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
