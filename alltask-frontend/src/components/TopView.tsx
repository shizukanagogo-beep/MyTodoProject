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
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-bold text-slate-700">スマートリスト</h2>
        </div>

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
            日課タスク
          </button>

          <button
            onClick={onOpenFlagged}
            className="p-4 bg-teal-500 text-white rounded-xl font-bold shadow-md hover:bg-teal-600"
          >
            フラグ付き
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-700">カテゴリ一覧</h2>

            <div className="relative group">
              <button
                className="h-8 w-8 rounded-full text-slate-500 font-bold transition-colors hover:bg-slate-200"
                onClick={onOpenCategoryModal}
                aria-label="カテゴリ編集"
              >
                ⋯
              </button>

              <div className="absolute left-0 top-full z-10 mt-1 hidden group-hover:block">
                <div className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                  カテゴリ編集
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenTodoModal}
            className="shrink-0 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            +新規タスク
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              colorIndex={index}
              onClick={onOpenCategoryDetail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default TopView;
