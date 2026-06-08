import { useState, type FormEvent } from "react";
import type { AuthSession } from "../api/client";
import {
  login,
  register,
  type AuthCredentials,
} from "../services/authService";
import { getApiErrorMessage } from "../utils/apiError";

type LoginPageProps = {
  onAuthenticated: (session: AuthSession) => void;
};

type AuthMode = "login" | "register";

const emptyCredentials: AuthCredentials = {
  username: "",
  password: "",
};

function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [credentials, setCredentials] = useState<AuthCredentials>(emptyCredentials);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginMode = mode === "login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = isLoginMode
        ? await login(credentials)
        : await register(credentials);

      onAuthenticated(session);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="theme-dark min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="text-3xl font-bold tracking-[0.12em] text-sky-500">
            Sleeper
          </span>
          <img
            src="/app-logo.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
          />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                isLoginMode
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                !isLoginMode
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-slate-700">
                ユーザー名
              </span>
              <input
                type="text"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                autoComplete="username"
                required
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-bold text-slate-700">
                パスワード
              </span>
              <input
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                required
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
            </label>

            {errorMessage && (
              <p className="rounded-lg border border-red-300 bg-red-950/40 px-3 py-2 text-sm font-bold text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-sky-600 px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "送信中..."
                : isLoginMode
                  ? "ログイン"
                  : "登録してログイン"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
