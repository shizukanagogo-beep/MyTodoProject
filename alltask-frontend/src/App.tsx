import { useEffect, useState } from "react";
import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";
import { useTodoModal } from "./hooks/useTodoModal";
import { useCategoryModal } from "./hooks/useCategoryModal";
import { useViewMode } from "./hooks/useViewMode";
import { useConfirm } from "./hooks/useConfirm";
import Loading from "./components/Loading";
import AppLayout from "./components/AppLayout";
import MainContent from "./components/MainContent";
import Modals from "./components/Modals";
import TodoDetailModal from "./components/TodoDetailModal";
import ConfirmModal from "./components/ConfirmModal";
import LoginPage from "./components/LoginPage";
import { useSelectedTodoModal } from "./hooks/useSelectedTodoModal";
import { APP_MESSAGES } from "./constants/messages";
import type { Category, NewTodo, Todo, ViewMode } from "./types";
import { getLocalDateString } from "./utils/date";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  type AuthSession,
} from "./api/client";

const createInitialTodoForView = (
  viewMode: ViewMode,
  selectedCategoryId: number | null,
): NewTodo => ({
  title: "",
  details: "",
  categoryId:
    viewMode === "CATEGORY_DETAIL" && selectedCategoryId !== null
      ? selectedCategoryId
      : "",
  parentId: null,
  dueDate: viewMode === "DATED" ? getLocalDateString() : "",
  dueDateUndecided: false,
  daily: viewMode === "DAILY",
  hasFlag: viewMode === "FLAGGED",
  autoCarryOver: false,
  overdueBehavior: 0,
  sortOrder: null,
});

type AuthenticatedAppProps = {
  username: string;
  onLogout: () => void;
};

