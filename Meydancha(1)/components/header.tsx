'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { UserMenu } from '@/components/user-menu'

export function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')
  const [user, setUser] = useState<{ role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        setUser(null)
      })
  }, [])

  if (isAuthPage) return null

  // Only show Fields link for PLAYER and ADMIN, not for OWNER
  const showFieldsLink = !user || (user.role !== 'OWNER')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">MEYDANCHA</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {showFieldsLink && (
            <Link href="/fields">
              <Button variant="ghost">Fields</Button>
            </Link>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}

