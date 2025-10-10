'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { modelIcons } from '@/components/ui/model-badge'
import { categoryIcons } from '@/components/ui/category-badge'
import { getCategories, type Category } from '@/lib/database'

const ALL_MODELS = Object.keys(modelIcons) as Array<keyof typeof modelIcons>

export default function CreateTestPage() {
  const [selectedModel, setSelectedModel] = useState<string>('GPT')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
        if (cats.length > 0) setSelectedCategory(cats[0].id)
      } finally {
        setLoadingCategories(false)
      }
    }
    run()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="text-sm font-medium">Model</div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_MODELS.map((model) => {
                    const Icon = modelIcons[model]
                    return (
                      <SelectItem key={model} value={model}>
                        <div className="flex items-center gap-2">
                          <Icon />
                          <span>{model}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="text-sm font-medium">Category</div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loadingCategories}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingCategories ? 'Loading categories...' : 'Select a category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = categoryIcons[(cat.slug as keyof typeof categoryIcons) || 'other'] || categoryIcons['other']
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon />
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}


