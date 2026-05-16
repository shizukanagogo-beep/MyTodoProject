export const TOAST_EVENT_NAME = "app:toast";

export type ToastVariant = "error" | "info";

export type ToastPayload = {
  message: string;
  variant: ToastVariant;
};

function showToast(message: string, variant: ToastVariant) {
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, {
      detail: {
        message,
        variant,
      },
    }),
  );
}

export function showErrorToast(message: string) {
  showToast(message, "error");
}

export function showInfoToast(message: string) {
  showToast(message, "info");
}
