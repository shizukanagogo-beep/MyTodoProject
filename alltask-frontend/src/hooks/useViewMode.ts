import { useState } from "react";
import type { ViewMode } from "../types";

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("TOP");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const goTop = () => {
    setViewMode("TOP");
    setSelectedCategoryId(null);
  };

  const goCategoryDetail = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setViewMode("CATEGORY_DETAIL");
  };

  const goDated = () => {
    setViewMode("DATED");
  };

  const goDaily = () => {
    setViewMode("DAILY");
  };

  const goFlagged = () => {
    setViewMode("FLAGGED");
  };

  return {
    viewMode,
    selectedCategoryId,
    goTop,
    goCategoryDetail,
    goDated,
    goDaily,
    goFlagged,
  };
}
