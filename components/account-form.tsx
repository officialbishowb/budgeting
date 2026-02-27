"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Shuffle } from "lucide-react"
import { type Account, getAccounts, saveAccounts } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import AccountIcon from "@/components/account-icon"

const PRESET_COLORS = [
  "hsl(210, 70%, 65%)", // blue
  "hsl(142, 70%, 55%)", // green
  "hsl(340, 70%, 65%)", // pink
  "hsl(45, 80%, 65%)",  // amber
  "hsl(280, 60%, 65%)", // purple
  "hsl(20, 75%, 60%)",  // orange
  "hsl(170, 65%, 55%)", // teal
  "hsl(0, 70%, 65%)",   // red
]

interface AccountFormProps {
  onSave: () => void
  editingAccount?: Account | null
}

export default function AccountForm({ onSave, editingAccount = null }: AccountFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name)
      setColor(editingAccount.color)
      setUrl(editingAccount.url ?? "")
    } else {
      setName("")
      setColor(PRESET_COLORS[0])
      setUrl("")
    }
  }, [editingAccount])

  const randomColor = () => {
    const hue = Math.floor(Math.random() * 360)
    setColor(`hsl(${hue}, 70%, 65%)`)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter an account name", variant: "destructive" })
      return
    }

    const accounts = getAccounts()
    let updatedAccounts: Account[]

    const trimmedUrl = url.trim()
    if (editingAccount) {
      updatedAccounts = accounts.map((a) =>
        a.id === editingAccount.id
          ? { ...a, name: name.trim(), color, ...(trimmedUrl ? { url: trimmedUrl } : { url: undefined }) }
          : a
      )
    } else {
      const newAccount: Account = {
        id: `account-${Date.now()}`,
        name: name.trim(),
        color,
        ...(trimmedUrl ? { url: trimmedUrl } : {}),
      }
      updatedAccounts = [...accounts, newAccount]
    }

    saveAccounts(updatedAccounts)
    toast({
      title: "Success",
      description: `Account "${name.trim()}" has been ${editingAccount ? "updated" : "created"}`,
    })

    onSave()
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-card/95 border border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {editingAccount ? "Edit Account" : "Add Account"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountName">Account Name</Label>
          <Input
            id="accountName"
            placeholder="e.g., Revolut, N26, Main Bank"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountUrl">Website URL (for icon)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="accountUrl"
              placeholder="e.g., https://revolut.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {url.trim() && (
              <AccountIcon
                account={{ id: "", name: name || "preview", color, url: url.trim() }}
                size={32}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">The site's favicon will be used as the account icon.</p>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full transition-all duration-150 ${
                  color === presetColor ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: presetColor }}
                aria-label={`Select color`}
              />
            ))}
            <button
              type="button"
              onClick={randomColor}
              className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Random color"
            >
              <Shuffle className="h-3 w-3" />
            </button>
            <div
              className="w-8 h-8 rounded-full border border-border ml-1"
              style={{ backgroundColor: color }}
              title="Current color"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onSave}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" /> Save Account
        </Button>
      </CardFooter>
    </Card>
  )
}
