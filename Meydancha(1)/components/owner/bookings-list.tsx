'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar, Clock, User } from 'lucide-react'
import { Booking } from '@prisma/client'

interface OwnerBookingsListProps {
  bookings: Array<Booking & {
    field: {
      id: string
      name: string
      sportType: string
    }
    user: {
      name: string
      email: string
    }
  }>
}

export default function OwnerBookingsList({ bookings }: OwnerBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No bookings yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{booking.field.name}</h3>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{booking.user.name} ({booking.user.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(booking.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-2">
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


