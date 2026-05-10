import { useEffect, useState } from "react";
import type { Category } from "../types";
import {
  fetchCategories as fetchCategoriesApi,
  addCategory as addCategoryApi,
  updateCategory as updateCategoryApi,
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
      alert("カテゴリ名を入力してください");
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
      alert("カテゴリ更新に失敗しました。");
      return false;
    }
  };

  return {
    categories,
    loadingCategories,
    addCategory,
    updateCategory,
  };
}
