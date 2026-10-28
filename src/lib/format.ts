import { formatDistanceToNow, format } from "date-fns";

export function formatRelative(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string, pattern = "dd MMM yyyy, HH:mm") {
  try {
    return format(new Date(iso), pattern);
  } catch {
    return iso;
  }
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatPercent(n: number, digits = 0) {
  return `${(n * 100).toFixed(digits)}%`;
}
