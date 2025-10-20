'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { 
  Search,
  X,
  ArrowLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ModelBadge } from '@/components/ui/model-badge'
import { CategoryBadge } from '@/components/ui/category-badge'
import { getCategories } from '@/lib/database'
import type { Category } from '@/lib/database'

const MODELS = [
  'GPT',
  'Claude',
  'Gemini',
  'Gemma',
  'Grok',
  'Perplexity',
  'GitHub',
  'Copilot',
  'Mistral',
  'Meta',
  'Ollama',
  'Cohere',
  'Qwen',
  'DeepSeek',
  'Moonshot',
  'Black Forest Labs',
  'Other'
]

interface MobileTopHeaderProps {}

export default function MobileTopHeader({}: MobileTopHeaderProps) {
  const router = useRouter()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return
    }

    // Navigate to browse page with search query
    router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    
    // Reset search mode
    setIsSearchMode(false)
    setSearchQuery('')
  }

  const handleModelClick = (model: string) => {
    // Navigate to discover page with model filter
    router.push(`/discover?model=${encodeURIComponent(model)}`)
    setIsSearchMode(false)
    setSearchQuery('')
  }

  const handleCategoryClick = (categorySlug: string) => {
    // Navigate to discover page with category filter
    router.push(`/discover?category=${encodeURIComponent(categorySlug)}`)
    setIsSearchMode(false)
    setSearchQuery('')
  }

  const exitSearchMode = () => {
    setIsSearchMode(false)
    setSearchQuery('')
  }

  if (isSearchMode) {
    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Search Input */}
          <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={exitSearchMode}
              className="p-2 h-10"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-6 w-6"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              size="sm"
              className="h-10"
            >
              Search
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Models Section */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">Browse by Model</div>
              <div className="flex flex-wrap gap-2">
                {MODELS.map((model) => (
                  <ModelBadge
                    key={model}
                    model={model as any}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border text-foreground bg-card"
                    onClick={() => handleModelClick(model)}
                  />
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">Browse by Category</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <CategoryBadge
                    key={category.slug}
                    category={category}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border text-foreground bg-card"
                    onClick={() => handleCategoryClick(category.slug)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border transition-colors">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Lx</span>
          </div>
        </Link>

        {/* Right: Search Icon */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchMode(true)}
          className="p-2 w-10 h-10"
        >
          <Search size={18} />
        </Button>
      </div>
    </header>
  )
}
