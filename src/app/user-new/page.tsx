'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import SearchFilters from '@/components/ui/search-filters'
import PromptGrid from '@/components/prompts/prompt-grid'
import { Button } from '@/components/ui/button'
import { FloatingMenu } from '@/components/ui/dropdown-menu'
import { MoreVertical, Share2, Link as LinkIcon, Flag } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function UserNewTestPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setLayoutPref(e.detail.layout === 'table' ? 'table' : 'card')
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

  const handleSearch = (query: string, models: string[], categories: string[]) => {
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Custom header replacing user title */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Avatar + details */}
            <div className="flex items-start gap-4">
              <div className="rounded-[20px] bg-muted flex items-center justify-center text-muted-foreground w-14 h-16 text-xl shrink-0">
                <span className="font-semibold">P</span>
              </div>
              <div>
                <h1 className="mb-2 text-xl lg:text-2xl">Publika _</h1>
                <p className="text-sm text-muted-foreground mb-2">
                  I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary.
                </p>
                <a href="https://prompthub.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">https://prompthub.com</a>
              </div>
            </div>
            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Messaging is coming soon</DialogTitle>
                    <DialogDescription>
                      We&apos;re building in-app messaging so you can contact creators directly. Reserve your seat for the beta to get early access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center text-center gap-4">
                    <img src="/globe.svg" alt="Coming soon" className="w-24 h-24 opacity-80" />
                    <Button className="mt-2">Reserve your seat for beta</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <FloatingMenu
                align="end"
                trigger={
                  <Button variant="outline" size="icon" aria-label="More actions">
                    <MoreVertical />
                  </Button>
                }
                items={[
                  { label: 'Share', icon: <Share2 /> },
                  { label: 'Copy Link', icon: <LinkIcon /> },
                  { label: 'separator', separator: true },
                  { label: 'Report', variant: 'destructive', icon: <Flag /> },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onSearch={handleSearch}
            placeholder="Search prompts..."
          />
        </div>

        {/* Prompts grid - 4 columns */}
        <div>
          <PromptGrid maxColumns={4} />
        </div>
      </div>
    </MainLayout>
  )
}


