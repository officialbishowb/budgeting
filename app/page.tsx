"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Settings, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [income, setIncome] = useState("")
  const [frequency, setFrequency] = useState("monthly")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!income || isNaN(Number(income)) || Number(income) <= 0) return
    setLoading(true)
    // Simulate loading for UX (remove setTimeout in production)
    setTimeout(() => {
      router.push(`/results?income=${income}&frequency=${frequency}`)
    }, 800)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#1C1B22]">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-l-8 border-[#96DAAF] bg-[#F8F8F6]">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-serif font-bold text-[#1C1B22]">Budget Splitter</CardTitle>
            <Link href="/custom-rules">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <CardDescription className="font-serif text-[#1C1B22]/70">Enter your income to see how it breaks down using different budgeting rules</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="income" className="text-base font-serif text-[#1C1B22]">
                Income Amount
              </Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="income"
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter your income"
                  className="pl-10 h-12 text-lg bg-white border-[#96DAAF] text-[#1C1B22]"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-base font-serif text-[#1C1B22]">
                Income Frequency
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["monthly"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={frequency === option ? "default" : "outline"}
                    onClick={() => setFrequency(option)}
                    className={`capitalize h-12 text-base border-[#96DAAF] ${frequency === option ? "bg-[#96DAAF] text-[#1C1B22]" : "bg-white text-[#1C1B22]"}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6">
            <Button type="submit" className="w-full h-12 text-lg font-medium bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF] flex items-center justify-center" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
              {loading ? "Calculating..." : "Calculate Budget Splits"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
