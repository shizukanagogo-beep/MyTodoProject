import type { DatedFilter, Todo } from "../types";
import { getLocalDateString } from "./date";

export type TodoDateContext = {
  today: string;
  tomorrow: string;
};

export const getTodoDateContext = (): TodoDateContext => ({
  today: getLocalDateString(),
  tomorrow: getLocalDateString(1),
});

export const isOverdueTodo = (
  todo: Todo,
  today = getLocalDateString(),
) => todo.dueDate !== null && todo.dueDate < today && todo.status !== "DONE";

export const matchesDatedFilter = (
  todo: Todo,
  datedFilter: DatedFilter,
  dateContext = getTodoDateContext(),
) => {
  if (datedFilter === "today") {
    return todo.dueDate?.slice(0, 10) === dateContext.today;
  }

  if (datedFilter === "tomorrow") {
    return todo.dueDate?.slice(0, 10) === dateContext.tomorrow;
  }

  if (datedFilter === "undecided") {
    return todo.dueDateUndecided && !isOverdueTodo(todo, dateContext.today);
  }

  return todo.dueDate !== null || todo.dueDateUndecided;
};
