"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Wallet, Download, Upload } from "lucide-react"
import { type Account, getAccounts, saveAccounts } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import AccountForm from "@/components/account-form"
import AccountIcon from "@/components/account-icon"

export default function AccountsManager() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  useEffect(() => {
    setAccounts(getAccounts())
  }, [])

  const handleFormDone = () => {
    setAccounts(getAccounts())
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDelete = (account: Account) => {
    const updated = accounts.filter((a) => a.id !== account.id)
    saveAccounts(updated)
    setAccounts(updated)
    toast({
      title: "Account deleted",
      description: `"${account.name}" has been removed`,
    })
  }

  const handleAddNew = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleExport = () => {
    const current = getAccounts()
    if (current.length === 0) {
      toast({ title: "Nothing to export", description: "You haven't added any accounts yet." })
      return
    }
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "accounts.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Exported", description: `${current.length} account(s) exported to accounts.json` })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string)
          if (!Array.isArray(parsed)) throw new Error("File must contain an array of accounts")
          const valid = parsed.filter((item) =>
            item && typeof item.id === "string" && item.id &&
            typeof item.name === "string" && item.name &&
            typeof item.color === "string" && item.color
          )
          if (valid.length === 0) throw new Error("No valid accounts found in file")
          const existing = getAccounts()
          const existingIds = new Set(existing.map((a) => a.id))
          const newAccounts = valid.filter((a: Account) => !existingIds.has(a.id))
          const skipped = valid.length - newAccounts.length
          const merged = [...existing, ...newAccounts]
          saveAccounts(merged)
          setAccounts(merged)
          toast({
            title: "Import complete",
            description: `${newAccounts.length} account(s) added${skipped > 0 ? `, ${skipped} skipped (duplicate IDs)` : ""}`,
          })
        } catch (err) {
          toast({
            title: "Import failed",
            description: err instanceof Error ? err.message : "The file format is invalid",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Accounts</h2>
              <p className="text-muted-foreground mt-1">Manage your bank accounts</p>
            </div>
            {!showForm && (
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button onClick={handleExport} variant="outline" className="hover:bg-accent/10 hover:text-accent border-border flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
                <Button onClick={handleImport} variant="outline" className="hover:bg-accent/10 hover:text-accent border-border flex-1 sm:flex-none">
                  <Upload className="h-4 w-4 mr-2" /> Import
                </Button>
                <Button onClick={handleAddNew} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" /> Add Account
                </Button>
              </div>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <AccountForm onSave={handleFormDone} editingAccount={editingAccount} />
            </div>
          )}

          {accounts.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Add your bank accounts to assign budget categories and see transfer summaries in your results.
              </p>
              <Button onClick={handleAddNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Your First Account
              </Button>
            </div>
          ) : (
            accounts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="border border-border/30 bg-muted/10">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AccountIcon account={account} size={40} />
                        <span className="font-semibold text-foreground">{account.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
