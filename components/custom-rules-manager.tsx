"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Euro, Percent, Download, Upload } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import CustomRuleForm from "./custom-rule-form"

interface Category {
  name: string
  percentage: number
  fixedAmount: number
  isFixed: boolean
  color: string
}

interface CustomRule {
  id: string
  name: string
  categories: Category[]
}

export default function CustomRulesManager() {
  const [customRules, setCustomRules] = useState<CustomRule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null)

  useEffect(() => {
    loadCustomRules()
  }, [])

  const loadCustomRules = () => {
    const rulesJSON = localStorage.getItem("customBudgetRules")
    if (rulesJSON) {
      try {
        const rules = JSON.parse(rulesJSON)
        setCustomRules(rules)
      } catch (e) {
        console.error("Error loading custom rules:", e)
        setCustomRules([])
      }
    }
  }

  const handleDelete = (ruleId: string) => {
    const updatedRules = customRules.filter((rule) => rule.id !== ruleId)
    localStorage.setItem("customBudgetRules", JSON.stringify(updatedRules))
    setCustomRules(updatedRules)
    toast.error("The custom budget rule has been deleted", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  const handleEdit = (rule: CustomRule) => {
    setEditingRule(rule)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRule(null)
    loadCustomRules()
  }

  const handleExport = () => {
    try {
      const rulesJSON = localStorage.getItem("customBudgetRules")
      if (!rulesJSON) {
        toast.warning("You haven't created any custom budget rules yet", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        return
      }

      const blob = new Blob([rulesJSON], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "custom-budget-rules.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Your custom budget rules have been exported successfully", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch (e) {
      console.error("Error exporting rules:", e)
      toast.error("There was an error exporting your rules", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedRules = JSON.parse(event.target?.result as string)
          
          if (!Array.isArray(importedRules)) {
            throw new Error("Invalid format")
          }

          // Validate each rule has required properties
          const isValid = importedRules.every(rule => 
            rule.id && 
            rule.name && 
            Array.isArray(rule.categories) &&
            rule.categories.every((cat: Category) => 
              cat.name && 
              typeof cat.percentage === 'number' && cat.percentage >= 0 && cat.percentage <= 100 &&
              typeof cat.fixedAmount === 'number' && cat.fixedAmount >= 0 &&
              typeof cat.isFixed === 'boolean' &&
              cat.color
            )
          )

          if (!isValid) {
            throw new Error("Invalid rule format")
          }

          // Get existing rules
          const existingRulesJSON = localStorage.getItem("customBudgetRules")
          const existingRules = existingRulesJSON ? JSON.parse(existingRulesJSON) : []

          // Merge rules, avoiding duplicates based on id
          const mergedRules = [...existingRules]
          importedRules.forEach(importedRule => {
            if (!mergedRules.some(existingRule => existingRule.id === importedRule.id)) {
              mergedRules.push(importedRule)
            }
          })

          // Save merged rules
          localStorage.setItem("customBudgetRules", JSON.stringify(mergedRules))
          setCustomRules(mergedRules)

          toast.success("Your custom budget rules have been imported successfully", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        } catch (e) {
          console.error("Error importing rules:", e)
          toast.error("The file format is invalid or corrupted", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  return (
    <div className="space-y-4">
      {showForm ? (
        <CustomRuleForm onSave={handleFormClose} editingRule={editingRule} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-[#96DAAF]">Custom Budget Rules</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button onClick={handleExport} variant="outline" className="border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF] flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" /> Export Rules
              </Button>
              <Button onClick={handleImport} variant="outline" className="border-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF] flex-1 sm:flex-none">
                <Upload className="h-4 w-4 mr-2" /> Import Rules
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF] flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" /> Create New Rule
              </Button>
            </div>
          </div>

          {customRules.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>You haven't created any custom budget rules yet.</p>
                <Button variant="outline" className="mt-4 bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {customRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{rule.name}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {rule.categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>
                            {category.name}{" "}
                            {category.isFixed ? (
                              <span className="text-gray-500">
                                <Euro className="inline h-3 w-3" />
                                {category.fixedAmount}
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                {category.percentage}
                                <Percent className="inline h-3 w-3" />
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
