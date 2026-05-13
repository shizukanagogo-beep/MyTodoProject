import { useMemo, useState } from "react";
import type { UpdateTodoPayload } from "../services/todoService";
import type { Category, Todo } from "../types";
import DueDateSetting from "./DueDateSetting";

type EditableTodo = {
  title: string;
  details: string;
  categoryId: number | null;
  dueDate: string;
  dueDateUndecided: boolean;
  status: Todo["status"];
  daily: boolean;
  hasFlag: boolean;
  overdueBehavior: number;
};

type SubtaskDraft = {
  title: string;
  details: string;
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  hasFlag: boolean;
  overdueBehavior: number;
};

const initialSubtaskDraft: SubtaskDraft = {
  title: "",
  details: "",
  dueDate: "",
  dueDateUndecided: false,
  daily: false,
  hasFlag: false,
  overdueBehavior: 0,
};

type TodoDetailModalProps = {
  todo: Todo;
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
  onUpdateTodo: (id: number, payload: UpdateTodoPayload) => Promise<boolean>;
};

function TodoDetailModal({
  todo,
  subtasks,
  categories,
  onClose,
  onDeleteTodo,
  onAddSubtask,
  onUpdateTodo,
}: TodoDetailModalProps) {
  const isSubtask = todo.parentId !== null;
  const initialTodoState: EditableTodo = {
    title: todo.title,
    details: todo.details || "",
    categoryId: todo.categoryId,
    dueDate: todo.dueDate || "",
    dueDateUndecided: todo.dueDateUndecided,
    status: todo.status,
    daily: todo.daily,
    hasFlag: todo.hasFlag,
    overdueBehavior: todo.overdueBehavior,
  };

  const [editTodo, setEditTodo] = useState<EditableTodo>(initialTodoState);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [newSubtask, setNewSubtask] =
    useState<SubtaskDraft>(initialSubtaskDraft);

  const hasChanges = useMemo(() => {
    return (
      editTodo.title !== todo.title ||
      editTodo.details !== (todo.details || "") ||
      editTodo.categoryId !== todo.categoryId ||
      editTodo.dueDate !== (todo.dueDate || "") ||
      editTodo.dueDateUndecided !== todo.dueDateUndecided ||
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
    const isSuccess = await onUpdateTodo(todo.id, {
      title: editTodo.title,
      details: editTodo.details,
      categoryId: isSubtask ? null : editTodo.categoryId,
      parentId: todo.parentId,
      dueDate: editTodo.dueDate,
      dueDateUndecided: editTodo.dueDateUndecided,
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

  const handleAddSubtask = async () => {
    const isSuccess = await onAddSubtask(todo.id, {
      title: newSubtask.title,
      details: newSubtask.details,
      dueDate: newSubtask.dueDate || null,
      dueDateUndecided: newSubtask.dueDateUndecided,
      daily: newSubtask.daily,
      hasFlag: newSubtask.hasFlag,
      autoCarryOver: false,
      overdueBehavior: newSubtask.overdueBehavior,
      sortOrder: subtasks.length + 1,
    });

    if (isSuccess) {
      setNewSubtask(initialSubtaskDraft);
      setIsSubtaskModalOpen(false);
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
          {!isSubtask && (
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">
                カテゴリ
              </p>
              <select
                className="w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700"
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

          <DueDateSetting
            dueDate={editTodo.dueDate}
            dueDateUndecided={editTodo.dueDateUndecided}
            daily={editTodo.daily}
            overdueBehavior={editTodo.overdueBehavior}
            onChange={(draft) =>
              setEditTodo({
                ...editTodo,
                ...draft,
                daily:
                  draft.dueDate || draft.dueDateUndecided
                    ? false
                    : editTodo.daily,
              })
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">フラグ</p>
              <label className="flex cursor-pointer items-center gap-2 border-b border-transparent bg-white px-1 py-2 text-slate-700 hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={editTodo.hasFlag}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, hasFlag: e.target.checked })
                  }
                />
                重要
              </label>
            </div>

            <div className="relative group">
              <p className="text-sm font-bold text-slate-500 mb-1">日課</p>
              <label
                className={`flex items-center gap-2 border-b border-transparent bg-white px-1 py-2 ${
                  editTodo.dueDate || editTodo.dueDateUndecided
                    ? "cursor-not-allowed text-slate-300"
                    : "cursor-pointer text-slate-700 hover:border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!!editTodo.dueDate || editTodo.dueDateUndecided}
                  checked={editTodo.daily}
                  onChange={(e) =>
                    setEditTodo({
                      ...editTodo,
                      daily: e.target.checked,
                      dueDate: e.target.checked ? "" : editTodo.dueDate,
                      dueDateUndecided: e.target.checked
                        ? false
                        : editTodo.dueDateUndecided,
                      overdueBehavior: e.target.checked
                        ? 0
                        : editTodo.overdueBehavior,
                    })
                  }
                />
                日課として設定
              </label>

              {(editTodo.dueDate || editTodo.dueDateUndecided) && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
                  <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    日付または未定が設定されている場合は日課として設定できません
                  </div>
                </div>
              )}
            </div>
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

          {!isSubtask && (
            <div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
                  onClick={() => setIsSubtaskModalOpen(true)}
                >
                  +サブタスク
                </button>
              </div>
            </div>
          )}

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

      {isSubtaskModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsSubtaskModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                サブタスク作成
              </h3>
              <button
                className="text-2xl text-slate-400 hover:text-slate-600"
                onClick={() => setIsSubtaskModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="タイトル"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newSubtask.title}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, title: e.target.value })
                }
              />

              <DueDateSetting
                dueDate={newSubtask.dueDate}
                dueDateUndecided={newSubtask.dueDateUndecided}
                daily={newSubtask.daily}
                overdueBehavior={newSubtask.overdueBehavior}
                onChange={(draft) =>
                  setNewSubtask({
                    ...newSubtask,
                    ...draft,
                    daily:
                      draft.dueDate || draft.dueDateUndecided
                        ? false
                        : newSubtask.daily,
                  })
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-bold text-slate-500">
                    フラグ
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 border-b border-transparent bg-white px-1 py-2 text-slate-700 hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={newSubtask.hasFlag}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          hasFlag: e.target.checked,
                        })
                      }
                    />
                    重要
                  </label>
                </div>

                <div className="relative group">
                  <p className="mb-1 text-sm font-bold text-slate-500">日課</p>
                  <label
                    className={`flex items-center gap-2 border-b border-transparent bg-white px-1 py-2 ${
                      newSubtask.dueDate || newSubtask.dueDateUndecided
                        ? "cursor-not-allowed text-slate-300"
                        : "cursor-pointer text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={
                        !!newSubtask.dueDate || newSubtask.dueDateUndecided
                      }
                      checked={newSubtask.daily}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          daily: e.target.checked,
                          dueDate: e.target.checked ? "" : newSubtask.dueDate,
                          dueDateUndecided: e.target.checked
                            ? false
                            : newSubtask.dueDateUndecided,
                          overdueBehavior: e.target.checked
                            ? 0
                            : newSubtask.overdueBehavior,
                        })
                      }
                    />
                    日課として設定
                  </label>

                  {(newSubtask.dueDate || newSubtask.dueDateUndecided) && (
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
                  className="min-h-28 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-indigo-500"
                  value={newSubtask.details}
                  onChange={(e) =>
                    setNewSubtask({
                      ...newSubtask,
                      details: e.target.value,
                    })
                  }
                  placeholder="詳細メモ"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                  onClick={() => setIsSubtaskModalOpen(false)}
                >
                  キャンセル
                </button>
                <button
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
                  onClick={handleAddSubtask}
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoDetailModal;
