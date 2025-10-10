'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SearchBar() {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', query)
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            id="search-bar-input"
            name="search"
            placeholder="Search prompts by title or model..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-24"
          />
        </div>
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          Search
        </Button>
      </form>

      {/* Filter options */}
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" className="rounded-full">
          All Models
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          GPT
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Claude
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Gemini
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Grok
        </Button>
      </div>
    </div>
  )
}
