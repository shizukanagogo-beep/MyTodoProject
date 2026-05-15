import type { Dispatch, SetStateAction } from "react";
import type { Category, NewTodo } from "../types";
import DueDateSetting from "./DueDateSetting";

type TodoModalProps = {
  newTodo: NewTodo;
  setNewTodo: Dispatch<SetStateAction<NewTodo>>;
  categories: Category[];
  onClose: () => void;
  onAddTodo: () => void;
};

function TodoModal({
  newTodo,
  setNewTodo,
  categories,
  onClose,
  onAddTodo,
}: TodoModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">新規タスク作成</h3>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="タイトル"
              className="min-w-0 flex-1 border-b border-transparent bg-white px-1 py-1 text-xl font-bold text-slate-800 outline-none hover:border-slate-200 focus:border-indigo-500"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
            />

            <label className="flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-slate-600 hover:bg-slate-50">
              <input
                type="checkbox"
                aria-label="フラグ"
                checked={newTodo.hasFlag}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, hasFlag: e.target.checked })
                }
              />
              <span aria-hidden="true" className="text-sm">
                ⚑
              </span>
            </label>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-slate-500">
              カテゴリ
            </p>
            <select
              className="w-full border-b border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500"
              value={newTodo.categoryId ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                setNewTodo({
                  ...newTodo,
                  categoryId: value === "" ? "" : Number(value),
                });
              }}
            >
              <option value="">カテゴリを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <DueDateSetting
            dueDate={newTodo.dueDate}
            dueDateUndecided={newTodo.dueDateUndecided}
            daily={newTodo.daily}
            overdueBehavior={newTodo.overdueBehavior}
            onChange={(draft) =>
              setNewTodo({
                ...newTodo,
                ...draft,
              })
            }
          />

          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-500">詳細</p>
            </div>

            <textarea
              placeholder="詳細メモ"
              className="min-h-20 w-full resize-none rounded-lg border border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500"
              value={newTodo.details}
              onChange={(e) =>
                setNewTodo({ ...newTodo, details: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
              onClick={onAddTodo}
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoModal;
