import { useState } from "react";
import type { Category } from "../types";

const TrashIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

type CategoryModalProps = {
  categories: Category[];
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onClose: () => void;
  onAddCategory: () => void;
  onUpdateCategory: (id: number, name: string) => Promise<boolean>;
  onDeleteCategory: (id: number) => Promise<boolean>;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
};

function CategoryModal({
  categories,
  newCategoryName,
  setNewCategoryName,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}: CategoryModalProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const startEditingCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const saveCategoryName = async (categoryId: number) => {
    const isSuccess = await onUpdateCategory(categoryId, editingCategoryName);

    if (isSuccess) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">カテゴリの編集</h3>

          <button
            className="text-2xl text-slate-400 hover:text-slate-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {categories.map((category, index) => {
            const canDragCategory = editingCategoryId !== category.id;

            return (
              <div
                key={category.id}
                draggable={canDragCategory}
                onDragStart={(e) => {
                  if (!canDragCategory) {
                    e.preventDefault();
                    return;
                  }

                  setDraggingIndex(index);
                }}
                onDragOver={(e) => {
                  if (canDragCategory) {
                    e.preventDefault();
                  }
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
                    className="flex-1 bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700 font-bold"
                    value={editingCategoryName}
                    autoFocus
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === "Enter") {
                        saveCategoryName(category.id);
                      }
                      if (e.key === "Escape") {
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }
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
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
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
                    onClick={async (e) => {
                      e.stopPropagation();

                      const ok = window.confirm(
                        `「${category.name}」を削除します。\nこのカテゴリ内のタスクもすべて削除されます。\n本当に削除しますか？`,
                      );

                      if (!ok) return;

                      const isSuccess = await onDeleteCategory(category.id);

                      if (isSuccess) {
                        if (editingCategoryId === category.id) {
                          setEditingCategoryId(null);
                          setEditingCategoryName("");
                        }
                      }
                    }}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            );
          })}

          {categories.length === 0 && (
            <p className="text-center py-8 text-slate-400">
              カテゴリがありません
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-bold text-slate-500 mb-2">
            カテゴリを追加
          </p>

          <input
            type="text"
            className="w-full bg-white px-1 py-2 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none text-slate-700 mb-3"
            placeholder="カテゴリ名 (例: 仕事、買い物)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />

          <button
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
            onClick={onAddCategory}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;
