"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Wallet, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAccounts, saveAccounts, type Account } from "@/lib/utils"

interface Category {
  name: string
  percentage: number
  fixedAmount: number
  isFixed: boolean
  color: string
  accountId?: string | null
}

interface CustomRule {
  id: string
  name: string
  categories: Category[]
}

interface BackupFile {
  version: number
  exportedAt: string
  accounts?: Account[]
  budgetRules?: CustomRule[]
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function SettingsPage() {
  const { toast } = useToast()

  const handleExportAll = () => {
    const accounts = getAccounts()
    const rulesJSON = localStorage.getItem("customBudgetRules")
    const budgetRules: CustomRule[] = rulesJSON ? JSON.parse(rulesJSON) : []

    if (accounts.length === 0 && budgetRules.length === 0) {
      toast({ title: "Nothing to export", description: "No accounts or budget rules found." })
      return
    }

    const backup: BackupFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      budgetRules,
    }
    downloadJSON(backup, "budgeting-backup.json")
    toast({
      title: "Backup exported",
      description: `${accounts.length} account(s) and ${budgetRules.length} rule(s) saved to budgeting-backup.json`,
    })
  }

  const handleImportAll = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as BackupFile

          const hasAccounts = Array.isArray(parsed.accounts)
          const hasRules = Array.isArray(parsed.budgetRules)
          if (!hasAccounts && !hasRules) {
            throw new Error("File must contain at least an 'accounts' or 'budgetRules' array")
          }

          let addedAccounts = 0
          let addedRules = 0

          // Import accounts
          if (hasAccounts) {
            const validAccounts = (parsed.accounts ?? []).filter(
              (item) =>
                item &&
                typeof item.id === "string" && item.id &&
                typeof item.name === "string" && item.name &&
                typeof item.color === "string" && item.color
            )
            const existing = getAccounts()
            const existingIds = new Set(existing.map((a) => a.id))
            const newAccounts = validAccounts.filter((a) => !existingIds.has(a.id))
            saveAccounts([...existing, ...newAccounts])
            addedAccounts = newAccounts.length
          }

          // Import budget rules
          if (hasRules) {
            const existingRulesJSON = localStorage.getItem("customBudgetRules")
            const existingRules: CustomRule[] = existingRulesJSON ? JSON.parse(existingRulesJSON) : []
            const existingRuleIds = new Set(existingRules.map((r) => r.id))

            const newRules = (parsed.budgetRules ?? []).filter((rule) => {
              if (!rule.id || !rule.name || !Array.isArray(rule.categories)) return false
              if (existingRuleIds.has(rule.id)) return false
              const categoriesValid = rule.categories.every(
                (cat: Category) =>
                  cat.name &&
                  typeof cat.percentage === "number" && cat.percentage >= 0 && cat.percentage <= 100 &&
                  typeof cat.fixedAmount === "number" && cat.fixedAmount >= 0 &&
                  typeof cat.isFixed === "boolean" &&
                  cat.color
              )
              if (!categoriesValid) return false
              const pctCats = rule.categories.filter((c: Category) => !c.isFixed)
              if (pctCats.length > 0) {
                const total = pctCats.reduce((s: number, c: Category) => s + c.percentage, 0)
                if (Math.abs(total - 100) > 0.01) return false
              }
              return true
            })
            localStorage.setItem("customBudgetRules", JSON.stringify([...existingRules, ...newRules]))
            addedRules = newRules.length
          }

          toast({
            title: "Import complete",
            description: `${addedAccounts} account(s) and ${addedRules} rule(s) added`,
          })
        } catch (err) {
          toast({
            title: "Import failed",
            description: err instanceof Error ? err.message : "The file format is invalid or corrupted",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10" />

      <div className="relative w-full max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your budget rules and accounts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <Link href="/custom-rules" className="block">
            <Card className="h-full backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Budget Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  Create and manage your custom budgeting rules
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/accounts" className="block">
            <Card className="h-full backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <Wallet className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  Manage bank accounts and assign them to budget categories
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center">
                <Download className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Export &amp; Import All Settings</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Download a complete backup of all accounts and budget rules, or restore from a previous backup.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportAll}
                variant="outline"
                className="hover:bg-accent/10 hover:text-accent border-border flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" /> Export All
              </Button>
              <Button
                onClick={handleImportAll}
                variant="outline"
                className="hover:bg-accent/10 hover:text-accent border-border flex-1 sm:flex-none"
              >
                <Upload className="h-4 w-4 mr-2" /> Import Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
