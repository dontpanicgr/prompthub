import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trending Prompts'
}

export default function TrendingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}


