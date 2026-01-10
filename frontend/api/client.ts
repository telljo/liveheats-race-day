// client.ts
function getCsrfToken(): string | null {
  const el = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  return el?.content ?? null;
}

export type ApiErrorPayload =
  | string
  | {
      error?: { message?: string | string[] };
      message?: string;
      errors?: unknown;
      [key: string]: unknown;
    };

export class ApiError extends Error {
  name = "ApiError" as const;

  status: number;
  url: string;
  payload: ApiErrorPayload;

  constructor(args: { message: string; status: number; url: string; payload: ApiErrorPayload }) {
    super(args.message);
    this.status = args.status;
    this.url = args.url;
    this.payload = args.payload;
  }
}

function extractMessage(payload: ApiErrorPayload): string | null {
  if (typeof payload === "string") {
    const msg = payload.trim();
    return msg.length ? msg : null;
  }

  const m =
    (Array.isArray(payload?.error?.message) ? payload.error!.message[0] : payload?.error?.message) ||
    payload?.message;

  if (typeof m === "string" && m.trim().length) return m.trim();
  return null;
}

type ApiFetchOptions = RequestInit & { json?: unknown };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { json, headers, method, ...rest } = options;

  const m = (method ?? (json ? "POST" : "GET")).toUpperCase();
  const csrfToken = getCsrfToken();

  const res = await fetch(path, {
    method: m,
    credentials: "same-origin",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken && !["GET", "HEAD", "OPTIONS"].includes(m) ? { "X-CSRF-Token": csrfToken } : {}),
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const payload: ApiErrorPayload = contentType.includes("application/json")
    ? await res.json().catch(() => "")
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message = extractMessage(payload) ?? "Something went wrong. Please try again.";
    throw new ApiError({ message, status: res.status, url: path, payload });
  }

  return payload as T;
}
