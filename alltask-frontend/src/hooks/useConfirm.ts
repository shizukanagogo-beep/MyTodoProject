import { useState } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(
    null,
  );

  const openConfirm = (options: ConfirmOptions) => {
    setConfirmState(options);
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  const handleConfirm = async () => {
    if (!confirmState) return;

    await confirmState.onConfirm();
    closeConfirm();
  };

  return {
    confirmState,
    openConfirm,
    closeConfirm,
    handleConfirm,
  };
}
