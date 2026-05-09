import TodoItem from './TodoItem';
import type { Category, Todo, ViewMode } from '../types';

type TodoListViewProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo['status']) => void;
  onDeleteTodo: (id: number) => void;
};

function TodoListView({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
}: TodoListViewProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBackToTop}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold text-slate-800">
          {viewMode === 'CATEGORY_DETAIL' &&
            `${categories.find((category) => category.id === selectedCategoryId)?.name}`}
          {viewMode === 'DATED' && '日付ありタスク'}
          {viewMode === 'DAILY' && '日課タスク'}
          {viewMode === 'FLAGGED' && 'フラグ付き'}
        </h2>
      </div>

      <div className="space-y-3">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleStatus={onToggleStatus}
            onDeleteTodo={onDeleteTodo}
          />
        ))}

        {sortedTodos.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoListView;