import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useTodoModal } from "./hooks/useTodoModal";
import { useCategoryModal } from "./hooks/useCategoryModal";
import { useViewMode } from "./hooks/useViewMode";
import CategoryModal from "./components/CategoryModal";
import TodoModal from "./components/TodoModal";
import TopView from "./components/TopView";
import TodoListView from "./components/TodoListView";
import AddTodoButton from "./components/AddTodoButton";
import Loading from "./components/Loading";
import AppLayout from "./components/AppLayout";

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
    <AppLayout onTitleClick={goTop}>
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
    </AppLayout>
  );
}

export default App;
