import { useMemo, useState } from "react";
import type { Todo } from "../types";

type EditableTodo = {
  title: string;
  details: string;
  dueDate: string;
  status: Todo["status"];
  daily: boolean;
  hasFlag: boolean;
};

type TodoDetailModalProps = {
  todo: Todo;
  onClose: () => void;
  onDeleteTodo: (id: number) => void;
};

function TodoDetailModal({
  todo,
  onClose,
  onDeleteTodo,
}: TodoDetailModalProps) {
  const [editTodo, setEditTodo] = useState<EditableTodo>({
    title: todo.title,
    details: todo.details || "",
    dueDate: todo.dueDate || "",
    status: todo.status,
    daily: todo.daily,
    hasFlag: todo.hasFlag,
  });

  const hasChanges = useMemo(() => {
    return (
      editTodo.title !== todo.title ||
      editTodo.details !== (todo.details || "") ||
      editTodo.dueDate !== (todo.dueDate || "") ||
      editTodo.status !== todo.status ||
      editTodo.daily !== todo.daily ||
      editTodo.hasFlag !== todo.hasFlag
    );
  }, [editTodo, todo]);

  const handleDelete = () => {
    onDeleteTodo(todo.id);
    onClose();
  };

  const handleMainButton = () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    alert("保存処理は次に実装します");
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={editTodo.status === "DONE"}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              onChange={(e) =>
                setEditTodo({
                  ...editTodo,
                  status: e.target.checked ? "DONE" : "INCOMPLETE",
                })
              }
            />

            <input
              type="text"
              className={`w-full text-xl font-bold bg-white border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none px-1 py-1 ${
                editTodo.status === "DONE"
                  ? "line-through text-slate-400"
                  : "text-slate-800"
              }`}
              value={editTodo.title}
              onChange={(e) =>
                setEditTodo({ ...editTodo, title: e.target.value })
              }
              placeholder="タイトル"
            />
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm bg-white text-slate-600 border border-slate-200 px-3 py-2 rounded-full cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={editTodo.hasFlag}
                onChange={(e) =>
                  setEditTodo({ ...editTodo, hasFlag: e.target.checked })
                }
              />
              🚩重要
            </label>

            <label className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-2 rounded-full cursor-pointer hover:bg-emerald-100">
              <input
                type="checkbox"
                checked={editTodo.daily}
                onChange={(e) =>
                  setEditTodo({ ...editTodo, daily: e.target.checked })
                }
              />
              🔄日課
            </label>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">期限</p>
            <input
              type="date"
              className="w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700"
              value={editTodo.dueDate}
              onChange={(e) =>
                setEditTodo({ ...editTodo, dueDate: e.target.value })
              }
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">詳細</p>
            <textarea
              className="w-full min-h-28 bg-white px-1 py-2 border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-lg outline-none text-slate-700 resize-none"
              value={editTodo.details}
              onChange={(e) =>
                setEditTodo({ ...editTodo, details: e.target.value })
              }
              placeholder="詳細はありません"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                hasChanges
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={handleMainButton}
            >
              {hasChanges ? "保存" : "閉じる"}
            </button>

            <button
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              onClick={handleDelete}
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoDetailModal;
