import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { bookingSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { calculateTotalPrice, isBookingTimeInPast, isWithinWorkingHours } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only PLAYER role can create bookings
    if (session.role !== 'PLAYER') {
      return NextResponse.json(
        { error: session.role === 'OWNER' 
          ? 'Owners cannot book fields. Please use the owner dashboard to manage your fields.'
          : 'Admins cannot book fields.'
        },
        { status: 403 }
      )
    }
    
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }
    
    // Validate and transform date if it's a string
    let validatedData
    try {
      validatedData = bookingSchema.parse(body)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input: ' + error.errors.map((e: any) => e.message).join(', ') },
          { status: 400 }
        )
      }
      throw error
    }

    // Get field
    const field = await prisma.field.findUnique({
      where: { id: validatedData.fieldId },
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    // Convert date to Date object and normalize to start of day
    const bookingDate = validatedData.date instanceof Date 
      ? new Date(validatedData.date)
      : new Date(validatedData.date)
    bookingDate.setHours(0, 0, 0, 0)

    // Check if booking time is in the past (Baku timezone)
    if (isBookingTimeInPast(bookingDate, validatedData.startTime)) {
      return NextResponse.json(
        { error: 'Cannot book a time slot in the past. Please select a future date and time.' },
        { status: 400 }
      )
    }

    // Check if booking is within field's working hours
    if (!isWithinWorkingHours(bookingDate, validatedData.startTime, validatedData.endTime, field.workingHours)) {
      return NextResponse.json(
        { error: 'Booking time is outside field working hours. Please select a time within the field\'s operating hours.' },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      )
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

    return NextResponse.json(booking)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any
      const errorMessages = zodError.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Invalid input'
      return NextResponse.json(
        { error: errorMessages },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // Only allow users to see their own bookings unless admin
    const targetUserId = session.role === 'ADMIN' && userId ? userId : session.id

    const bookings = await prisma.booking.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            sportType: true,
            city: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


