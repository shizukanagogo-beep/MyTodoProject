import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useTodoModal } from "./hooks/useTodoModal";
import { useCategoryModal } from "./hooks/useCategoryModal";
import { useViewMode } from "./hooks/useViewMode";
import CategoryModal from "./components/CategoryModal";
import TodoModal from "./components/TodoModal";
import TopView from "./components/TopView";
import TodoListView from "./components/TodoListView";
import Header from "./components/Header";
import AddTodoButton from "./components/AddTodoButton";
import Loading from "./components/Loading";

function App() {
  const {
    viewMode,
    selectedCategoryId,
    goTop,
    goCategoryDetail,
    goDated,
    goDaily,
    goFlagged,
  } = useViewMode();
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

  const {
    isTodoModalOpen,
    openTodoModal,
    closeTodoModal,
    addTodoAndCloseModal,
  } = useTodoModal({
    addTodo,
  });

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
    addCategoryAndCloseModal,
  } = useCategoryModal({
    addCategoryToList,
  });

  if (loadingCategories) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header onTitleClick={goTop} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {(viewMode === "TOP" || viewMode === "CATEGORY_DETAIL") && (
          <AddTodoButton onClick={openTodoModal} />
        )}

        {isTodoModalOpen && (
          <TodoModal
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            categories={categories}
            viewMode={viewMode}
            onClose={closeTodoModal}
            onAddTodo={addTodoAndCloseModal}
          />
        )}

        {isCategoryModalOpen && (
          <CategoryModal
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onClose={closeCategoryModal}
            onAddCategory={addCategoryAndCloseModal}
          />
        )}

        {viewMode === "TOP" ? (
          <TopView
            categories={categories}
            onOpenCategoryModal={openCategoryModal}
            onOpenCategoryDetail={goCategoryDetail}
            onOpenDated={goDated}
            onOpenDaily={goDaily}
            onOpenFlagged={goFlagged}
          />
        ) : (
          <TodoListView
            viewMode={viewMode}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            sortedTodos={sortedTodos}
            onBackToTop={goTop}
            onToggleStatus={toggleStatus}
            onDeleteTodo={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
