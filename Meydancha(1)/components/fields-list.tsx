'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Field } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface FieldsListProps {
  fields: (Field & {
    owner: {
      name: string
    }
  })[]
  sortBy: string
  session?: {
    id: string
    email: string
    name: string
    role: string
  } | null
}

export default function FieldsList({ fields, sortBy: initialSortBy, session }: FieldsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null)
  const [fieldsList, setFieldsList] = useState(fields)

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    // Force a full page reload to ensure server component re-renders with new sortBy
    window.location.href = `/fields?${params.toString()}`
  }

  const handleDeleteField = async (fieldId: string) => {
    setDeletingFieldId(fieldId)
    try {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete field')
      }

      toast({
        title: 'Success',
        description: 'Field deleted successfully',
      })

      // Remove field from local state
      setFieldsList(prevFields => prevFields.filter(f => f.id !== fieldId))
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete field',
        variant: 'destructive',
      })
    } finally {
      setDeletingFieldId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Sort By */}
      <div className="flex justify-end">
        <Select value={initialSortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price Low to High</SelectItem>
            <SelectItem value="price-high">Price High to Low</SelectItem>
            <SelectItem value="rating">Rating High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fields Grid */}
      <div className="space-y-4">
        {fieldsList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No fields found matching your criteria.
          </div>
        ) : (
          fieldsList.map((field) => (
            <Card key={field.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Field Image */}
                  <Link href={`/fields/${field.id}`} className="w-32 h-32 bg-green-200 rounded-lg flex-shrink-0"></Link>
                  
                  {/* Field Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Link href={`/fields/${field.id}`}>
                        <h3 className="text-xl font-semibold hover:text-primary">{field.name}</h3>
                      </Link>
                      {/* Delete Button for Admin */}
                      {session?.role === 'ADMIN' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingFieldId === field.id}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingFieldId === field.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the field <strong>{field.name}</strong>.
                                This action cannot be undone. All associated bookings and reviews will also be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteField(field.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {field.ratingAvg.toFixed(1)} ({field.ratingCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{field.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(field.pricePerHour)} / hr
                      </div>
                      
                      {/* Available Time Slots */}
                      <div className="flex gap-2">
                        {['18:00', '19:00', '20:00'].map((slot) => (
                          <Button
                            key={slot}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            {slot} / hr
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

