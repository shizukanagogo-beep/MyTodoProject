import { useMemo, useState } from "react";
import type { UpdateTodoPayload } from "../services/todoService";
import type { Category, Todo } from "../types";

type EditableTodo = {
  title: string;
  details: string;
  categoryId: number | null;
  dueDate: string;
  status: Todo["status"];
  daily: boolean;
  hasFlag: boolean;
  overdueBehavior: number;
};

type TodoDetailModalProps = {
  todo: Todo;
  categories: Category[];
  onClose: () => void;
  onDeleteTodo: (id: number) => void;
  onUpdateTodo: (id: number, payload: UpdateTodoPayload) => Promise<boolean>;
};

function TodoDetailModal({
  todo,
  categories,
  onClose,
  onDeleteTodo,
  onUpdateTodo,
}: TodoDetailModalProps) {
  const initialTodoState: EditableTodo = {
    title: todo.title,
    details: todo.details || "",
    categoryId: todo.categoryId,
    dueDate: todo.dueDate || "",
    status: todo.status,
    daily: todo.daily,
    hasFlag: todo.hasFlag,
    overdueBehavior: todo.overdueBehavior,
  };

  const [editTodo, setEditTodo] = useState<EditableTodo>(initialTodoState);

  const hasChanges = useMemo(() => {
    return (
      editTodo.title !== todo.title ||
      editTodo.details !== (todo.details || "") ||
      editTodo.categoryId !== todo.categoryId ||
      editTodo.dueDate !== (todo.dueDate || "") ||
      editTodo.status !== todo.status ||
      editTodo.daily !== todo.daily ||
      editTodo.hasFlag !== todo.hasFlag ||
      editTodo.overdueBehavior !== todo.overdueBehavior
    );
  }, [editTodo, todo]);

  const handleDelete = () => {
    onDeleteTodo(todo.id);
    onClose();
  };

  const handleCancelChanges = () => {
    setEditTodo(initialTodoState);
    onClose();
  };

  const handleMainButton = async () => {
    if (editTodo.categoryId === null) {
      alert("カテゴリを選択してください");
      return;
    }

    const isSuccess = await onUpdateTodo(todo.id, {
      title: editTodo.title,
      details: editTodo.details,
      categoryId: editTodo.categoryId,
      dueDate: editTodo.dueDate,
      status: editTodo.status,
      daily: editTodo.daily,
      hasFlag: editTodo.hasFlag,
      autoCarryOver: todo.autoCarryOver,
      overdueBehavior: editTodo.overdueBehavior,
      sortOrder: todo.sortOrder,
    });

    if (isSuccess) {
      onClose();
    }
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

            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">カテゴリ</p>
              <select
                className="w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700"
                value={editTodo.categoryId ?? ""}
                onChange={(e) =>
                  setEditTodo({
                    ...editTodo,
                    categoryId:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              >
                <option value="">カテゴリを選択</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <label
                className={`flex items-center gap-2 text-sm border px-3 py-2 rounded-full ${
                  editTodo.dueDate
                    ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                    : "bg-white text-slate-600 border-slate-200 cursor-pointer hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!!editTodo.dueDate}
                  checked={editTodo.daily}
                  onChange={(e) =>
                    setEditTodo({
                      ...editTodo,
                      daily: e.target.checked,
                      dueDate: e.target.checked ? "" : editTodo.dueDate,
                      overdueBehavior: e.target.checked
                        ? 0
                        : editTodo.overdueBehavior,
                    })
                  }
                />
                🔄日課
              </label>

              {editTodo.dueDate && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
                  <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    日付設定がある場合は日課として設定できません
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">期限</p>

            <div className="relative group">
              <input
                type="date"
                disabled={editTodo.daily}
                className={`w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700 ${
                  editTodo.daily ? "opacity-40 cursor-not-allowed" : ""
                }`}
                value={editTodo.dueDate}
                onChange={(e) =>
                  setEditTodo({
                    ...editTodo,
                    dueDate: e.target.value,
                    daily: e.target.value ? false : editTodo.daily,
                    overdueBehavior: e.target.value
                      ? editTodo.overdueBehavior
                      : 0,
                  })
                }
              />

              {editTodo.daily && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
                  <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    日課設定されている場合は日付設定はできません
                  </div>
                </div>
              )}
            </div>
          </div>

          {editTodo.dueDate && !editTodo.daily && (
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">
                期限超過時の動き
              </p>

              <select
                className="w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700"
                value={editTodo.overdueBehavior}
                onChange={(e) =>
                  setEditTodo({
                    ...editTodo,
                    overdueBehavior: Number(e.target.value),
                  })
                }
              >
                <option value={0}>日付を赤文字でそのまま</option>
                <option value={1}>日付を今日に繰り越す</option>
                <option value={2}>自動的に完了済みにする</option>
                <option value={3}>日付を削除する</option>
              </select>
            </div>
          )}

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
            {hasChanges ? (
              <>
                <button
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  onClick={handleCancelChanges}
                >
                  キャンセル
                </button>

                <button
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  onClick={handleMainButton}
                >
                  保存
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  onClick={onClose}
                >
                  閉じる
                </button>

                <button
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                  onClick={handleDelete}
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoDetailModal;
