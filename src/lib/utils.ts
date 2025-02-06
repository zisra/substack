import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkUrlValid() {
  try {
    new URL(url);
    return false;
  } catch (e) {
    return true;
  }
}