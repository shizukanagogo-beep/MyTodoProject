import type { Category, NewTodo, ViewMode } from '../types';

type TodoModalProps = {
  newTodo: NewTodo;
  setNewTodo: React.Dispatch<React.SetStateAction<NewTodo>>;
  categories: Category[];
  viewMode: ViewMode;
  onClose: () => void;
  onAddTodo: () => void;
};