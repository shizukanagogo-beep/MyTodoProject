import { api } from "../api";
import type { AuthSession } from "../api/client";

export type AuthCredentials = {
  username: string;
  password: string;
};

export async function login(credentials: AuthCredentials) {
  const response = await api.post<AuthSession>("/auth/login", credentials);
  return response.data;
}

export async function register(credentials: AuthCredentials) {
  const response = await api.post<AuthSession>("/auth/register", credentials);
  return response.data;
}
