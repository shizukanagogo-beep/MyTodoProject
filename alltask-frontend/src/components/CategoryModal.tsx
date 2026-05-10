import { useState } from "react";
import type { Category } from "../types";

type CategoryModalProps = {
  categories: Category[];
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onClose: () => void;
  onAddCategory: () => void;
};

function CategoryModal({
  categories,
  newCategoryName,
  setNewCategoryName,
  onClose,
  onAddCategory,
}: CategoryModalProps) {
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<number | null>(
    null,
  );

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
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <span className="font-bold text-slate-700">{category.name}</span>

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

              {openMenuCategoryId === category.id && (
                <div
                  className="absolute right-3 top-11 z-10 w-28 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      alert("カテゴリ編集は次に実装します");
                      setOpenMenuCategoryId(null);
                    }}
                  >
                    編集
                  </button>

                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    onClick={() => {
                      alert("カテゴリ削除は次に実装します");
                      setOpenMenuCategoryId(null);
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
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
