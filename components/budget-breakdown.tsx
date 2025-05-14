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

  return (
    <div className="space-y-3">
      {categories.map((category, index) => {
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
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: category.color }} />
                <span className="font-medium text-base">{category.name}</span>
              </div>
              <div className="text-right">
                  <div className="font-bold text-base">€{amount.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {category.isFixed ? `Fixed (${effectivePercentage.toFixed(1)}%)` : `${category.percentage}%`}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Card className="shadow-md mt-4">
        <CardContent className="p-4 flex justify-between items-center font-bold">
          <span className="text-lg">Total</span>
          <span className="text-lg">€{income.toFixed(2)}</span>
        </CardContent>
      </Card>
    </div>
  )
}
