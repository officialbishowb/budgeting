"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useMobile } from "@/hooks/use-mobile"

interface Category {
  name: string
  percentage?: number
  fixedAmount?: number
  isFixed?: boolean
  color: string
}

interface BudgetChartProps {
  categories: Category[]
  income: number
}

export default function BudgetChart({ categories, income }: BudgetChartProps) {
  // Calculate total fixed amounts
  const totalFixedAmount = categories.filter((cat) => cat.isFixed).reduce((sum, cat) => sum + (cat.fixedAmount || 0), 0)

  // Calculate remaining income for percentage-based categories
  const remainingIncome = income - totalFixedAmount

  const data = categories.map((category) => {
    // Calculate amount based on whether it's fixed or percentage
    let amount = 0
    if (category.isFixed) {
      amount = category.fixedAmount || 0
    } else {
      amount = (remainingIncome * (category.percentage || 0)) / 100
    }

    // Calculate effective percentage of total income
    const effectivePercentage = (amount / income) * 100

    return {
      name: category.name,
      value: amount,
      percentage: effectivePercentage,
      color: category.color,
      isFixed: category.isFixed,
    }
  })

  // Use the mobile hook
  const isMobile = useMobile()

  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={isMobile ? false : true}
            outerRadius={isMobile ? 70 : 90}
            fill="#8884d8"
            dataKey="value"
            label={
              isMobile
                ? ({ percentage }) => `${percentage.toFixed(1)}%`
                : ({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`€${value.toFixed(2)}`, "Amount"]}
            contentStyle={{ fontSize: "14px" }}
          />
          <Legend
            layout={isMobile ? "horizontal" : "vertical"}
            verticalAlign={isMobile ? "bottom" : "middle"}
            align={isMobile ? "center" : "right"}
            wrapperStyle={isMobile ? { fontSize: "12px" } : { fontSize: "14px", right: 0 }}
            formatter={(value, entry: any) => {
              const item = data.find((d) => d.name === value)
              return [
                <span key={value}>
                  {value} {item?.isFixed ? "(Fixed)" : ""}
                </span>,
                null,
              ]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
