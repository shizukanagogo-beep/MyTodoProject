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
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">新規タスク作成</h3>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="タイトル"
            className="w-full border-b border-transparent bg-white px-1 py-1 text-xl font-bold text-slate-800 outline-none hover:border-slate-200 focus:border-indigo-500"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          />

          <div>
            <p className="mb-1 text-sm font-bold text-slate-500">カテゴリ</p>
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
                daily:
                  draft.dueDate || draft.dueDateUndecided
                    ? false
                    : newTodo.daily,
              })
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-bold text-slate-500">フラグ</p>
              <label className="flex cursor-pointer items-center gap-2 border-b border-transparent bg-white px-1 py-2 text-slate-700 hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={newTodo.hasFlag}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, hasFlag: e.target.checked })
                  }
                />
                重要
              </label>
            </div>

            <div className="relative group">
              <p className="mb-1 text-sm font-bold text-slate-500">日課</p>
              <label
                className={`flex items-center gap-2 border-b border-transparent bg-white px-1 py-2 ${
                  newTodo.dueDate || newTodo.dueDateUndecided
                    ? "cursor-not-allowed text-slate-300"
                    : "cursor-pointer text-slate-700 hover:border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!!newTodo.dueDate || newTodo.dueDateUndecided}
                  checked={newTodo.daily}
                  onChange={(e) =>
                    setNewTodo({
                      ...newTodo,
                      daily: e.target.checked,
                      dueDate: e.target.checked ? "" : newTodo.dueDate,
                      dueDateUndecided: e.target.checked
                        ? false
                        : newTodo.dueDateUndecided,
                      overdueBehavior: e.target.checked
                        ? 0
                        : newTodo.overdueBehavior,
                    })
                  }
                />
                日課として設定
              </label>

              {(newTodo.dueDate || newTodo.dueDateUndecided) && (
                <div className="absolute left-0 top-full z-10 mt-1 hidden group-hover:block">
                  <div className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                    日付または未定が設定されている場合は日課として設定できません
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-slate-500">詳細</p>
            <textarea
              placeholder="詳細メモ"
              className="min-h-28 w-full resize-none rounded-lg border border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500"
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
