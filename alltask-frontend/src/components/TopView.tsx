import CategoryCard from "./CategoryCard";
import type { Category } from "../types";

type TopViewProps = {
  categories: Category[];
  onOpenCategoryModal: () => void;
  onOpenCategoryDetail: (categoryId: number) => void;
  onOpenUncategorized: () => void;
  onOpenDated: () => void;
  onOpenDaily: () => void;
  onOpenFlagged: () => void;
};

function TopView({
  categories,
  onOpenCategoryModal,
  onOpenCategoryDetail,
  onOpenUncategorized,
  onOpenDated,
  onOpenDaily,
  onOpenFlagged,
}: TopViewProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={onOpenDated}
          className="p-4 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600"
        >
          📅 日付あり
        </button>

        <button
          onClick={onOpenDaily}
          className="p-4 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600"
        >
          🔄 日課
        </button>

        <button
          onClick={onOpenFlagged}
          className="p-4 bg-amber-500 text-white rounded-xl font-bold shadow-md hover:bg-amber-600"
        >
          🚩 フラグ
        </button>

        <button
          onClick={onOpenUncategorized}
          className="p-4 bg-slate-500 text-white rounded-xl font-bold shadow-md hover:bg-slate-600"
        >
          カテゴリなし
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-700">カテゴリ一覧</h2>

          <button
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
            onClick={onOpenCategoryModal}
          >
            カテゴリの編集
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
