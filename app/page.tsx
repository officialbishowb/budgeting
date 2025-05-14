"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Settings } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [income, setIncome] = useState("")
  const [frequency, setFrequency] = useState("monthly")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!income || isNaN(Number(income)) || Number(income) <= 0) return

    router.push(`/results?income=${income}&frequency=${frequency}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#1C1B22]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Budget Splitter</CardTitle>
            <Link href="/custom-rules">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <CardDescription>Enter your income to see how it breaks down using different budgeting rules</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="income" className="text-base">
                Income Amount
              </Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  id="income"
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter your income"
                  className="pl-10 h-12 text-lg"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-base">
                Income Frequency
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["monthly"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={frequency === option ? "default" : "outline"}
                    onClick={() => setFrequency(option)}
                    className="capitalize h-12 text-base bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF] hover:text-[#1C1B22]"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6">
            <Button type="submit" className="w-full h-12 text-lg font-medium bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
              Calculate Budget Splits
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
