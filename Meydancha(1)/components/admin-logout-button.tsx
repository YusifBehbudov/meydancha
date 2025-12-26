'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function AdminLogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      className="px-4 py-2 text-gray-700 hover:text-gray-900"
    >
      Logout
    </Button>
  )
}

