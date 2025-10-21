'use client'

import { usePathname } from 'next/navigation'
import MainLayoutWrapper from './main-layout-wrapper'

interface ConditionalLayoutWrapperProps {
  children: React.ReactNode
}

export default function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname()
  
  // If it's an admin route, render children directly without main app layout
  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  
  // For all other routes, use the main layout wrapper
  return <MainLayoutWrapper>{children}</MainLayoutWrapper>
}
