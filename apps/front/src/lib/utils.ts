import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeOrigin = (origin: string | null | undefined): string => {
  if (!origin) return "";
  const hasProtocol = /^https?:\/\//.test(origin);
  const normalized = (hasProtocol ? origin : `https://${origin}`).replace(
    /\/$/,
    "",
  );
  return normalized.toLowerCase();
};
