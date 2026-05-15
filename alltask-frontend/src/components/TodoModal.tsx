import type { Dispatch, SetStateAction } from "react";
import {
  modalFieldInputClassName,
  modalTextareaClassName,
  modalTitleInputClassName,
} from "../constants/ui";
import type { Category, NewTodo } from "../types";
import DueDateSetting from "./DueDateSetting";
import FlagCheckbox from "./FlagCheckbox";

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
              className={modalTitleInputClassName}
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
            />

            <FlagCheckbox
              checked={newTodo.hasFlag}
              onChange={(checked) =>
                setNewTodo({ ...newTodo, hasFlag: checked })
              }
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-slate-500">
              カテゴリ
            </p>
            <select
              className={modalFieldInputClassName}
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
              className={modalTextareaClassName}
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
