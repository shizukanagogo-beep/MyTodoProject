import type { ReactNode } from "react";
import type { Category, DatedFilter, ViewMode } from "../types";
import Tooltip from "./Tooltip";

type TodoListHeaderProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  showDoneTodos: boolean;
  datedSortMode: "manual" | "dueDate";
  canGroupByCategory: boolean;
  groupByCategory: boolean;
  isRandomMode: boolean;
  datedFilter: DatedFilter;
  onBackToTop: () => void;
  onOpenTodoModal: () => void;
  onToggleShowDoneTodos: () => void;
  onChangeDatedSortMode: (mode: "manual" | "dueDate") => void;
  onToggleGroupByCategory: () => void;
  onToggleRandomTodo: () => void;
  onChangeDatedFilter: (filter: DatedFilter) => void;
};

type HeaderIconButtonProps = {
  active: boolean;
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
  onClick: () => void;
};

const filterButtonBaseClass =
  "px-3 py-2 rounded-xl text-sm font-bold border transition-colors";

const inactiveFilterButtonClass =
  "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

const iconButtonBaseClass =
  "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors";

const activeIconButtonClass =
  "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200";

const inactiveIconButtonClass =
  "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

const datedFilterItems: { value: DatedFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "today", label: "今日" },
  { value: "tomorrow", label: "明日" },
  { value: "undecided", label: "未定" },
];

const CategoryListIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);

const DoneFilterIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12.5 8.5 17 20 5" />
    <path d="M4 19h16" />
  </svg>
);

function HeaderIconButton({
  active,
  ariaLabel,
  tooltip,
  children,
  onClick,
}: HeaderIconButtonProps) {
  return (
    <Tooltip label={tooltip}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={`${iconButtonBaseClass} ${
          active ? activeIconButtonClass : inactiveIconButtonClass
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function TodoListHeader({
  viewMode,
  categories,
  selectedCategoryId,
  showDoneTodos,
  datedSortMode,
  canGroupByCategory,
  groupByCategory,
  isRandomMode,
  datedFilter,
  onBackToTop,
  onOpenTodoModal,
  onToggleShowDoneTodos,
  onChangeDatedSortMode,
  onToggleGroupByCategory,
  onToggleRandomTodo,
  onChangeDatedFilter,
}: TodoListHeaderProps) {
  const viewTitle =
    viewMode === "CATEGORY_DETAIL"
      ? categories.find((category) => category.id === selectedCategoryId)?.name
      : viewMode === "UNCATEGORIZED"
        ? "カテゴリなし"
        : viewMode === "DATED"
          ? "日付ありタスク"
          : viewMode === "DAILY"
            ? "日課タスク"
            : viewMode === "FLAGGED"
              ? "フラグ付き"
              : "";

  return (
    <div className={`mb-8 ${viewMode === "DATED" ? "space-y-2" : "space-y-4"}`}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onBackToTop}
            className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
          >
            ←
          </button>

          <h2 className="truncate text-base font-bold text-slate-600">
            {viewTitle}
          </h2>
        </div>

        {viewMode === "DATED" && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <select
              aria-label="日付フィルター"
              value={datedFilter}
              onChange={(e) =>
                onChangeDatedFilter(e.target.value as DatedFilter)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 outline-none transition-colors hover:bg-slate-50 focus:border-indigo-500"
            >
              {datedFilterItems.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                onChangeDatedSortMode(
                  datedSortMode === "dueDate" ? "manual" : "dueDate",
                )
              }
              className={`${filterButtonBaseClass} ${
                datedSortMode === "dueDate"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                  : inactiveFilterButtonClass
              }`}
            >
              期限順
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="新規タスク作成"
            onClick={onOpenTodoModal}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-100 transition-colors hover:bg-indigo-700"
          >
            +新規タスク
          </button>
        </div>

        <div className="flex shrink-0 items-end">
          <div className="flex items-center justify-end gap-2">
            <HeaderIconButton
              active={showDoneTodos}
              ariaLabel={showDoneTodos ? "未完了のみ表示" : "完了済みも表示"}
              tooltip="完了済みの表示／非表示"
              onClick={onToggleShowDoneTodos}
            >
              <DoneFilterIcon />
            </HeaderIconButton>

            {canGroupByCategory && (
              <HeaderIconButton
                active={groupByCategory}
                ariaLabel="カテゴリ別表示"
                tooltip="カテゴリ別表示"
                onClick={onToggleGroupByCategory}
              >
                <CategoryListIcon />
              </HeaderIconButton>
            )}

            <HeaderIconButton
              active={isRandomMode}
              ariaLabel="ランダム表示"
              tooltip="リスト内のランダムな未完了タスクを１件表示"
              onClick={onToggleRandomTodo}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ?
              </span>
            </HeaderIconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoListHeader;
