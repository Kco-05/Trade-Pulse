import { ApiError, type ApiErrorBody } from "./types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function parseError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as ApiErrorBody;
    if (data?.error) {
      return new ApiError(response.status, data.error);
    }
  } catch {
    // fall through
  }
  return new ApiError(
    response.status,
    response.statusText || `Request failed (${response.status})`,
  );
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(path, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
