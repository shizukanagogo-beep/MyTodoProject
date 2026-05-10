import { useState } from "react";
import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useCategoryModal } from "./hooks/useCategoryModal";
import CategoryModal from "./components/CategoryModal";
import TodoModal from "./components/TodoModal";
import TopView from "./components/TopView";
import TodoListView from "./components/TodoListView";
import Header from "./components/Header";
import AddTodoButton from "./components/AddTodoButton";
import Loading from "./components/Loading";
import type { ViewMode } from "./types";
// --------------------------------------------------------------------------
function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("TOP");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const {
    sortedTodos,
    newTodo,
    setNewTodo,
    addTodo,
    toggleStatus,
    deleteTodo,
  } = useTodos({
    viewMode,
    selectedCategoryId,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    categories,
    loadingCategories,
    addCategory: addCategoryToList,
  } = useCategories();

  const {
    newCategoryName,
    setNewCategoryName,
    isCategoryModalOpen,
    openCategoryModal,
    closeCategoryModal,
    addCategory,
  } = useCategoryModal({
    addCategoryToList,
  });

  if (loadingCategories) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ヘッダー */}
      <Header onTitleClick={() => setViewMode("TOP")} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* モーダル起動ボタン */}
        {(viewMode === "TOP" || viewMode === "CATEGORY_DETAIL") && (
          <AddTodoButton onClick={() => setIsModalOpen(true)} />
        )}

        {/* モーダル */}
        {isModalOpen && (
          <TodoModal
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            categories={categories}
            viewMode={viewMode}
            onClose={() => setIsModalOpen(false)}
            onAddTodo={async () => {
              const isSuccess = await addTodo();
              if (isSuccess) {
                setIsModalOpen(false);
              }
            }}
          />
        )}

        {isCategoryModalOpen && (
          <CategoryModal
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onClose={closeCategoryModal}
            onAddCategory={addCategory}
          />
        )}

        {/* メインコンテンツ */}
        {viewMode === "TOP" ? (
          <TopView
            categories={categories}
            setViewMode={setViewMode}
            setSelectedCategoryId={setSelectedCategoryId}
            onOpenCategoryModal={openCategoryModal}
          />
        ) : (
          <TodoListView
            viewMode={viewMode}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            sortedTodos={sortedTodos}
            onBackToTop={() => setViewMode("TOP")}
            onToggleStatus={toggleStatus}
            onDeleteTodo={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
