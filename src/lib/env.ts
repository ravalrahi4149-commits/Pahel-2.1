export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export const DEMO_MODE =
  ((import.meta.env.VITE_DEMO_MODE as string | undefined) ?? "true") !== "false";
