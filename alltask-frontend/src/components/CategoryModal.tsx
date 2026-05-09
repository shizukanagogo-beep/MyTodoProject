type CategoryModalProps = {
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onClose: () => void;
  onAddCategory: () => void;
};

function CategoryModal({
  newCategoryName,
  setNewCategoryName,
  onClose,
  onAddCategory,
}: CategoryModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          新しいカテゴリ
        </h3>

        <input
          type="text"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
          placeholder="カテゴリ名 (例: 仕事、買い物)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          autoFocus
        />

        <div className="flex gap-2">
          <button
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            キャンセル
          </button>

          <button
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
            onClick={onAddCategory}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;