import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Category {
  name: string
  percentage?: number
  fixedAmount?: number
  isFixed?: boolean
  color: string
}

interface BudgetBreakdownProps {
  categories: Category[]
  income: number
}

export default function BudgetBreakdown({ categories, income }: BudgetBreakdownProps) {
  const [budgeted, setBudgeted] = useState<Set<string>>(new Set())

  // Calculate total fixed amounts
  const totalFixedAmount = categories.filter((cat) => cat.isFixed).reduce((sum, cat) => sum + (cat.fixedAmount || 0), 0)

  // Calculate remaining income for percentage-based categories
  const remainingIncome = income - totalFixedAmount

  // Sort categories: fixed first, then percentage-based
  const sortedCategories = [
    ...categories.filter((cat) => cat.isFixed),
    ...categories.filter((cat) => !cat.isFixed),
  ]

  // Use category name as unique key (could be improved with id if available)
  const toBudget = sortedCategories.filter(cat => !budgeted.has(cat.name))
  const alreadyBudgeted = sortedCategories.filter(cat => budgeted.has(cat.name))

  const renderCard = (category: Category) => {
    let amount = 0
    if (category.isFixed) {
      amount = category.fixedAmount || 0
    } else {
      amount = (remainingIncome * (category.percentage || 0)) / 100
    }
    const effectivePercentage = (amount / income) * 100
    const isBudgeted = budgeted.has(category.name)
    return (
      <Card key={category.name} className="backdrop-blur-sm bg-card/90 border border-border/30 hover:shadow-md transition-all duration-200">
        <CardContent className="p-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div 
              className="w-6 h-6 rounded-lg shadow-sm flex-shrink-0" 
              style={{ backgroundColor: category.color }} 
            />
            <span className="font-semibold text-foreground">{category.name}</span>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="font-bold text-lg text-foreground">€{amount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {category.isFixed ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary mr-2">
                  Fixed
                </span>
              ) : null}
              {category.isFixed
                ? `(${effectivePercentage.toFixed(1)}%)`
                : `${category.percentage}%`}
            </div>
            <Button
              size="sm"
              variant={isBudgeted ? "secondary" : "outline"}
              onClick={() => {
                setBudgeted(prev => {
                  const next = new Set(prev)
                  if (isBudgeted) {
                    next.delete(category.name)
                  } else {
                    next.add(category.name)
                  }
                  return next
                })
              }}
            >
              {isBudgeted ? "Unmark" : "Mark as Budgeted"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">To Budget</h3>
        {toBudget.length === 0 ? (
          <div className="text-muted-foreground text-sm mb-4">All categories are budgeted!</div>
        ) : (
          <div className="space-y-3">
            {toBudget.map(renderCard)}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">Already Budgeted</h3>
        {alreadyBudgeted.length === 0 ? (
          <div className="text-muted-foreground text-sm">No categories marked as budgeted yet.</div>
        ) : (
          <div className="space-y-3">
            {alreadyBudgeted.map(renderCard)}
          </div>
        )}
      </div>
      <Card className="backdrop-blur-sm bg-primary/10 border border-primary/30 shadow-lg mt-6">
        <CardContent className="p-5 flex justify-between items-center">
          <span className="text-xl font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">€{income.toFixed(2)}</span>
        </CardContent>
      </Card>
    </div>
  )
}
