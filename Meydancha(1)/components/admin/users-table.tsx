'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from '@prisma/client'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface UsersTableProps {
  users: User[]
  currentAdminId?: string
}

interface UserWithVerification extends User {
  idVerificationPhoto?: string | null
  idVerificationStatus?: string | null
}

export default function UsersTable({ users: initialUsers, currentAdminId }: UsersTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [users, setUsers] = useState<UserWithVerification[]>(initialUsers as UserWithVerification[])
  const [openDialogId, setOpenDialogId] = useState<string | null>(null)

  // Sync users state with prop updates
  useEffect(() => {
    setUsers(initialUsers as UserWithVerification[])
  }, [initialUsers])

  const handleApproval = async (userId: string, approved: boolean) => {
    setLoading(userId)
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, approved }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update approval status')
      }

      toast({
        title: 'Success',
        description: result.message || (approved ? 'User approved' : 'User approval revoked'),
      })

      // Update local state
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, approved: result.user.approved } : u
      ))
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update approval status',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleIdVerification = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    setLoading(userId)
    try {
      const response = await fetch('/api/admin/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update ID verification status')
      }

      toast({
        title: 'Success',
        description: result.message || `ID verification ${status.toLowerCase()}`,
      })

      // Update local state immediately
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, idVerificationStatus: status } : u
      ))
      
      // Close dialog after successful verification (small delay for UX)
      setTimeout(() => {
        setOpenDialogId(null)
      }, 500)
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update ID verification status',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setLoading(userId)
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      toast({
        title: 'Success',
        description: result.message || 'User deleted successfully',
      })

      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                    {user.role.toLowerCase()}
                  </span>
                  {user.role === 'OWNER' && (
                    <>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (user as UserWithVerification).idVerificationStatus === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : (user as UserWithVerification).idVerificationStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        ID: {(user as UserWithVerification).idVerificationStatus || 'PENDING'}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {format(new Date(user.createdAt), 'PPP')}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4 items-end">
                {/* Delete User Button - Show for all users except current admin */}
                {currentAdminId && user.id !== currentAdminId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={loading === user.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {loading === user.id ? 'Deleting...' : 'Delete User'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the user account for <strong>{user.name}</strong> ({user.email}).
                          This action cannot be undone. All associated fields, bookings, and reviews will also be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {user.role === 'OWNER' && (
                  <div className="flex flex-col gap-2 items-end">
                    {/* ID Verification Section */}
                    {(user as UserWithVerification).idVerificationPhoto && (
                      <div className="flex flex-col gap-2 items-end">
                      <Dialog open={openDialogId === user.id} onOpenChange={(open) => setOpenDialogId(open ? user.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View ID Photo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>ID Verification Photo - {user.name}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <img
                              src={(user as UserWithVerification).idVerificationPhoto || ''}
                              alt="ID Verification"
                              className="w-full rounded-lg border"
                            />
                          </div>
                          <div className="flex gap-2 mt-4 items-center flex-wrap">
                            {(() => {
                              const status = (user as UserWithVerification).idVerificationStatus || 'PENDING'
                              
                              if (status === 'APPROVED') {
                                return (
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-green-600 font-medium">ID Verified ✓</p>
                                    <Button
                                      onClick={async () => {
                                        await handleIdVerification(user.id, 'REJECTED')
                                      }}
                                      disabled={loading === user.id}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {loading === user.id ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                  </div>
                                )
                              }
                              
                              if (status === 'REJECTED') {
                                return (
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-red-600 font-medium">ID Rejected ✗</p>
                                    <Button
                                      onClick={async () => {
                                        await handleIdVerification(user.id, 'APPROVED')
                                      }}
                                      disabled={loading === user.id}
                                      className="bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {loading === user.id ? 'Approving...' : 'Approve'}
                                    </Button>
                                  </div>
                                )
                              }
                              
                              // PENDING or null/undefined - show both buttons
                              return (
                                <>
                                  <Button
                                    onClick={async () => {
                                      await handleIdVerification(user.id, 'APPROVED')
                                    }}
                                    disabled={loading === user.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {loading === user.id ? 'Approving...' : 'Approve ID'}
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      await handleIdVerification(user.id, 'REJECTED')
                                    }}
                                    disabled={loading === user.id}
                                    variant="destructive"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {loading === user.id ? 'Rejecting...' : 'Reject ID'}
                                  </Button>
                                </>
                              )
                            })()}
                          </div>
                        </DialogContent>
                      </Dialog>
                      </div>
                    )}
                    
                    {/* Account Approval Section */}
                    <div className="flex gap-2">
                      {!user.approved ? (
                        <Button
                          onClick={() => handleApproval(user.id, true)}
                          disabled={loading === user.id || (user as UserWithVerification).idVerificationStatus !== 'APPROVED'}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          title={(user as UserWithVerification).idVerificationStatus !== 'APPROVED' ? 'ID must be verified first' : ''}
                        >
                          {loading === user.id ? 'Approving...' : 'Approve Account'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApproval(user.id, false)}
                          disabled={loading === user.id}
                          size="sm"
                          variant="outline"
                        >
                          {loading === user.id ? 'Revoking...' : 'Revoke Approval'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


