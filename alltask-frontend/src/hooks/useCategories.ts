import { useEffect, useState } from "react";
import type { Category } from "../types";
import { getApiErrorMessage } from "../utils/apiError";
import { showErrorToast } from "../utils/toast";
import {
  fetchCategories as fetchCategoriesApi,
  addCategory as addCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  updateCategorySortOrder,
} from "../services/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategoriesApi();
        setCategories(categories);
      } catch (error) {
        console.error("カテゴリの取得に失敗:", error);
        showErrorToast(getApiErrorMessage(error));
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const addCategory = async (name: string) => {
    if (!name.trim()) return;

    const createdCategory = await addCategoryApi(name);
    setCategories((prev) => [...prev, createdCategory]);
  };

  const updateCategory = async (id: number, name: string) => {
    if (!name.trim()) {
      return false;
    }
    try {
      const updatedCategory = await updateCategoryApi(id, name);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      );
      return true;
    } catch (error) {
      console.error("カテゴリ更新失敗:", error);
      showErrorToast(getApiErrorMessage(error));
      return false;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryApi(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      return true;
    } catch (error) {
      console.error("カテゴリ削除失敗:", error);
      showErrorToast(getApiErrorMessage(error));
      return false;
    }
  };

  const reorderCategories = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const reorderedCategories = [...categories];
    const [movedCategory] = reorderedCategories.splice(fromIndex, 1);
    reorderedCategories.splice(toIndex, 0, movedCategory);

    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      sortOrder: index + 1,
    }));

    setCategories(updatedCategories);

    try {
      await updateCategorySortOrder(
        updatedCategories.map((category) => ({
          id: category.id,
          sortOrder: category.sortOrder,
        })),
      );
    } catch (error) {
      console.error("カテゴリ並び順更新失敗:", error);
      showErrorToast(getApiErrorMessage(error));
      const categories = await fetchCategoriesApi();
      setCategories(categories);
    }
  };

  return {
    categories,
    loadingCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
