"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Account, type AccountGroup, getAccounts, groupCategoriesByAccount } from "@/lib/utils"
import AccountIcon from "@/components/account-icon"

interface Category {
  name: string
  color: string
  percentage?: number
  fixedAmount?: number
  isFixed?: boolean
  accountId?: string | null
}

interface AccountSummaryProps {
  categories: Category[]
  income: number
}

export default function AccountSummary({ categories, income }: AccountSummaryProps) {
  const [groups, setGroups] = useState<AccountGroup[]>([])

  useEffect(() => {
    const accounts = getAccounts()
    const grouped = groupCategoriesByAccount(categories, accounts, income)
    setGroups(grouped.sort((a, b) => b.total - a.total))
  }, [categories, income])

  if (groups.length === 0) return null

  return (
    <Card className="backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => {
          const accountName = group.account?.name ?? "No Account"
          const accountColor = group.account?.color ?? "hsl(0, 0%, 60%)"

          return (
            <div
              key={group.account?.id ?? "no-account"}
              className="rounded-lg border border-border/30 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  {group.account ? (
                    <AccountIcon account={group.account} size={16} />
                  ) : (
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accountColor }} />
                  )}
                  <span className="font-semibold text-foreground">{accountName}</span>
                </div>
                <span className="font-bold text-primary tabular-nums">€{group.total.toFixed(2)}</span>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {group.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border border-border/30 bg-background/50"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-foreground font-medium">{cat.name}</span>
                    <span className="text-muted-foreground tabular-nums">€{cat.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
