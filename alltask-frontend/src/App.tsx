import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useTodoModal } from "./hooks/useTodoModal";
import { useCategoryModal } from "./hooks/useCategoryModal";
import { useViewMode } from "./hooks/useViewMode";
import AddTodoButton from "./components/AddTodoButton";
import Loading from "./components/Loading";
import AppLayout from "./components/AppLayout";
import MainContent from "./components/MainContent";
import Modals from "./components/Modals";
import TodoDetailModal from "./components/TodoDetailModal";
import { useSelectedTodoModal } from "./hooks/useSelectedTodoModal";

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
  const { selectedTodo, openTodoDetailModal, closeTodoDetailModal } =
    useSelectedTodoModal();

  if (loadingCategories) return <Loading />;

  return (
    <AppLayout onTitleClick={goTop}>
      {(viewMode === "TOP" || viewMode === "CATEGORY_DETAIL") && (
        <AddTodoButton onClick={openTodoModal} />
      )}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          onClose={closeTodoDetailModal}
          onDeleteTodo={deleteTodo}
        />
      )}

      <Modals
        isTodoModalOpen={isTodoModalOpen}
        isCategoryModalOpen={isCategoryModalOpen}
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        categories={categories}
        viewMode={viewMode}
        onCloseTodoModal={closeTodoModal}
        onAddTodo={addTodoAndCloseModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onCloseCategoryModal={closeCategoryModal}
        onAddCategory={addCategoryAndCloseModal}
      />

      <MainContent
        viewMode={viewMode}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        sortedTodos={sortedTodos}
        onOpenCategoryModal={openCategoryModal}
        onOpenCategoryDetail={goCategoryDetail}
        onOpenDated={goDated}
        onOpenDaily={goDaily}
        onOpenFlagged={goFlagged}
        onBackToTop={goTop}
        onToggleStatus={toggleStatus}
        onDeleteTodo={deleteTodo}
      />
    </AppLayout>
  );
}

export default App;
