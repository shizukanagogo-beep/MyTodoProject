export interface Category {
  id: number;
  name: string;
  sortOrder: number | null;
}

export interface Todo {
  id: number;
  categoryId: number | null;
  title: string;
  status: "INCOMPLETE" | "DONE";
  details: string | null;
  dueDate: string | null;
  daily: boolean;
  hasFlag: boolean;
  autoCarryOver: boolean;
  overdueBehavior: number;
  sortOrder: number | null;
}

export interface TodoSearchParams {
  categoryId?: number | null;
  existsDueDate?: boolean;
  daily?: boolean;
  hasFlag?: boolean;
}

export interface NewTodo {
  title: string;
  details: string;
  categoryId: number | "";
  dueDate: string;
  daily: boolean;
  hasFlag: boolean;
  autoCarryOver: boolean;
  overdueBehavior: number;
  sortOrder: number | null;
}

export type ViewMode =
  | "TOP"
  | "CATEGORY_DETAIL"
  | "DATED"
  | "DAILY"
  | "FLAGGED";
