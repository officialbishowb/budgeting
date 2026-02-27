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

export interface Account {
  id: string
  name: string
  color: string
  url?: string
}

export function getFaviconUrl(url: string): string | null {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    const { hostname } = new URL(normalized)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return null
  }
}

export interface AccountGroup {
  account: Account | null // null = "No Account"
  categories: Array<{ name: string; color: string; amount: number; accountId?: string | null }>
  total: number
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

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return []

  try {
    const accountsJSON = localStorage.getItem("accounts")
    if (!accountsJSON) return []

    const parsed = JSON.parse(accountsJSON)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error("Error loading accounts:", e)
    return []
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("accounts", JSON.stringify(accounts))
}

export function groupCategoriesByAccount(
  categories: Array<{
    name: string
    color: string
    percentage?: number
    fixedAmount?: number
    isFixed?: boolean
    accountId?: string | null
  }>,
  accounts: Account[],
  income: number
): AccountGroup[] {
  // Calculate total fixed amounts
  const totalFixedAmount = categories
    .filter((c) => c.isFixed)
    .reduce((sum, c) => sum + (c.fixedAmount || 0), 0)
  const remainingIncome = income - totalFixedAmount

  // Calculate amount for each category
  const withAmounts = categories.map((cat) => ({
    name: cat.name,
    color: cat.color,
    accountId: cat.accountId ?? null,
    amount: cat.isFixed
      ? cat.fixedAmount || 0
      : (remainingIncome * (cat.percentage || 0)) / 100,
  }))

  // Build account groups
  const accountMap = new Map<string, AccountGroup>()
  for (const account of accounts) {
    accountMap.set(account.id, { account, categories: [], total: 0 })
  }

  const noAccountGroup: AccountGroup = { account: null, categories: [], total: 0 }

  for (const cat of withAmounts) {
    if (cat.accountId && accountMap.has(cat.accountId)) {
      const group = accountMap.get(cat.accountId)!
      group.categories.push(cat)
      group.total += cat.amount
    } else {
      noAccountGroup.categories.push(cat)
      noAccountGroup.total += cat.amount
    }
  }

  // Filter out empty account groups, put "No Account" last
  const result = [...accountMap.values()].filter((g) => g.categories.length > 0)
  if (noAccountGroup.categories.length > 0) {
    result.push(noAccountGroup)
  }

  return result
}
