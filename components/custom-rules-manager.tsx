"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Euro, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()
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
    toast({
      title: "Rule deleted",
      description: "The custom budget rule has been deleted",
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

  return (
    <div className="space-y-4">
      {showForm ? (
        <CustomRuleForm onSave={handleFormClose} editingRule={editingRule} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#96DAAF]">Custom Budget Rules</h2>
            <Button onClick={() => setShowForm(true)} className="bg-[#96DAAF] text-[#1C1B22] hover:bg-[#96DAAF]">
              <Plus className="h-4 w-4 mr-2" /> Create New Rule
            </Button>
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
