import { useEffect, useRef, useState } from "react";
import CategoryCard from "./CategoryCard";
import type { Category } from "../types";

type TopViewProps = {
  categories: Category[];
  onOpenTodoModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenCategoryDetail: (categoryId: number) => void;
  onOpenUncategorized: () => void;
  onOpenDated: () => void;
  onOpenDaily: () => void;
  onOpenFlagged: () => void;
};

function TopView({
  categories,
  onOpenTodoModal,
  onOpenCategoryModal,
  onOpenCategoryDetail,
  onOpenUncategorized,
  onOpenDated,
  onOpenDaily,
  onOpenFlagged,
}: TopViewProps) {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenDated}
            className="p-4 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600"
          >
            日付あり
          </button>

          <button
            onClick={onOpenDaily}
            className="p-4 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600"
          >
            日課
          </button>

          <button
            onClick={onOpenFlagged}
            className="p-4 bg-teal-500 text-white rounded-xl font-bold shadow-md hover:bg-teal-600"
          >
            フラグ
          </button>

          <button
            onClick={onOpenUncategorized}
            className="p-4 bg-slate-500 text-white rounded-xl font-bold shadow-md hover:bg-slate-600"
          >
            カテゴリなし
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4 px-1">
          <div
            ref={categoryMenuRef}
            className="relative flex items-center gap-2"
          >
            <h2 className="text-lg font-bold text-slate-700">カテゴリ一覧</h2>

            <button
              className="h-8 w-8 rounded-full text-slate-500 font-bold hover:bg-slate-200 transition-colors"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
            >
              ⋯
            </button>

            {isCategoryMenuOpen && (
              <div className="absolute left-24 top-9 z-10 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setIsCategoryMenuOpen(false);
                    onOpenCategoryModal();
                  }}
                >
                  カテゴリの編集
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenTodoModal}
            className="shrink-0 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            +新規タスク
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={onOpenCategoryDetail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default TopView;
