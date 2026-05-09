import type { Dispatch, SetStateAction } from 'react';
import type { Category, NewTodo, ViewMode } from '../types';

type TodoModalProps = {
  newTodo: NewTodo;
  setNewTodo: Dispatch<SetStateAction<NewTodo>>;
  categories: Category[];
  viewMode: ViewMode;
  onClose: () => void;
  onAddTodo: () => void;
};

function TodoModal({
  newTodo,
  setNewTodo,
  categories,
  viewMode,
  onClose,
  onAddTodo,
}: TodoModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">新規タスク作成</h3>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="タイトル"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newTodo.title}
            onChange={(e) =>
              setNewTodo({ ...newTodo, title: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            {viewMode === 'TOP' && (
              <select
                className="px-4 py-3 border border-slate-200 rounded-lg bg-white"
                value={newTodo.categoryId}
                onChange={(e) =>
                  setNewTodo({
                    ...newTodo,
                    categoryId:
                      e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              >
                <option value="">カテゴリを選択</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              className="px-4 py-3 border border-slate-200 rounded-lg"
              value={newTodo.dueDate}
              onChange={(e) =>
                setNewTodo({ ...newTodo, dueDate: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="詳細メモ"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newTodo.details}
            onChange={(e) =>
              setNewTodo({ ...newTodo, details: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={newTodo.hasFlag}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, hasFlag: e.target.checked })
                }
              />
              🚩重要
            </label>

            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={newTodo.daily}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, daily: e.target.checked })
                }
              />
              🔄日課
            </label>
          </div>

          <button
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md"
            onClick={onAddTodo}
          >
            タスクを登録
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoModal;