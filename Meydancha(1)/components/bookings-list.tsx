'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, canCancelBooking } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, X, Star } from 'lucide-react'
import { Booking } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ReviewForm } from '@/components/review-form'

interface BookingsListProps {
  bookings: Array<Booking & {
    field: {
      id: string
      name: string
      sportType: string
      city: string
    }
  }>
  reviews?: Array<{
    fieldId: string
    rating: number
    comment: string | null
  }>
}

export default function BookingsList({ bookings, reviews = [] }: BookingsListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Check if booking is in the past (can be reviewed)
  const isBookingPast = (bookingDate: Date, bookingTime: string) => {
    const now = new Date()
    const bookingDateTime = new Date(bookingDate)
    const [hours, minutes] = bookingTime.split(':').map(Number)
    bookingDateTime.setHours(hours, minutes, 0, 0)
    return bookingDateTime < now
  }

  // Get existing review for a field
  const getExistingReview = (fieldId: string) => {
    return reviews.find(r => r.fieldId === fieldId) || null
  }

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel booking')
      }

      toast({
        title: 'Success',
        description: 'Booking cancelled successfully',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel booking',
        variant: 'destructive',
      })
    } finally {
      setCancellingId(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        You don't have any bookings yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const bookingDate = new Date(booking.date)
        const canCancel = booking.status === 'CONFIRMED' && canCancelBooking(bookingDate, booking.startTime)
        const isCancelling = cancellingId === booking.id
        const isPast = booking.status === 'CONFIRMED' && isBookingPast(bookingDate, booking.startTime)
        const existingReview = isPast ? getExistingReview(booking.field.id) : null

        return (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{booking.field.name}</h3>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(bookingDate, 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="capitalize">{booking.field.sportType} - {booking.field.city}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(booking.totalPrice)}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                  
                  {/* Review Button - Show for past confirmed bookings */}
                  {isPast && (
                    <ReviewForm
                      fieldId={booking.field.id}
                      fieldName={booking.field.name}
                      existingReview={existingReview}
                      onSuccess={() => router.refresh()}
                      trigger={
                        <Button variant="default" size="sm" className="mt-2">
                          <Star className="h-4 w-4 mr-2" />
                          {existingReview ? 'Edit Review' : 'Leave Review'}
                        </Button>
                      }
                    />
                  )}
                  
                  {/* Cancel Button */}
                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      disabled={isCancelling}
                      className="mt-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}
                  
                  {booking.status === 'CONFIRMED' && !canCancel && !isPast && (
                    <p className="text-xs text-muted-foreground mt-2 max-w-[150px] text-center">
                      Cannot cancel. Must cancel at least 4 hours before booking time.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


