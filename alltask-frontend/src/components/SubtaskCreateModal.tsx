import { useState } from "react";
import {
  modalLabelClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
  modalTextareaClassName,
  modalTitleInputClassName,
} from "../constants/ui";
import DueDateSetting from "./DueDateSetting";
import FlagCheckbox from "./FlagCheckbox";
import ModalShell from "./ModalShell";

type SubtaskDraft = {
  title: string;
  details: string;
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  hasFlag: boolean;
  overdueBehavior: number;
};

const initialSubtaskDraft: SubtaskDraft = {
  title: "",
  details: "",
  dueDate: "",
  dueDateUndecided: false,
  daily: false,
  hasFlag: false,
  overdueBehavior: 0,
};

type SubtaskCreateModalProps = {
  parentId: number;
  sortOrder: number | null;
  onClose: () => void;
  onCreateSuccess: () => void;
  onAddSubtask: (
    parentId: number,
    payload: {
      title: string;
      details: string;
      dueDate: string | null;
      dueDateUndecided: boolean;
      daily: boolean;
      hasFlag: boolean;
      autoCarryOver: boolean;
      overdueBehavior: number;
      sortOrder: number | null;
    },
  ) => Promise<boolean>;
};

function SubtaskCreateModal({
  parentId,
  sortOrder,
  onClose,
  onCreateSuccess,
  onAddSubtask,
}: SubtaskCreateModalProps) {
  const [newSubtask, setNewSubtask] =
    useState<SubtaskDraft>(initialSubtaskDraft);

  const handleAddSubtask = async () => {
    const isSuccess = await onAddSubtask(parentId, {
      title: newSubtask.title,
      details: newSubtask.details,
      dueDate: newSubtask.dueDate || null,
      dueDateUndecided: newSubtask.dueDateUndecided,
      daily: newSubtask.daily,
      hasFlag: newSubtask.hasFlag,
      autoCarryOver: false,
      overdueBehavior: newSubtask.overdueBehavior,
      sortOrder,
    });

    if (isSuccess) {
      setNewSubtask(initialSubtaskDraft);
      onCreateSuccess();
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      zIndexClassName="z-[80]"
      overlayClassName="bg-slate-900/40"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="タイトル"
            className={modalTitleInputClassName}
            value={newSubtask.title}
            onChange={(e) =>
              setNewSubtask({ ...newSubtask, title: e.target.value })
            }
          />

          <FlagCheckbox
            checked={newSubtask.hasFlag}
            onChange={(checked) =>
              setNewSubtask({
                ...newSubtask,
                hasFlag: checked,
              })
            }
          />
        </div>

        <DueDateSetting
          dueDate={newSubtask.dueDate}
          dueDateUndecided={newSubtask.dueDateUndecided}
          daily={newSubtask.daily}
          overdueBehavior={newSubtask.overdueBehavior}
          onChange={(draft) =>
            setNewSubtask({
              ...newSubtask,
              ...draft,
            })
          }
        />

        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className={modalLabelClassName}>詳細</p>
          </div>

          <textarea
            className={modalTextareaClassName}
            value={newSubtask.details}
            onChange={(e) =>
              setNewSubtask({
                ...newSubtask,
                details: e.target.value,
              })
            }
            placeholder="詳細メモ"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button className={modalSecondaryButtonClassName} onClick={onClose}>
            キャンセル
          </button>
          <button
            className={modalPrimaryButtonClassName}
            onClick={handleAddSubtask}
          >
            作成
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default SubtaskCreateModal;
