import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "./client";

let lastToastKey: string | null = null;
let lastToastAt = 0;

function toastOnce(key: string, fn: () => void, windowMs = 1500) {
  const now = Date.now();
  if (lastToastKey === key && now - lastToastAt < windowMs) return;
  lastToastKey = key;
  lastToastAt = now;
  fn();
}

function handleApiError(err: unknown) {
  // Network errors / unexpected
  if (!(err instanceof ApiError)) {
    toastOnce("unknown", () => toast.error("Network error. Please try again."));
    return;
  }

  const message = err.message;
  const status = err.status;

  if (status >= 500) {
    toastOnce(`5xx:${status}`, () => toast.error("Server error. Please try again later."));
    return;
  }

  toastOnce(`${status}:${message}`, () => toast.error(message));
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleApiError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleApiError(error),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
