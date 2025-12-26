'use server'

import { bookingSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { calculateTotalPrice, isBookingTimeInPast, isWithinWorkingHours } from '@/lib/utils'

export async function createBooking(data: {
  fieldId: string
  date: string | Date
  startTime: string
  endTime: string
}) {
  try {
    const session = await requireAuth()
    
    // Only PLAYER role can create bookings
    if (session.role !== 'PLAYER') {
      return {
        error: session.role === 'OWNER' 
          ? 'Owners cannot book fields. Please use the owner dashboard to manage your fields.'
          : 'Admins cannot book fields.',
      }
    }
    
    // Validate input
    const validatedData = bookingSchema.parse(data)

    // Get field
    const field = await prisma.field.findUnique({
      where: { id: validatedData.fieldId },
    })

    if (!field) {
      return {
        error: 'Field not found',
      }
    }

    // Convert date to Date object and normalize to start of day
    const bookingDate = new Date(validatedData.date)
    bookingDate.setHours(0, 0, 0, 0)

    // Check if booking time is in the past (Baku timezone)
    if (isBookingTimeInPast(bookingDate, validatedData.startTime)) {
      return {
        error: 'Cannot book a time slot in the past. Please select a future date and time.',
      }
    }

    // Check if booking is within field's working hours
    if (!isWithinWorkingHours(bookingDate, validatedData.startTime, validatedData.endTime, field.workingHours)) {
      return {
        error: 'Booking time is outside field working hours. Please select a time within the field\'s operating hours.',
      }
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        fieldId: validatedData.fieldId,
        date: bookingDate,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } },
            ],
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return {
        error: 'Time slot is already booked',
      }
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(
      field.pricePerHour,
      validatedData.startTime,
      validatedData.endTime
    )

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        fieldId: validatedData.fieldId,
        userId: session.id,
        date: bookingDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        totalPrice,
        status: 'CONFIRMED',
      },
    })

    return {
      success: true,
      booking,
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return {
        error: 'Unauthorized',
      }
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        error: 'Invalid input: ' + error.errors.map((e: any) => e.message).join(', '),
      }
    }
    console.error('Booking error:', error)
    return {
      error: error?.message || 'Failed to create booking',
    }
  }
}

