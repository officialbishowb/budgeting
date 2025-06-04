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
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10" />
      
      <div className="relative w-full max-w-6xl">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/custom-rules" className="w-full xs:w-auto">
              <Button variant="outline" size="sm" className="w-full xs:w-auto hover:bg-accent/10 hover:text-accent border-border">
                <Settings className="mr-2 h-4 w-4" />
                <span className="sm:inline">Manage Rules</span>
                <span className="sm:hidden">Rules</span>
              </Button>
            </Link>
            <Link href="/" className="w-full xs:w-auto">
              <Button variant="ghost" size="sm" className="w-full xs:w-auto hover:bg-accent/10 hover:text-accent">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Income Display Card */}
        <Card className="mb-6 sm:mb-8 backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Budget Breakdown
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground">
              {getFrequencyText()} income: <span className="font-semibold text-foreground">€{income.toLocaleString()}</span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Responsive Tabs */}
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-4 sm:mb-6">
            {/* Mobile: Scrollable tabs */}
            <div className="sm:hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex gap-1 bg-muted/50 backdrop-blur-sm p-2 rounded-lg border border-border/50 min-w-max">
                  {/* Predefined rules - Mobile */}
                  {Object.keys(predefinedRules).map((ruleId) => (
                    <TabsTrigger 
                      key={ruleId} 
                      value={ruleId} 
                      className="px-3 py-2 text-xs font-medium transition-all duration-200 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/10 hover:text-accent rounded-md whitespace-nowrap flex-shrink-0"
                    >
                      {ruleId.replace(/-/g, "/")}
                    </TabsTrigger>
                  ))}

                  {/* Custom rules - Mobile */}
                  {customRules.map((rule) => (
                    <TabsTrigger 
                      key={rule.id} 
                      value={rule.id} 
                      className="px-3 py-2 text-xs font-medium transition-all duration-200 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/10 hover:text-accent rounded-md whitespace-nowrap flex-shrink-0"
                    >
                      {rule.name.length > 12 ? `${rule.name.substring(0, 12)}...` : rule.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* Desktop and Tablet: Responsive flex layout */}
            <div className="hidden sm:block">
              <TabsList className="flex flex-wrap justify-center gap-2 bg-muted/50 backdrop-blur-sm p-3 rounded-xl border border-border/50 min-h-[60px]">
                {/* Predefined rules */}
                {Object.keys(predefinedRules).map((ruleId) => (
                  <TabsTrigger 
                    key={ruleId} 
                    value={ruleId} 
                    className="px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium transition-all duration-200 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/10 hover:text-accent rounded-lg whitespace-nowrap flex-shrink-0"
                  >
                    <span className="md:hidden">{ruleId.replace(/-/g, "/")}</span>
                    <span className="hidden md:inline">{ruleId.replace(/-/g, "/")} Rule</span>
                  </TabsTrigger>
                ))}

                {/* Custom rules */}
                {customRules.map((rule) => (
                  <TabsTrigger 
                    key={rule.id} 
                    value={rule.id} 
                    className="px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium transition-all duration-200 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/10 hover:text-accent rounded-lg whitespace-nowrap flex-shrink-0"
                  >
                    <span className="block truncate max-w-[120px] md:max-w-none">
                      {rule.name}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          {Object.entries(allRules).map(([ruleId, categories]) => (
            <TabsContent key={ruleId} value={ruleId} className="space-y-4 sm:space-y-6">
              <Card className="backdrop-blur-sm bg-card/95 border border-border/50 shadow-lg">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">{getRuleName(ruleId)}</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {getRuleDescription(ruleId)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Chart - Responsive container */}
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[280px] sm:min-w-[400px]">
                      <BudgetChart categories={categories} income={income} />
                    </div>
                  </div>
                  
                  {/* Breakdown - Responsive container */}
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[280px] sm:min-w-[400px]">
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