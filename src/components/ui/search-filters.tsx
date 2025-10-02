'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ModelBadge } from '@/components/ui/model-badge'

const MODELS = [
  'All Models',
  'ChatGPT',
  'Claude',
  'Gemini',
  'Grok',
  'Perplexity',
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

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedModels([])
    onSearch('', [])
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        {/* Full-width Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-card border"
          />
        </div>

        {/* Icon-only 48x48 filter button with multi-select menu */}
        <DropdownMenu>
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
        </DropdownMenu>
      </form>

      {/* Chips row with Clear */}
      {(searchQuery || selectedModels.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {searchQuery && (
            <div className="inline-flex items-center rounded-lg border p-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] text-foreground bg-card h-8">
              <span className="mr-1">Search: "{searchQuery}"</span>
              <button
                onClick={() => {
                  setSearchQuery('')
                  onSearch('', selectedModels)
                }}
                aria-label="Clear search"
                className="inline-flex items-center rounded-full hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
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

          {/* Clear all in same row */}
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
