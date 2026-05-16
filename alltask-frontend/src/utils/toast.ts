export const TOAST_EVENT_NAME = "app:toast";

export type ToastVariant = "error";

export type ToastPayload = {
  message: string;
  variant: ToastVariant;
};

export function showErrorToast(message: string) {
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, {
      detail: {
        message,
        variant: "error",
      },
    }),
  );
}
