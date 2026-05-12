import { useState } from "react";
import type { Category } from "../types";

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
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<number | null>(
    null,
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
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
          setOpenMenuCategoryId(null);
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
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable={editingCategoryId !== category.id}
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
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
                <span className="font-bold text-slate-700">
                  {category.name}
                </span>
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
                  className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuCategoryId((currentId) =>
                      currentId === category.id ? null : category.id,
                    );
                  }}
                >
                  ⋯
                </button>
              )}

              {openMenuCategoryId === category.id && (
                <div
                  className="absolute right-3 top-11 z-10 w-28 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setEditingCategoryName(category.name);
                      setOpenMenuCategoryId(null);
                    }}
                  >
                    編集
                  </button>

                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    onClick={async () => {
                      const ok = window.confirm(
                        `「${category.name}」を削除します。\nこのカテゴリ内のタスクもすべて削除されます。\n本当に削除しますか？`,
                      );

                      if (!ok) return;

                      const isSuccess = await onDeleteCategory(category.id);

                      if (isSuccess) {
                        setOpenMenuCategoryId(null);

                        if (editingCategoryId === category.id) {
                          setEditingCategoryId(null);
                          setEditingCategoryName("");
                        }
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          ))}

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
