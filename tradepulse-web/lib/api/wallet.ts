import { apiClient } from "./client";
import type { AuthResponse, Balance } from "./types";

export function register(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/users/register", {
    method: "POST",
    body: { username, password },
  });
}

export function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/users/login", {
    method: "POST",
    body: { username, password },
  });
}

export function getBalance(userId: number): Promise<Balance> {
  return apiClient<Balance>(`/api/users/${userId}/balance`);
}
