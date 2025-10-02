import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface PageMenuItem {
  id: string
  label: string
  icon: LucideIcon
}

interface PageMenuProps {
  items: PageMenuItem[]
  activeItem: string
  onItemClick: (itemId: string) => void
}

export function PageMenu({ items, activeItem, onItemClick }: PageMenuProps) {
  return (
    <div className="lg:col-span-1">
      <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl">
        <div data-slot="card-content" className="p-0">
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-card text-active-foreground'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
