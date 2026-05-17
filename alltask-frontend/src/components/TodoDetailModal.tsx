import { useMemo, useState } from "react";
import {
  modalDangerButtonClassName,
  modalFieldInputClassName,
  modalLabelClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
  modalTextareaClassName,
  modalTitleInputClassName,
} from "../constants/ui";
import type { UpdateTodoPayload } from "../services/todoService";
import type { Category, Todo } from "../types";
import type { ApiFieldErrors } from "../utils/apiError";
import DueDateSetting from "./DueDateSetting";
import FlagCheckbox from "./FlagCheckbox";
import ModalShell from "./ModalShell";
import SubtaskCreateModal from "./SubtaskCreateModal";

type EditableTodo = {
  title: string;
  details: string;
  categoryId: number | null;
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  hasFlag: boolean;
  overdueBehavior: number;
};

const dueDateErrorFieldNames = ["dueDate", "daily", "dueDateUndecided"];

const getFirstFieldError = (
  fieldErrors: ApiFieldErrors,
  fieldNames: string[],
) => fieldNames.map((fieldName) => fieldErrors[fieldName]).find(Boolean) || "";

type TodoDetailModalProps = {
  todo: Todo;
  parentTodo: Todo | null;
  subtasks: Todo[];
  categories: Category[];
  onClose: () => void;
  onDeleteTodo: (id: number) => void;
  onAddSubtask: (
    parentId: number,
    payload: {
      title: string;
      details: string;
      dueDate: string | null;
      dueDateUndecided: boolean;
      daily: boolean;
      hasFlag: boolean;
      autoCarryOver: boolean;
      overdueBehavior: number;
      sortOrder: number | null;
    },
  ) => Promise<boolean>;
  onUpdateTodo: (
    id: number,
    payload: UpdateTodoPayload,
  ) => Promise<{
    success: boolean;
    fieldErrors?: ApiFieldErrors | null;
  }>;
};

