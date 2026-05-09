import CategoryCard from './CategoryCard';
import type { Category, ViewMode } from '../types';

type TopViewProps = {
  categories: Category[];
  setViewMode: (viewMode: ViewMode) => void;
  setSelectedCategoryId: (categoryId: number) => void;
  onOpenCategoryModal: () => void;
};

function TopView({
  categories,
  setViewMode,
  setSelectedCategoryId,
  onOpenCategoryModal,
}: TopViewProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setViewMode('DATED')}
          className="p-4 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600"
        >
          📅 日付あり
        </button>

        <button
          onClick={() => setViewMode('DAILY')}
          className="p-4 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600"
        >
          🔄 日課
        </button>

        <button
          onClick={() => setViewMode('FLAGGED')}
          className="p-4 bg-amber-500 text-white rounded-xl font-bold shadow-md hover:bg-amber-600"
        >
          🚩 フラグ
        </button>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-4 px-1">
          カテゴリ一覧
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={(categoryId) => {
                setSelectedCategoryId(categoryId);
                setViewMode('CATEGORY_DETAIL');
              }}
            />
          ))}

          <button
            className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-400 transition-all"
            onClick={onOpenCategoryModal}
          >
            + カテゴリを追加
          </button>
        </div>
      </section>
    </div>
  );
}

export default TopView;