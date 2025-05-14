"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CustomRulesManager from "@/components/custom-rules-manager"

export default function CustomRulesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 bg-[#1C1B22]">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
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
