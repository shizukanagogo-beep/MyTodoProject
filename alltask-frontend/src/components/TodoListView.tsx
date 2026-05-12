import TodoItem from "./TodoItem";
import { useState } from "react";
import type { Category, Todo, ViewMode } from "../types";

type TodoListViewProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  showDoneTodos: boolean;
  onToggleShowDoneTodos: () => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (fromIndex: number, toIndex: number) => void;
};

function TodoListView({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  showDoneTodos,
  onToggleShowDoneTodos,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  onReorderTodos,
}: TodoListViewProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
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

        <button
          onClick={onToggleShowDoneTodos}
          className={`shrink-0 px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
            showDoneTodos
              ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {showDoneTodos ? "未完了のみ表示" : "完了済みも表示"}
        </button>
      </div>

      <div className="space-y-3">
        {sortedTodos.map((todo, index) => (
          <div
            key={todo.id}
            draggable
            onDragStart={() => setDraggingIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
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