function AuthenticatedApp({ username, onLogout }: AuthenticatedAppProps) {
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
    allTodos,
    sortedTodos,
    showDoneTodos,
    setShowDoneTodos,
    datedSortMode,
    setDatedSortMode,
    newTodo,
    setNewTodo,
    addTodo,
    addSubtask,
    updateTodo,
    toggleStatus,
    deleteTodo,
    deleteCompletedTodos,
    getCompletedTodosByCurrentView,
    reorderTodos,
    reorderSubtasks,
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
    confirmState,
    openConfirm,
    closeConfirm,
    handleConfirm,
  } = useConfirm();

  const {
    isTodoModalOpen,
    fieldErrors,
    openTodoModal,
    closeTodoModal,
    addTodoAndCloseModal,
  } = useTodoModal({
    addTodo,
  });

  const openTodoModalWithDefaults = () => {
    setNewTodo(createInitialTodoForView(viewMode, selectedCategoryId));
    openTodoModal();
  };

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

  const requestDeleteTodo = (id: number) => {
    const confirmMessage = APP_MESSAGES.confirm.deleteTodo;

    openConfirm({
      title: confirmMessage.title,
      message: confirmMessage.message,
      confirmLabel: confirmMessage.confirmLabel,
      danger: true,
      onConfirm: async () => {
        await deleteTodo(id);

        if (
          selectedTodo &&
          (selectedTodo.id === id || selectedTodo.parentId === id)
        ) {
          closeTodoDetailModal();
        }
      },
    });
  };

  const requestDeleteCategory = (category: Category) => {
    const confirmMessage = APP_MESSAGES.confirm.deleteCategory(category.name);

    openConfirm({
      title: confirmMessage.title,
      message: confirmMessage.message,
      confirmLabel: confirmMessage.confirmLabel,
      danger: true,
      onConfirm: async () => {
        await deleteCategoryAndReturnTopIfNeeded(category.id);
      },
    });
  };

  const requestDeleteCompletedTodos = (targetTodos: Todo[]) => {
    if (targetTodos.length === 0) {
      return;
    }

    const confirmMessage = APP_MESSAGES.confirm.deleteCompletedTodos();
    const targetTodoIds = new Set(targetTodos.map((todo) => todo.id));

    openConfirm({
      title: confirmMessage.title,
      message: confirmMessage.message,
      confirmLabel: confirmMessage.confirmLabel,
      danger: true,
      onConfirm: async () => {
        await deleteCompletedTodos(targetTodos);

        if (
          selectedTodo &&
          (targetTodoIds.has(selectedTodo.id) ||
            (selectedTodo.parentId !== null &&
              targetTodoIds.has(selectedTodo.parentId)))
        ) {
          closeTodoDetailModal();
        }
      },
    });
  };

  const currentCompletedTodos = getCompletedTodosByCurrentView();

  if (loadingCategories) return <Loading />;

  return (
    <AppLayout
      username={username}
      onLogout={onLogout}
      onTitleClick={() => {
        resetDatedFilters();
        goTop();
      }}
    >
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          danger={confirmState.danger}
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
        />
      )}

      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          parentTodo={
            selectedTodo.parentId === null
              ? null
              : (allTodos.find((todo) => todo.id === selectedTodo.parentId) ??
                null)
          }
          categories={categories}
          onClose={closeTodoDetailModal}
          onDeleteTodo={requestDeleteTodo}
          subtasks={allTodos
            .filter((todo) => todo.parentId === selectedTodo.id)
            .sort((a, b) => {
              if (a.sortOrder === null && b.sortOrder !== null) return 1;
              if (a.sortOrder !== null && b.sortOrder === null) return -1;
              if (a.sortOrder !== null && b.sortOrder !== null) {
                return a.sortOrder - b.sortOrder;
              }
              return b.id - a.id;
            })}
          onAddSubtask={addSubtask}
          onUpdateTodo={async (id, payload) => {
            const result = await updateTodo(id, payload);
            if (result.success && result.updatedTodo) {
              updateSelectedTodo(result.updatedTodo);
            }
            return result;
          }}
        />
      )}

      <Modals
        isTodoModalOpen={isTodoModalOpen}
        isCategoryModalOpen={isCategoryModalOpen}
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        categories={categories}
        todoFieldErrors={fieldErrors}
        onCloseTodoModal={closeTodoModal}
        onAddTodo={addTodoAndCloseModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onCloseCategoryModal={closeCategoryModal}
        onAddCategory={addCategoryFromModal}
        onUpdateCategory={updateCategory}
        onRequestDeleteCategory={requestDeleteCategory}
        onReorderCategories={reorderCategories}
      />

      <MainContent
        viewMode={viewMode}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        sortedTodos={sortedTodos}
        allTodos={allTodos}
        showDoneTodos={showDoneTodos}
        datedSortMode={datedSortMode}
        onToggleShowDoneTodos={() => setShowDoneTodos((prev) => !prev)}
        onChangeDatedSortMode={setDatedSortMode}
        onOpenTodoModal={openTodoModalWithDefaults}
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
        onDeleteTodo={requestDeleteTodo}
        onRequestDeleteCompletedTodos={() =>
          requestDeleteCompletedTodos(currentCompletedTodos)
        }
        canDeleteCompletedTodos={currentCompletedTodos.length > 0}
        onOpenTodoDetail={openTodoDetailModal}
        onReorderTodos={reorderTodos}
        onReorderSubtasks={reorderSubtasks}
        onReorderCategories={reorderCategories}
        isRandomMode={isRandomMode}
        onToggleRandomTodo={toggleRandomTodo}
        datedFilter={datedFilter}
        onChangeDatedFilter={setDatedFilter}
      />
    </AppLayout>
  );
}

function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    getStoredAuthSession(),
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthSession(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const handleAuthenticated = (session: AuthSession) => {
    saveAuthSession(session);
    setAuthSession(session);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession(null);
  };

  if (!authSession) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <AuthenticatedApp
      key={authSession.username}
      username={authSession.username}
      onLogout={handleLogout}
    />
  );
}

export default App;
