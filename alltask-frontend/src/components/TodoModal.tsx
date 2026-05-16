import { useState, type Dispatch, type SetStateAction } from "react";
import {
  modalFieldInputClassName,
  modalLabelClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
  modalTextareaClassName,
  modalTitleInputClassName,
} from "../constants/ui";
import type { Category, NewTodo } from "../types";
import type { ApiFieldErrors } from "../utils/apiError";
import DueDateSetting from "./DueDateSetting";
import FlagCheckbox from "./FlagCheckbox";
import ModalShell from "./ModalShell";

type TodoModalProps = {
  newTodo: NewTodo;
  setNewTodo: Dispatch<SetStateAction<NewTodo>>;
  categories: Category[];
  fieldErrors: ApiFieldErrors;
  onClose: () => void;
  onAddTodo: () => Promise<void> | void;
};

function TodoModal({
  newTodo,
  setNewTodo,
  categories,
  fieldErrors,
  onClose,
  onAddTodo,
}: TodoModalProps) {
  const [localTitleError, setLocalTitleError] = useState("");
  const titleError = localTitleError || fieldErrors.title || "";

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      setLocalTitleError("タイトルを入力してください");
      return;
    }

    setLocalTitleError("");
    await onAddTodo();
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="space-y-3">
          <div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="タイトル"
                className={modalTitleInputClassName}
                value={newTodo.title}
                onChange={(e) => {
                  setNewTodo({ ...newTodo, title: e.target.value });
                  if (localTitleError) {
                    setLocalTitleError("");
                  }
                }}
              />

              <FlagCheckbox
                checked={newTodo.hasFlag}
                onChange={(checked) =>
                  setNewTodo({ ...newTodo, hasFlag: checked })
                }
              />
            </div>

            {titleError && (
              <p className="mt-1 text-xs font-bold text-red-500">
                {titleError}
              </p>
            )}
          </div>

          <div>
            <p className={`mb-1 ${modalLabelClassName}`}>カテゴリ</p>
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
              <p className={modalLabelClassName}>詳細</p>
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
              className={modalSecondaryButtonClassName}
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              className={modalPrimaryButtonClassName}
              onClick={handleAddTodo}
            >
              作成
            </button>
          </div>
        </div>
    </ModalShell>
  );
}

export default TodoModal;
