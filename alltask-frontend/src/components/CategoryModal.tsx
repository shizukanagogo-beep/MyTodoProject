import { useState } from "react";
import { modalLabelClassName } from "../constants/ui";
import type { Category } from "../types";
import ModalShell from "./ModalShell";
import TrashIcon from "./icons/TrashIcon";

const categoryNameInputClassName =
  "flex-1 border-b border-transparent bg-white px-1 py-2 font-bold text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500";
const newCategoryInputClassName =
  "w-full border-b border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500";

type CategoryModalProps = {
  categories: Category[];
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onClose: () => void;
  onAddCategory: () => void;
  onUpdateCategory: (id: number, name: string) => Promise<boolean>;
  onRequestDeleteCategory: (category: Category) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
};

function CategoryModal({
  categories,
  newCategoryName,
  setNewCategoryName,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onRequestDeleteCategory,
  onReorderCategories,
}: CategoryModalProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [newCategoryNameError, setNewCategoryNameError] = useState("");
  const [editingCategoryNameError, setEditingCategoryNameError] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const startEditingCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryNameError("");
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategoryNameError("");
  };

  const saveCategoryName = async (categoryId: number) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryNameError("カテゴリ名を入力してください");
      return;
    }

    setEditingCategoryNameError("");
    const isSuccess = await onUpdateCategory(categoryId, editingCategoryName);

    if (isSuccess) {
      cancelEditingCategory();
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      setNewCategoryNameError("カテゴリ名を入力してください");
      return;
    }

    setNewCategoryNameError("");
    onAddCategory();
  };

  return (
    <ModalShell
      title="カテゴリの編集"
      onClose={onClose}
      zIndexClassName="z-[60]"
      panelClassName="p-6"
    >
      <div className="space-y-2 mb-6">
        {categories.map((category, index) => {
          const canDragCategory = editingCategoryId !== category.id;

          return (
            <div key={category.id}>
              <div
                draggable={canDragCategory}
                onDragStart={(e) => {
                  if (!canDragCategory) {
                    e.preventDefault();
                    return;
                  }
                  setDraggingIndex(index);
                }}
                onDragOver={(e) => {
                  if (canDragCategory) e.preventDefault();
                }}
                onDrop={() => {
                  if (!canDragCategory) return;
                  if (draggingIndex === null) return;
                  onReorderCategories(draggingIndex, index);
                  setDraggingIndex(null);
                }}
                onDragEnd={() => setDraggingIndex(null)}
                className={`relative flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 ${
                  draggingIndex === index ? "opacity-50" : ""
                }`}
              >
                {editingCategoryId === category.id ? (
                  <input
                    draggable={false}
                    className={categoryNameInputClassName}
                    value={editingCategoryName}
                    autoFocus
                    onChange={(e) => {
                      setEditingCategoryName(e.target.value);
                      if (editingCategoryNameError) setEditingCategoryNameError("");
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === "Enter") saveCategoryName(category.id);
                      if (e.key === "Escape") cancelEditingCategory();
                    }}
                  />
                ) : (
                  <button
                    className="min-w-0 flex-1 truncate text-left font-bold text-slate-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingCategory(category);
                    }}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    {category.name}
                  </button>
                )}

                {editingCategoryId === category.id && (
                  <div className="flex gap-2 ml-2">
                    <button
                      className="text-xs font-bold text-slate-500 hover:text-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditingCategory();
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveCategoryName(category.id);
                      }}
                    >
                      保存
                    </button>
                  </div>
                )}

                {editingCategoryId !== category.id && (
                  <button
                    className="ml-2 rounded-lg p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                    aria-label="カテゴリを削除"
                    onDragStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeleteCategory(category);
                    }}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              {editingCategoryId === category.id && editingCategoryNameError && (
                <p className="mt-1 px-4 text-xs font-bold text-red-500">
                  {editingCategoryNameError}
                </p>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <p className="text-center py-8 text-slate-400">カテゴリがありません</p>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className={`mb-2 ${modalLabelClassName}`}>カテゴリを追加</p>
        <input
          type="text"
          className={newCategoryInputClassName}
          placeholder="カテゴリ名 (例: 仕事、買い物)"
          value={newCategoryName}
          onChange={(e) => {
            setNewCategoryName(e.target.value);
            if (newCategoryNameError) setNewCategoryNameError("");
          }}
        />
        {newCategoryNameError && (
          <p className="mt-1 text-xs font-bold text-red-500">
            {newCategoryNameError}
          </p>
        )}
        <button
          className="mt-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
          onClick={addCategory}
        >
          追加
        </button>
      </div>
    </ModalShell>
  );
}

export default CategoryModal;
