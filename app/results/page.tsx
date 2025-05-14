"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Home, Settings } from "lucide-react"
import Link from "next/link"
import BudgetChart from "@/components/budget-chart"
import BudgetBreakdown from "@/components/budget-breakdown"
import { getCustomRules } from "@/lib/utils"

// Budget rule definitions
const predefinedRules = {
  "50-30-20": [
    { name: "Needs", percentage: 50, color: "#4ade80" },
    { name: "Wants", percentage: 30, color: "#60a5fa" },
    { name: "Savings", percentage: 20, color: "#f472b6" },
  ],
  "25-50-15-10": [
    { name: "Housing", percentage: 25, color: "#4ade80" },
    { name: "Necessities", percentage: 50, color: "#60a5fa" },
    { name: "Savings", percentage: 15, color: "#f472b6" },
    { name: "Fun", percentage: 10, color: "#fbbf24" },
  ],
  "60-20-20": [
    { name: "Living Expenses", percentage: 60, color: "#4ade80" },
    { name: "Savings & Debt", percentage: 20, color: "#60a5fa" },
    { name: "Personal Spending", percentage: 20, color: "#f472b6" },
  ],
  "70-20-10": [
    { name: "Living Expenses", percentage: 70, color: "#4ade80" },
    { name: "Savings", percentage: 20, color: "#60a5fa" },
    { name: "Giving", percentage: 10, color: "#f472b6" },
  ],
}

export default function Results() {
  const searchParams = useSearchParams()
  const [income, setIncome] = useState(0)
  const [frequency, setFrequency] = useState("monthly")
  const [activeTab, setActiveTab] = useState("50-30-20")
  const [customRules, setCustomRules] = useState<any[]>([])
  const [allRules, setAllRules] = useState<Record<string, any[]>>(predefinedRules)

  useEffect(() => {
    const incomeParam = searchParams.get("income")
    const frequencyParam = searchParams.get("frequency")

    if (incomeParam) {
      setIncome(Number(incomeParam))
    }

    if (frequencyParam) {
      setFrequency(frequencyParam)
    }
  }, [searchParams])

  // Separate useEffect for loading custom rules to avoid infinite loops
  useEffect(() => {
    // Load custom rules
    const rules = getCustomRules()
    setCustomRules(rules)

    // Create a combined rules object
    const combined: Record<string, any[]> = { ...predefinedRules }

    // Add custom rules
    rules.forEach((rule: any) => {
      combined[rule.id] = rule.categories
    })

    setAllRules(combined)

    // If there's a custom rule and no active tab is set, select the first custom rule
    if (rules.length > 0 && activeTab === "50-30-20") {
      setActiveTab(rules[0].id)
    }
  }, []) // Empty dependency array means this only runs once on mount

  const getFrequencyText = () => {
    switch (frequency) {
      case "monthly":
        return "Monthly"
      case "bi-weekly":
        return "Bi-Weekly"
      case "weekly":
        return "Weekly"
      default:
        return "Monthly"
    }
  }

  const getRuleName = (ruleId: string) => {
    // Check if it's a predefined rule
    if (ruleId in predefinedRules) {
      return ruleId.replace(/-/g, "/") + " Rule"
    }

    // Find custom rule name
    const customRule = customRules.find((rule) => rule.id === ruleId)
    return customRule ? customRule.name : ruleId
  }

  const getRuleDescription = (ruleId: string) => {
    switch (ruleId) {
        case "50-30-20":
          return "50% for needs (essential expenses), 30% for wants (non-essential spending), and 20% for savings or debt repayment";
      
        case "25-50-15-10":
          return "25% for housing, 50% for necessities (including housing, food, transportation), 15% for savings or investments, and 10% for fun or leisure";
      
        case "60-20-20":
          return "60% for living expenses (all essential and some discretionary), 20% for savings and debt repayment, and 20% for personal spending (e.g., entertainment, hobbies)";
      
        case "70-20-10":
          return "70% for living expenses, 20% for savings or investments, and 10% for savings.";
      }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-[#1C1B22]">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/custom-rules">
              <Button variant="outline" size="sm" className="border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
                <Settings className="mr-2 h-4 w-4" />
                Manage Rules
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="bg-white border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-6 bg-[#1C1B22] border-[#96DAAF]">
          <CardHeader>
            <CardTitle className="text-xl text-[#96DAAF]">Your Budget Breakdown</CardTitle>
            <CardDescription className="text-[#96DAAF]/80">
              {getFrequencyText()} income: €{income.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              <TabsList className="flex flex-wrap sm:flex-nowrap w-full gap-2 border rounded-lg p-2 sm:border-none sm:rounded-none sm:p-0 bg-[#1C1B22] border-[#96DAAF]">
                {/* Predefined rules */}
                {Object.keys(predefinedRules).map((ruleId) => (
                  <TabsTrigger 
                    key={ruleId} 
                    value={ruleId} 
                    className="flex-1 sm:flex-none min-w-[120px] text-center py-3 sm:py-2 px-3 text-sm whitespace-nowrap text-[#96DAAF] data-[state=active]:bg-[#96DAAF] data-[state=active]:text-[#1C1B22]"
                  >
                    {ruleId.replace(/-/g, "/")} Rule
                  </TabsTrigger>
                ))}

                {/* Custom rules */}
                {customRules.map((rule) => (
                  <TabsTrigger 
                    key={rule.id} 
                    value={rule.id} 
                    className="flex-1 sm:flex-none min-w-[120px] text-center py-3 sm:py-2 px-3 text-sm whitespace-nowrap text-[#96DAAF] data-[state=active]:bg-[#96DAAF] data-[state=active]:text-[#1C1B22]"
                  >
                    {rule.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {Object.entries(allRules).map(([ruleId, categories]) => (
            <TabsContent key={ruleId} value={ruleId} className="space-y-4">
              <Card className="bg-[#1C1B22] border-[#96DAAF]">
                <CardHeader>
                  <CardTitle className="text-lg text-[#96DAAF]">{getRuleName(ruleId)}</CardTitle>
                  <CardDescription className="text-[#96DAAF]/80">{getRuleDescription(ruleId)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BudgetChart categories={categories} income={income} />
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BudgetBreakdown categories={categories} income={income} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  )
}
