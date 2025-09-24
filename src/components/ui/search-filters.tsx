'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  selectedModel: string
  setSelectedModel: (model: string) => void
  onSearch: (query: string, model: string) => void
  placeholder?: string
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedModel,
  setSelectedModel,
  onSearch,
  placeholder = "Search prompts..."
}: SearchFiltersProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery, selectedModel)
  }

  const handleModelSelect = (model: string) => {
    setSelectedModel(model)
    onSearch(searchQuery, model)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedModel('All Models')
    onSearch('', 'All Models')
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-3 items-start">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Model Filter Select */}
        <Select value={selectedModel} onValueChange={handleModelSelect}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {(searchQuery || selectedModel !== 'All Models') && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </form>

      {/* Active Filters Display */}
      {(searchQuery || selectedModel !== 'All Models') && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('')
                  onSearch('', selectedModel)
                }}
                className="ml-1 hover:text-primary-foreground"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedModel !== 'All Models' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
              Model: {selectedModel}
              <button
                onClick={() => {
                  setSelectedModel('All Models')
                  onSearch(searchQuery, 'All Models')
                }}
                className="ml-1 hover:text-green-600 dark:hover:text-green-200"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
