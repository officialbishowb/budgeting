import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomColor() {
  // Generate pastel colors that are visually distinct
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 65%)`
}

export function getCustomRules() {
  if (typeof window === "undefined") return []

  try {
    const rulesJSON = localStorage.getItem("customBudgetRules")
    if (!rulesJSON) return []

    const parsed = JSON.parse(rulesJSON)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error("Error loading custom rules:", e)
    return []
  }
}
