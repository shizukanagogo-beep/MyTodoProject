import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useTodoModal } from "./hooks/useTodoModal";
import { useCategoryModal } from "./hooks/useCategoryModal";
import { useViewMode } from "./hooks/useViewMode";
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
    goUncategorized,
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
    isRandomMode,
    toggleRandomTodo,
    datedFilter,
    setDatedFilter,
    resetDatedFilters,
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
    <AppLayout
      onTitleClick={() => {
        resetDatedFilters();
        goTop();
      }}
    >
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
        onOpenTodoModal={openTodoModal}
        onOpenCategoryModal={openCategoryModal}
        onOpenCategoryDetail={(categoryId) => {
          resetDatedFilters();
          goCategoryDetail(categoryId);
        }}
        onOpenUncategorized={() => {
          resetDatedFilters();
          goUncategorized();
        }}
        onOpenDated={goDated}
        onOpenDaily={() => {
          resetDatedFilters();
          goDaily();
        }}
        onOpenFlagged={() => {
          resetDatedFilters();
          goFlagged();
        }}
        onBackToTop={() => {
          resetDatedFilters();
          goTop();
        }}
        onToggleStatus={toggleStatus}
        onDeleteTodo={deleteTodo}
        onOpenTodoDetail={openTodoDetailModal}
        onReorderTodos={reorderTodos}
        onReorderCategories={reorderCategories}
        isRandomMode={isRandomMode}
        onToggleRandomTodo={toggleRandomTodo}
        datedFilter={datedFilter}
        onChangeDatedFilter={setDatedFilter}
      />
    </AppLayout>
  );
}

export default App;
