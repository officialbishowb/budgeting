"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, X, Euro, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateRandomColor } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface Category {
  name: string
  percentage: number
  fixedAmount: number
  isFixed: boolean
  color: string
}

interface CustomRuleFormProps {
  onSave: () => void
  editingRule?: {
    id: string
    name: string
    categories: Category[]
  } | null
}

export default function CustomRuleForm({ onSave, editingRule = null }: CustomRuleFormProps) {
  const { toast } = useToast()
  const [ruleName, setRuleName] = useState("")
  const [categories, setCategories] = useState<Category[]>([
    { name: "", percentage: 0, fixedAmount: 0, isFixed: false, color: generateRandomColor() },
    { name: "", percentage: 0, fixedAmount: 0, isFixed: false, color: generateRandomColor() },
  ])
  const [error, setError] = useState<string | null>(null)
  const [testIncome, setTestIncome] = useState(1000) // For validation purposes

  useEffect(() => {
    if (editingRule) {
      setRuleName(editingRule.name)
      // Ensure all categories have the isFixed and fixedAmount properties
      const updatedCategories = editingRule.categories.map((cat) => ({
        ...cat,
        isFixed: cat.isFixed || false,
        fixedAmount: cat.fixedAmount || 0,
      }))
      setCategories(updatedCategories)
    }
  }, [editingRule])

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        percentage: 0,
        fixedAmount: 0,
        isFixed: false,
        color: generateRandomColor(),
      },
    ])
  }

  const removeCategory = (index: number) => {
    if (categories.length <= 2) {
      toast({
        title: "Cannot remove",
        description: "You need at least 2 categories for a budget rule",
        variant: "destructive",
      })
      return
    }
    const newCategories = [...categories]
    newCategories.splice(index, 1)
    setCategories(newCategories)
  }

  const updateCategory = (index: number, field: keyof Category, value: string | number | boolean) => {
    const newCategories = [...categories]

    if (field === "isFixed") {
      // When switching to fixed, reset percentage to 0
      // When switching to percentage, reset fixedAmount to 0
      newCategories[index] = {
        ...newCategories[index],
        isFixed: value as boolean,
        percentage: value ? 0 : newCategories[index].percentage,
        fixedAmount: !value ? 0 : newCategories[index].fixedAmount,
      }
    } else {
      newCategories[index] = {
        ...newCategories[index],
        [field]: field === "percentage" || field === "fixedAmount" ? Number(value) : value,
      }
    }

    setCategories(newCategories)
  }

  const validateForm = () => {
    if (!ruleName.trim()) {
      setError("Please enter a rule name")
      return false
    }

    // Check for empty category names
    for (const category of categories) {
      if (!category.name.trim()) {
        setError("All categories must have a name")
        return false
      }

      // Ensure each category has either a percentage or fixed amount
      if (category.isFixed && category.fixedAmount <= 0) {
        setError(`${category.name} needs a fixed amount greater than 0`)
        return false
      }

      if (!category.isFixed && category.percentage <= 0) {
        setError(`${category.name} needs a percentage greater than 0`)
        return false
      }
    }

    // Calculate total fixed amounts
    const totalFixedAmount = categories.filter((cat) => cat.isFixed).reduce((sum, cat) => sum + cat.fixedAmount, 0)

    // Check if fixed amounts exceed test income
    if (totalFixedAmount > testIncome) {
      setError(`Fixed amounts total $${totalFixedAmount} which exceeds the test income of $${testIncome}`)
      return false
    }

    // Calculate remaining percentage after fixed amounts
    const remainingIncome = testIncome - totalFixedAmount
    const percentageOfRemaining = (remainingIncome / testIncome) * 100

    // Calculate total percentage allocations
    const totalPercentage = categories.filter((cat) => !cat.isFixed).reduce((sum, cat) => sum + cat.percentage, 0)

    // Check if percentages add up to 100%
    if (Math.round(totalPercentage) !== 100) {
      setError(`Percentage allocations must add up to 100%. Current total: ${totalPercentage}%`)
      return false
    }

    // Check if the combination would exceed 100% of income
    const percentageUsed = (totalFixedAmount / testIncome) * 100
    if (percentageUsed >= 100) {
      setError(
        `Fixed amounts use ${percentageUsed.toFixed(1)}% of income, leaving no room for percentage-based categories`,
      )
      return false
    }

    setError(null)
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return

    // Create a unique ID for the rule
    const ruleId = editingRule?.id || `custom-${Date.now()}`

    // Get existing rules from localStorage
    const existingRulesJSON = localStorage.getItem("customBudgetRules")
    const existingRules = existingRulesJSON ? JSON.parse(existingRulesJSON) : []

    // If editing, remove the old rule
    const filteredRules = editingRule ? existingRules.filter((rule: any) => rule.id !== editingRule.id) : existingRules

    // Add the new/updated rule
    const updatedRules = [
      ...filteredRules,
      {
        id: ruleId,
        name: ruleName,
        categories: categories,
      },
    ]

    // Save to localStorage
    localStorage.setItem("customBudgetRules", JSON.stringify(updatedRules))

    toast({
      title: "Success",
      description: `Budget rule "${ruleName}" has been saved`,
    })

    // Reset form if not editing
    if (!editingRule) {
      setRuleName("")
      setCategories([
        { name: "", percentage: 0, fixedAmount: 0, isFixed: false, color: generateRandomColor() },
        { name: "", percentage: 0, fixedAmount: 0, isFixed: false, color: generateRandomColor() },
      ])
    }

    onSave()
  }

  // Calculate totals for display
  const totalFixedAmount = categories.filter((cat) => cat.isFixed).reduce((sum, cat) => sum + cat.fixedAmount, 0)

  const totalPercentage = categories.filter((cat) => !cat.isFixed).reduce((sum, cat) => sum + cat.percentage, 0)

  const percentageUsedByFixed = (totalFixedAmount / testIncome) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{editingRule ? "Edit Budget Rule" : "Create Custom Budget Rule"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ruleName">Rule Name</Label>
          <Input
            id="ruleName"
            placeholder="e.g., My 40/30/30 Rule"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testIncome">Test Income (for validation)</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              id="testIncome"
              type="number"
              min="1"
              placeholder="1000"
              value={testIncome}
              onChange={(e) => setTestIncome(Number(e.target.value) || 1000)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-500">This is used to validate your rule but won't be saved with it.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Categories</Label>
            <Button variant="outline" size="sm" onClick={addCategory}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>

          {categories.map((category, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <Label htmlFor={`category-${index}`} className="font-medium">
                    Category {index + 1}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCategory(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor={`category-${index}`} className="text-sm">
                    Name
                  </Label>
                  <Input
                    id={`category-${index}`}
                    placeholder="e.g., Housing"
                    value={category.name}
                    onChange={(e) => updateCategory(index, "name", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`allocation-type-${index}`} className="text-sm">
                    Allocation Type
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!category.isFixed ? "font-medium" : "text-gray-500"}`}>Percentage</span>
                    <Switch
                      id={`allocation-type-${index}`}
                      checked={category.isFixed}
                      onCheckedChange={(checked) => updateCategory(index, "isFixed", checked)}
                    />
                    <span className={`text-sm ${category.isFixed ? "font-medium" : "text-gray-500"}`}>
                      Fixed Amount
                    </span>
                  </div>
                </div>

                {category.isFixed ? (
                  <div>
                    <Label htmlFor={`fixed-amount-${index}`} className="text-sm">
                      Fixed Amount
                    </Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id={`fixed-amount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={category.fixedAmount || ""}
                        onChange={(e) => updateCategory(index, "fixedAmount", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`percentage-${index}`} className="text-sm">
                      Percentage
                    </Label>
                    <div className="relative">
                      <Input
                        id={`percentage-${index}`}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="0"
                        value={category.percentage || ""}
                        onChange={(e) => updateCategory(index, "percentage", e.target.value)}
                        className="pr-8"
                      />
                      <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <div className="text-sm">
              <span className="font-medium">Fixed Amounts:</span> ${totalFixedAmount.toFixed(2)}
              <span className="text-gray-500 ml-1">({percentageUsedByFixed.toFixed(1)}% of test income)</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Percentage Allocations:</span> {totalPercentage}%
              {totalPercentage === 100 && <span className="text-green-500 ml-2">✓</span>}
            </div>
            <div className="text-sm">
              <span className="font-medium">Remaining for Percentages:</span> $
              {(testIncome - totalFixedAmount).toFixed(2)}
              <span className="text-gray-500 ml-1">({(100 - percentageUsedByFixed).toFixed(1)}% of test income)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onSave}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Save Rule
        </Button>
      </CardFooter>
    </Card>
  )
}
