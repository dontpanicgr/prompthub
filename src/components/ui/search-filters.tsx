'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter, X, Settings2, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ModelBadge } from '@/components/ui/model-badge'
import { CategoryBadge } from '@/components/ui/category-badge'
import Tooltip from '@/components/ui/tooltip'
import { getCategories } from '@/lib/database'
import type { Category } from '@/lib/database'
import { deferToIdle, debounce } from '@/lib/performance-utils'

const MODELS = [
  'All Models',
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

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedModels: string[]
  setSelectedModels: (models: string[]) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  onSearch: (query: string, models: string[], categories: string[]) => void
  placeholder?: string
  toggleTooltip?: string
  hideCategories?: boolean
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedModels = [],
  setSelectedModels,
  selectedCategories = [],
  setSelectedCategories,
  onSearch,
  placeholder = "Search prompts...",
  toggleTooltip,
  hideCategories = false
}: SearchFiltersProps) {
  const [showModelBadges, setShowModelBadges] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [layout, setLayout] = useState<'card' | 'table'>('card') // Always start with card to prevent blocking

  // Load categories on mount (only when categories are shown) - optimized
  useEffect(() => {
    if (hideCategories) return
    
    const loadCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    
    // Defer category loading to prevent blocking initial render
    return deferToIdle(loadCategories, 1000)
  }, [hideCategories])

  // Restore layout preference after hydration
  useEffect(() => {
    const restoreLayout = () => {
      try {
        const pref = localStorage.getItem('layout-preference') as 'card' | 'table' | null
        if (pref === 'table') {
          setLayout('table')
        }
      } catch (error) {
        console.warn('Failed to restore layout preference:', error)
      }
    }
    
    return deferToIdle(restoreLayout, 500)
  }, [])
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery, selectedModels, selectedCategories)
  }, [searchQuery, selectedModels, selectedCategories, onSearch])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // Note: Search will be triggered by form submission or when user stops typing
    // This prevents too many rapid API calls
  }, [setSearchQuery])

  // Debounced search handler to prevent excessive filtering
  const debouncedSearch = useMemo(
    () => debounce((query: string, models: string[], categories: string[]) => {
      onSearch(query, models, categories)
    }, 300),
    [onSearch]
  )

  const handleModelToggle = useCallback((model: string) => {
    const newModels = selectedModels.includes(model)
      ? selectedModels.filter(m => m !== model)
      : [...selectedModels, model]
    setSelectedModels(newModels)
    // Use debounced search for filter changes
    debouncedSearch(searchQuery, newModels, selectedCategories)
  }, [selectedModels, setSelectedModels, searchQuery, selectedCategories, debouncedSearch])

  const handleCategoryToggle = useCallback((category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(newCategories)
    // Use debounced search for filter changes
    debouncedSearch(searchQuery, selectedModels, newCategories)
  }, [selectedCategories, setSelectedCategories, searchQuery, selectedModels, debouncedSearch])

  // Removed old toggle functions - now using handleModelToggle and handleCategoryToggle

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('')
    onSearch('', selectedModels, selectedCategories)
  }, [setSearchQuery, selectedModels, selectedCategories, onSearch])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedModels([])
    setSelectedCategories([])
    onSearch('', [], [])
  }, [setSearchQuery, setSelectedModels, setSelectedCategories, onSearch])

  // Note: Removed automatic search trigger to prevent infinite loops
  // Search is now only triggered by user interactions (form submission, filter changes)

  // Auto-show filter badges when there are selected models or categories
  useEffect(() => {
    if ((selectedModels?.length || 0) > 0 || (selectedCategories?.length || 0) > 0) {
      setShowModelBadges(true)
    }
  }, [selectedModels, selectedCategories])

  // Listen for external layout changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setLayout(e.detail.layout === 'table' ? 'table' : 'card')
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('layout-preference-change', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('layout-preference-change', handler as EventListener)
      }
    }
  }, [])

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        {/* Full-width Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            id="search-input"
            name="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="pl-10 pr-10 h-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearchQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Layout toggle (Card/List) */}
        <div className="flex items-center">
          <Tooltip content={toggleTooltip || (layout === 'table' ? 'Switch to card view' : 'Switch to list view')}>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 p-0 bg-card border"
              onClick={() => {
                if (typeof window === 'undefined') return
                const current = layout
                const next = current === 'card' ? 'table' : 'card'
                setLayout(next)
                localStorage.setItem('layout-preference', next)
                window.dispatchEvent(new CustomEvent('layout-preference-change', { detail: { layout: next } }))
              }}
              aria-label="Toggle layout"
              aria-pressed={layout === 'table'}
            >
              {/* Icon reflects current layout */}
              {layout === 'card' ? (
                <LayoutGrid className="h-5 w-5" />
              ) : (
                <List className="h-5 w-5" />
              )}
            </Button>
          </Tooltip>
        </div>

        {/* Icon-only 48x48 filter button with multi-select menu - HIDDEN FOR TESTING */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-10 w-10 p-0 bg-card border">
              <Filter className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {MODELS.filter(m => m !== 'All Models').map((model) => (
              <DropdownMenuCheckboxItem
                key={model}
                checked={selectedModels.includes(model)}
                onCheckedChange={() => toggleModel(model)}
              >
                {model}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Settings button to toggle filter badges visibility */}
        <Tooltip content={showModelBadges ? 'Hide filters' : 'Show filters'}>
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0 bg-card border relative"
            onClick={() => setShowModelBadges(!showModelBadges)}
          >
            <Settings2 className="h-5 w-5" />
            {/* Filter indicator dot - only show when filters are active and badges are hidden */}
            {((selectedModels?.length || 0) > 0 || (selectedCategories?.length || 0) > 0) && !showModelBadges && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
            )}
          </Button>
        </Tooltip>
      </form>

      {/* Combined Filter Badges */}
      {showModelBadges && (
        <div className="mt-3 space-y-4">
          {/* Models Section */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Models</div>
            <div className="flex flex-wrap items-center gap-2">
              {MODELS.filter(m => m !== 'All Models').map((model) => (
                <ModelBadge
                  key={model}
                  model={model as any}
                  variant="outline"
                  size="sm"
                  className={`cursor-pointer inline-flex items-center rounded-lg p-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:opacity-80 ${
                    selectedModels.includes(model) 
                      ? "bg-primary text-primary-foreground" 
                      : "border text-foreground bg-card"
                  }`}
                  onClick={() => handleModelToggle(model)}
                />
              ))}
            </div>
          </div>

          {/* Categories Section */}
          {!hideCategories && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Categories</div>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <CategoryBadge
                    key={category.slug}
                    category={category}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer inline-flex items-center rounded-lg p-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:opacity-80 ${
                      selectedCategories.includes(category.slug) 
                        ? "bg-primary text-primary-foreground" 
                        : "border text-foreground bg-card"
                    }`}
                    onClick={() => handleCategoryToggle(category.slug)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reset all button - only show when any filters are selected */}
          {((selectedModels?.length || 0) > 0 || (selectedCategories?.length || 0) > 0) && (
            <div className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Chips row with Clear - HIDDEN FOR TESTING
      {(selectedModels?.length || 0) > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {selectedModels.map(model => (
            <ModelBadge 
              key={model}
              model={model as any} 
              variant="outline" 
              size="sm"
              className="inline-flex items-center rounded-lg border p-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] text-foreground bg-card"
              showRemove={true}
              onRemove={() => toggleModel(model)}
            />
          ))}

          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
      )}
      */}
    </div>
  )
}
