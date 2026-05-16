import { useState } from "react";
import type { ApiFieldErrors } from "../utils/apiError";

type AddTodoResult = {
  success: boolean;
  fieldErrors?: ApiFieldErrors | null;
};

type UseTodoModalArgs = {
  addTodo: () => Promise<AddTodoResult>;
};

export function useTodoModal({ addTodo }: UseTodoModalArgs) {
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const openTodoModal = () => {
    setFieldErrors({});
    setIsTodoModalOpen(true);
  };

  const closeTodoModal = () => {
    setFieldErrors({});
    setIsTodoModalOpen(false);
  };

  const addTodoAndCloseModal = async () => {
    const result = await addTodo();

    if (result.success) {
      closeTodoModal();
      return;
    }

    setFieldErrors(result.fieldErrors ?? {});
  };

  return {
    isTodoModalOpen,
    fieldErrors,
    openTodoModal,
    closeTodoModal,
    addTodoAndCloseModal,
  };
}
