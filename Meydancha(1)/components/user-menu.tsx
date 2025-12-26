'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'
import { useToast } from '@/hooks/use-toast'

export function UserMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = () => {
    setLoading(true)
    fetch('/api/auth/me', {
      credentials: 'include', // Important: include cookies
      cache: 'no-store', // Don't cache the request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setUser(null)
      })
  }

  useEffect(() => {
    fetchUser()
  }, [pathname])

  // Also refresh when the page becomes visible (user might have logged in in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <>
        <Button variant="ghost" asChild>
          <a href="/login">Login</a>
        </Button>
        <Button asChild>
          <a href="/register">Sign up</a>
        </Button>
      </>
    )
  }

  const getRoleLinks = () => {
    switch (user.role) {
      case 'OWNER':
        return (
          <Button variant="ghost" asChild>
            <a href="/owner/fields">My Fields</a>
          </Button>
        )
      case 'PLAYER':
        return (
          <>
            <Button variant="ghost" asChild>
              <a href="/fields">Fields</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/me/bookings">My Bookings</a>
            </Button>
          </>
        )
      case 'ADMIN':
        return (
          <>
            <Button variant="ghost" asChild>
              <a href="/fields">Fields</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/admin/users">Users</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/admin/approvals">Approvals</a>
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-4">
      {getRoleLinks()}
      <span className="text-sm text-muted-foreground">
        {user.name || user.email} ({user.role})
      </span>
      <Button variant="ghost" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}

