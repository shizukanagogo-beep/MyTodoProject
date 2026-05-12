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
    showDoneTodos,
    setShowDoneTodos,
    datedSortMode,
    setDatedSortMode,
    newTodo,
    setNewTodo,
    addTodo,
    updateTodo,
    toggleStatus,
    deleteTodo,
    reorderTodos,
    randomTodo,
    pickRandomTodo,
    clearRandomTodo,
    isRandomMode,
    toggleRandomTodo,
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
    updateCategory,
    addCategory: addCategoryToList,
    deleteCategory,
    reorderCategories,
  } = useCategories();

  const {
    newCategoryName,
    setNewCategoryName,
    isCategoryModalOpen,
    openCategoryModal,
    closeCategoryModal,
    addCategoryFromModal,
  } = useCategoryModal({
    addCategoryToList,
  });

  const {
    selectedTodo,
    openTodoDetailModal,
    closeTodoDetailModal,
    updateSelectedTodo,
  } = useSelectedTodoModal();

  const deleteCategoryAndReturnTopIfNeeded = async (id: number) => {
    const isSuccess = await deleteCategory(id);
    if (isSuccess && selectedCategoryId === id) {
      goTop();
    }
    return isSuccess;
  };

  if (loadingCategories) return <Loading />;

  return (
    <AppLayout onTitleClick={goTop}>
      {(viewMode === "TOP" || viewMode === "CATEGORY_DETAIL") && (
        <AddTodoButton onClick={openTodoModal} />
      )}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          categories={categories}
          onClose={closeTodoDetailModal}
          onDeleteTodo={deleteTodo}
          onUpdateTodo={async (id, payload) => {
            const updatedTodo = await updateTodo(id, payload);
            if (updatedTodo) {
              updateSelectedTodo(updatedTodo);
              return true;
            }
            return false;
          }}
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
        onAddCategory={addCategoryFromModal}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategoryAndReturnTopIfNeeded}
        onReorderCategories={reorderCategories}
      />

      <MainContent
        viewMode={viewMode}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        sortedTodos={sortedTodos}
        showDoneTodos={showDoneTodos}
        datedSortMode={datedSortMode}
        onToggleShowDoneTodos={() => setShowDoneTodos((prev) => !prev)}
        onChangeDatedSortMode={setDatedSortMode}
        onOpenCategoryModal={openCategoryModal}
        onOpenCategoryDetail={goCategoryDetail}
        onOpenDated={goDated}
        onOpenDaily={goDaily}
        onOpenFlagged={goFlagged}
        onBackToTop={goTop}
        onToggleStatus={toggleStatus}
        onDeleteTodo={deleteTodo}
        onOpenTodoDetail={openTodoDetailModal}
        onReorderTodos={reorderTodos}
        randomTodo={randomTodo}
        onPickRandomTodo={pickRandomTodo}
        onClearRandomTodo={clearRandomTodo}
        isRandomMode={isRandomMode}
        onToggleRandomTodo={toggleRandomTodo}
      />
    </AppLayout>
  );
}

export default App;
