import axios from "axios";

export type ApiFieldErrors = Record<string, string>;

type ApiErrorResponse = {
  error?: string;
  details?: ApiFieldErrors;
};

export function getApiFieldErrors(error: unknown): ApiFieldErrors | null {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.details ?? null;
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (data?.details) {
      return Object.values(data.details).join("\n");
    }

    if (data?.error) {
      return data.error;
    }
  }

  return "エラーが発生しました";
}
