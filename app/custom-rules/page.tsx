"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CustomRulesManager from "@/components/custom-rules-manager"

export default function CustomRulesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10" />
      
      <div className="relative w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <CustomRulesManager />
      </div>
    </main>
  )
}
