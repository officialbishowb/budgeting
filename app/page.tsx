"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Settings, Loader2, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const [income, setIncome] = useState("")
  const [frequency, setFrequency] = useState("monthly")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Load last entered income from localStorage on mount
  useEffect(() => {
    const lastIncome = localStorage.getItem("lastIncome")
    if (lastIncome) setIncome(lastIncome)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!income || isNaN(Number(income)) || Number(income) <= 0) return
    setLoading(true)
    // Save last entered income
    localStorage.setItem("lastIncome", income)
    // Simulate loading for UX (remove setTimeout in production)
    setTimeout(() => {
      router.push(`/results?income=${income}&frequency=${frequency}`)
    }, 800)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
       <div className="flex justify-center items-center mb-8 z-10">
        <Image
          src="/budgeting.png"
          alt="Logo"
          width={200}
          height={200}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
     
      <Card className="relative w-full max-w-lg backdrop-blur-sm bg-card/95 shadow-2xl border border-border/50">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Budgeting
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Enter your income to see how it breaks down using different budgeting rules
              </CardDescription>
            </div>
            <Link href="/custom-rules">
              <Button variant="ghost" size="icon" className="hover:bg-accent/10 hover:text-accent">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="income" className="text-sm font-medium text-foreground">
                Income Amount
              </Label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="income"
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter your income"
                  className="pl-12 h-14 text-lg bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={income}
                  onChange={(e) => {
                    setIncome(e.target.value)
                    localStorage.setItem("lastIncome", e.target.value)
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="frequency" className="text-sm font-medium text-foreground">
                Income Frequency
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {["monthly"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={frequency === option ? "default" : "outline"}
                    onClick={() => setFrequency(option)}
                    className={`capitalize h-12 text-base transition-all duration-200 ${
                      frequency === option 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-background hover:bg-accent/10 hover:text-accent border-border"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-6 pb-8">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 group" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Calculating...
                </>
              ) : (
                <>
                  Calculate Budget Splits
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
