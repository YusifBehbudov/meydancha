import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { canCancelBooking } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        field: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking (or is admin)
    if (booking.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: You can only cancel your own bookings' },
        { status: 403 }
      )
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    // Check if cancellation is allowed (at least 4 hours before booking time)
    if (!canCancelBooking(booking.date, booking.startTime)) {
      return NextResponse.json(
        { error: 'Cannot cancel booking. Cancellation must be at least 4 hours before the booking time.' },
        { status: 400 }
      )
    }

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

