import type { Todo } from "../types";
import TrashIcon from "./icons/TrashIcon";

type TodoItemProps = {
  todo: Todo;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  subdued?: boolean;
};

function TodoItem({
  todo,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  subdued = false,
}: TodoItemProps) {
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
  };
  const today = getLocalDateString();
  const isOverdue =
    todo.dueDate !== null && todo.dueDate < today && todo.status !== "DONE";
  const stateClass =
    todo.status === "DONE"
      ? "opacity-60 bg-slate-50"
      : subdued
        ? "shadow-none border-2 border-dashed border-slate-300 bg-slate-50/40"
        : "";
  const contentClass = todo.status !== "DONE" && subdued ? "opacity-55" : "";

  return (
    <div
      className={`relative flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 group cursor-pointer ${stateClass}`}
      onClick={() => onOpenTodoDetail(todo)}
    >
      <div className={`flex items-center gap-4 flex-1 ${contentClass}`}>
        <input
          type="checkbox"
          checked={todo.status === "DONE"}
          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleStatus(todo.id, todo.status)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span
              className={`font-bold truncate ${
                todo.status === "DONE"
                  ? "line-through text-slate-400"
                  : "text-slate-700"
              }`}
            >
              {todo.title}
            </span>

            <div className="flex gap-1">
              {todo.hasFlag && (
                <span className="px-1 text-xs text-slate-500">
                  ⚑
                </span>
              )}

              {todo.daily && (
                <span className="px-1 text-sm leading-none text-slate-400">
                  ↻
                </span>
              )}
              {todo.dueDate && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    isOverdue
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}
                >
                  {todo.dueDate}
                </span>
              )}
              {todo.dueDateUndecided && (
                <span className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  未定
                </span>
              )}
            </div>
          </div>

          {todo.details && (
            <p className="text-sm text-slate-500 line-clamp-1">
              {todo.details}
            </p>
          )}
        </div>
      </div>
      <button
        aria-label="タスクを削除"
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTodo(todo.id);
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default TodoItem;
