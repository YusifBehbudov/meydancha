'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatPrice, getAvailableTimeSlots, filterPastTimeSlots, isBookingTimeInPast } from '@/lib/utils'
import { format } from 'date-fns'
import { createBooking } from '@/app/actions/booking'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export function BookingPanel({
  field,
  selectedDate,
  fromTime,
  toTime,
  onFromTimeChange,
  onToTimeChange,
  totalPrice,
}: {
  field: any
  selectedDate: Date
  fromTime: string
  toTime: string
  onFromTimeChange: (time: string) => void
  onToTimeChange: (time: string) => void
  totalPrice: number
}) {
  const { toast } = useToast()
  const router = useRouter()
  const allSlots = getAvailableTimeSlots()
  // Filter out past time slots for today
  const slots = filterPastTimeSlots(allSlots, selectedDate)

  const handleBook = async () => {
    if (!fromTime || !toTime) {
      toast({
        title: 'Error',
        description: 'Please select both start and end times',
        variant: 'destructive',
      })
      return
    }

    if (fromTime >= toTime) {
      toast({
        title: 'Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      })
      return
    }

    // Check if booking time is in the past (client-side validation)
    if (isBookingTimeInPast(selectedDate, fromTime)) {
      toast({
        title: 'Error',
        description: 'Cannot book a time slot in the past. Please select a future date and time.',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await createBooking({
        fieldId: field.id,
        date: selectedDate.toISOString(),
        startTime: fromTime,
        endTime: toTime,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Booking confirmed!',
        })
        router.push('/me/bookings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Select Date
          <ArrowRight className="h-4 w-4 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">From</label>
            <Select value={fromTime} onValueChange={onFromTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">To</label>
            <Select value={toTime} onValueChange={onToTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {slots
                  .filter((slot) => !fromTime || slot > fromTime)
                  .map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {totalPrice > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                {totalPrice.toFixed(0)} AZN
              </span>
            </div>
          </div>
        )}
        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={!fromTime || !toTime}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  )
}


