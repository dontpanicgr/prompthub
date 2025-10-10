'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/database'
import { CategoryBadge } from '@/components/ui/category-badge'
import type { Category } from '@/lib/database'

export default function CategoryBadgesDemo() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Category Badges Demo</h1>
        <p className="text-muted-foreground">
          All available category badges with different sizes and variants
        </p>
      </div>

      {/* All Categories - Default */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">All Categories (Default)</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <CategoryBadge
              key={category.slug}
              category={category}
              variant="outline"
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Size Variants */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Size Variants</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Extra Small (xs)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="outline"
                  size="xs"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Small (sm)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="outline"
                  size="sm"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Medium (md)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="outline"
                  size="md"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Large (lg)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="outline"
                  size="lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Variant Styles */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Variant Styles</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filled (default)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="filled"
                  size="sm"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Outline</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="outline"
                  size="sm"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Transparent</h3>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <CategoryBadge
                  key={category.slug}
                  category={category}
                  variant="transparent"
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* With Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Links (href)</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.slice(0, 8).map((category) => (
            <CategoryBadge
              key={category.slug}
              category={category}
              variant="outline"
              size="sm"
              href={`/?category=${category.slug}`}
            />
          ))}
        </div>
      </div>

      {/* Clickable */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Clickable (onClick)</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.slice(0, 6).map((category) => (
            <CategoryBadge
              key={category.slug}
              category={category}
              variant="outline"
              size="sm"
              onClick={() => alert(`Clicked ${category.name}`)}
            />
          ))}
        </div>
      </div>

      {/* With Remove Button */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Remove Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.slice(0, 6).map((category) => (
            <CategoryBadge
              key={category.slug}
              category={category}
              variant="outline"
              size="sm"
              showRemove={true}
              onRemove={() => alert(`Remove ${category.name}`)}
            />
          ))}
        </div>
      </div>

      {/* Without Icons */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Without Icons</h2>
        <div className="flex flex-wrap items-center gap-2">
          {categories.slice(0, 8).map((category) => (
            <CategoryBadge
              key={category.slug}
              category={category}
              variant="outline"
              size="sm"
              showIcon={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
