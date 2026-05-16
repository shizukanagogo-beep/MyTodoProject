import {
  modalDangerButtonClassName,
  modalSecondaryButtonClassName,
} from "../constants/ui";
import ModalShell from "./ModalShell";

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmModal({
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <ModalShell
      title={title}
      onClose={onCancel}
      zIndexClassName="z-[300]"
      overlayClassName="bg-slate-900/50"
      panelClassName="p-6"
    >
      <div className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {message}
        </p>

        <div className="flex gap-2 pt-2">
          <button className={modalSecondaryButtonClassName} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={
              danger
                ? modalDangerButtonClassName
                : "flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default ConfirmModal;
