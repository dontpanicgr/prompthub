'use client'

interface MainLayoutProps {
  children: React.ReactNode
}

// Pass-through layout: the global `MainLayoutWrapper` already renders the
// fixed sidebar, headers, drawers, banners, and the centered container.
// Keeping this component minimal prevents duplicate sidebars inside <main>.
export default function MainLayout({ children }: MainLayoutProps) {
  return <>{children}</>
}
