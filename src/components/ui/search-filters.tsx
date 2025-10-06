'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ModelBadge } from '@/components/ui/model-badge'

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
  onSearch: (query: string, models: string[]) => void
  placeholder?: string
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedModels,
  setSelectedModels,
  onSearch,
  placeholder = "Search prompts..."
}: SearchFiltersProps) {
  const [showModelBadges, setShowModelBadges] = useState(false)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery, selectedModels)
  }

  const toggleModel = (model: string) => {
    const next = selectedModels.includes(model)
      ? selectedModels.filter(m => m !== model)
      : [...selectedModels, model]
    setSelectedModels(next)
    onSearch(searchQuery, next)
  }

  const clearSearchQuery = () => {
    setSearchQuery('')
    onSearch('', selectedModels)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedModels([])
    onSearch('', [])
  }

  // Trigger search when search query changes
  useEffect(() => {
    onSearch(searchQuery, selectedModels)
  }, [searchQuery, selectedModels, onSearch])

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        {/* Full-width Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 bg-card border"
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

        {/* Settings button to toggle model badges visibility */}
        <Button 
          type="button" 
          variant="outline" 
          className="h-10 w-10 p-0 bg-card border relative"
          onClick={() => setShowModelBadges(!showModelBadges)}
        >
          <Settings2 className="h-5 w-5" />
          {/* Filter indicator dot - only show when filters are active and badges are hidden */}
          {selectedModels.length > 0 && !showModelBadges && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </form>

      {/* Model Badges Filters */}
      {showModelBadges && (
        <div className="mt-3">
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
                onClick={() => toggleModel(model)}
              />
            ))}

            {/* Reset all button - only show when models are selected */}
            {selectedModels.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Reset all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chips row with Clear - HIDDEN FOR TESTING
      {selectedModels.length > 0 && (
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
