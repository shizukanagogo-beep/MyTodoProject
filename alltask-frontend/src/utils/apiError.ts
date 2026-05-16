import axios from "axios";

type ApiErrorResponse = {
  error?: string;
  details?: Record<string, string>;
};

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
