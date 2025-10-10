'use client'

import { useState, useEffect } from 'react'
import { CategoryBadge } from '@/components/ui/category-badge'
import { getCategories } from '@/lib/database'
import type { Category } from '@/lib/database'

interface CategoriesDropdownProps {
  selectedCategoryIds: string[]
  onCategoryChange: (categoryIds: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CategoriesDropdown({
  selectedCategoryIds,
  onCategoryChange,
  placeholder = "Select categories...",
  className = "",
  disabled = false
}: CategoriesDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    if (disabled) return
    
    if (selectedCategoryIds.includes(categoryId)) {
      onCategoryChange(selectedCategoryIds.filter(id => id !== categoryId))
    } else {
      onCategoryChange([...selectedCategoryIds, categoryId])
    }
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-muted-foreground mb-2">Loading categories...</div>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-muted animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-muted-foreground">
          No categories available
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="text-sm text-muted-foreground mb-3">
        {selectedCategoryIds.length === 0 
          ? placeholder 
          : `${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? 'y' : 'ies'} selected`
        }
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const isSelected = selectedCategoryIds.includes(category.id)
          return (
            <CategoryBadge
              key={category.id}
              category={category}
              size="sm"
              variant={isSelected ? "filled" : "outline"}
              onClick={() => handleCategoryToggle(category.id)}
              className={`cursor-pointer transition-all ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : isSelected 
                    ? 'ring-2 ring-primary/20' 
                    : 'hover:bg-muted/50'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