function TodoDetailModal({
  todo,
  parentTodo,
  subtasks,
  categories,
  onClose,
  onDeleteTodo,
  onAddSubtask,
  onUpdateTodo,
}: TodoDetailModalProps) {
  const isSubtask = todo.parentId !== null;
  const parentCategory = categories.find(
    (category) => category.id === parentTodo?.categoryId,
  );

  const initialTodoState: EditableTodo = {
    title: todo.title,
    details: todo.details || "",
    categoryId: todo.categoryId,
    dueDate: todo.dueDate || "",
    dueDateUndecided: todo.dueDateUndecided,
    daily: todo.daily,
    hasFlag: todo.hasFlag,
    overdueBehavior: todo.overdueBehavior,
  };

  const [editTodo, setEditTodo] = useState<EditableTodo>(initialTodoState);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const titleError = fieldErrors.title || "";
  const dueDateError = getFirstFieldError(fieldErrors, dueDateErrorFieldNames);

  const hasChanges = useMemo(() => {
    return (
      editTodo.title !== todo.title ||
      editTodo.details !== (todo.details || "") ||
      editTodo.categoryId !== todo.categoryId ||
      editTodo.dueDate !== (todo.dueDate || "") ||
      editTodo.dueDateUndecided !== todo.dueDateUndecided ||
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
    setFieldErrors({});
    onClose();
  };

  const handleMainButton = async () => {
    const result = await onUpdateTodo(todo.id, {
      title: editTodo.title,
      details: editTodo.details,
      categoryId: isSubtask ? null : editTodo.categoryId,
      parentId: todo.parentId,
      dueDate: editTodo.dueDate,
      dueDateUndecided: editTodo.dueDateUndecided,
      status: todo.status,
      daily: editTodo.daily,
      hasFlag: editTodo.hasFlag,
      autoCarryOver: todo.autoCarryOver,
      overdueBehavior: editTodo.overdueBehavior,
      sortOrder: todo.sortOrder,
    });

    if (!result.success) {
      setFieldErrors(result.fieldErrors || {});
      return;
    }

    setFieldErrors({});
    onClose();
  };

  const clearFieldErrors = (fieldNames: string[]) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      fieldNames.forEach((fieldName) => {
        delete next[fieldName];
      });
      return next;
    });
  };

  return (
    <ModalShell onClose={onClose} zIndexClassName="z-[70]">
      <div className="mb-4 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              className={`${modalTitleInputClassName} ${
                todo.status === "DONE"
                  ? "line-through text-slate-400"
                  : "text-slate-800"
              }`}
              value={editTodo.title}
              onChange={(e) => {
                setEditTodo({ ...editTodo, title: e.target.value });
                if (fieldErrors.title) {
                  clearFieldErrors(["title"]);
                }
              }}
              placeholder="タイトル"
            />

            <FlagCheckbox
              checked={editTodo.hasFlag}
              onChange={(checked) =>
                setEditTodo({ ...editTodo, hasFlag: checked })
              }
            />
          </div>

          {titleError && (
            <p className="mt-1 text-xs font-bold text-red-500">
              {titleError}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!isSubtask && (
          <div>
            <p className={`mb-1 ${modalLabelClassName}`}>カテゴリ</p>
            <select
              className={modalFieldInputClassName}
              value={editTodo.categoryId ?? ""}
              onChange={(e) =>
                setEditTodo({
                  ...editTodo,
                  categoryId: Number(e.target.value),
                })
              }
            >
              {editTodo.categoryId === null ? (
                <option value="" disabled>
                  カテゴリを選択
                </option>
              ) : (
                <option value="" hidden />
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {isSubtask && (
          <div>
            <p className={`mb-1 ${modalLabelClassName}`}>親タスクのカテゴリ</p>
            <div className="border-b border-slate-100 px-1 py-2 text-slate-500">
              <span>{parentCategory?.name ?? "カテゴリなし"}</span>
            </div>
          </div>
        )}

        <DueDateSetting
          dueDate={editTodo.dueDate}
          dueDateUndecided={editTodo.dueDateUndecided}
          daily={editTodo.daily}
          overdueBehavior={editTodo.overdueBehavior}
          errorMessage={dueDateError}
          onChange={(draft) => {
            setEditTodo({
              ...editTodo,
              ...draft,
            });

            if (
              fieldErrors.dueDate ||
              fieldErrors.daily ||
              fieldErrors.dueDateUndecided
            ) {
              clearFieldErrors(dueDateErrorFieldNames);
            }
          }}
        />

        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className={modalLabelClassName}>詳細</p>
          </div>

          <textarea
            className={modalTextareaClassName}
            value={editTodo.details}
            onChange={(e) =>
              setEditTodo({ ...editTodo, details: e.target.value })
            }
            placeholder="詳細はありません"
          />
        </div>

        {!isSubtask && (
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
              onClick={() => setIsSubtaskModalOpen(true)}
            >
              +サブタスク
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {hasChanges ? (
            <>
              <button
                className={modalSecondaryButtonClassName}
                onClick={handleCancelChanges}
              >
                キャンセル
              </button>

              <button
                className={modalPrimaryButtonClassName}
                onClick={handleMainButton}
              >
                保存
              </button>
            </>
          ) : (
            <>
              <button className={modalSecondaryButtonClassName} onClick={onClose}>
                閉じる
              </button>

              <button className={modalDangerButtonClassName} onClick={handleDelete}>
                削除
              </button>
            </>
          )}
        </div>
      </div>

      {isSubtaskModalOpen && (
        <SubtaskCreateModal
          parentId={todo.id}
          sortOrder={subtasks.length + 1}
          onClose={() => setIsSubtaskModalOpen(false)}
          onCreateSuccess={() => {
            setIsSubtaskModalOpen(false);
            onClose();
          }}
          onAddSubtask={onAddSubtask}
        />
      )}
    </ModalShell>
  );
}

export default TodoDetailModal;
