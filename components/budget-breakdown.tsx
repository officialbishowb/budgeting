import { Card, CardContent } from "@/components/ui/card"

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
  // Calculate total fixed amounts
  const totalFixedAmount = categories.filter((cat) => cat.isFixed).reduce((sum, cat) => sum + (cat.fixedAmount || 0), 0)

  // Calculate remaining income for percentage-based categories
  const remainingIncome = income - totalFixedAmount

  // Sort categories: fixed first, then percentage-based
  const sortedCategories = [
    ...categories.filter((cat) => cat.isFixed),
    ...categories.filter((cat) => !cat.isFixed),
  ]

  return (
    <div className="space-y-3">
      {sortedCategories.map((category, index) => {
        // Calculate amount based on whether it's fixed or percentage
        let amount = 0
        if (category.isFixed) {
          amount = category.fixedAmount || 0
        } else {
          amount = (remainingIncome * (category.percentage || 0)) / 100
        }

        // Calculate effective percentage of total income
        const effectivePercentage = (amount / income) * 100

        return (
          <Card key={index} className="backdrop-blur-sm bg-card/90 border border-border/30 hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-6 h-6 rounded-lg shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: category.color }} 
                />
                <span className="font-semibold text-foreground">{category.name}</span>
              </div>
              <div className="text-right">
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
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Card className="backdrop-blur-sm bg-primary/10 border border-primary/30 shadow-lg mt-6">
        <CardContent className="p-5 flex justify-between items-center">
          <span className="text-xl font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">€{income.toFixed(2)}</span>
        </CardContent>
      </Card>
    </div>
  )
}
