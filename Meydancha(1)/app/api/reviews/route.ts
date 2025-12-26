import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { reviewSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only players can leave reviews
    if (session.role !== 'PLAYER') {
      return NextResponse.json(
        { error: 'Only players can leave reviews' },
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
    
    const { fieldId, ...reviewData } = body
    const validatedData = reviewSchema.parse(reviewData)

    if (!fieldId) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      )
    }

    // Check if user has a confirmed booking for this field
    const hasBooking = await prisma.booking.findFirst({
      where: {
        fieldId,
        userId: session.id,
        status: 'CONFIRMED',
      },
    })

    if (!hasBooking) {
      return NextResponse.json(
        { error: 'You must have a confirmed booking to leave a review' },
        { status: 403 }
      )
    }

    // Check if user already reviewed this field
    const existingReview = await prisma.review.findUnique({
      where: {
        fieldId_userId: {
          fieldId,
          userId: session.id,
        },
      },
    })

    let review
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: validatedData,
      })
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          fieldId,
          userId: session.id,
          ...validatedData,
        },
      })
    }

    // Update field rating
    const reviews = await prisma.review.findMany({
      where: { fieldId },
      select: { rating: true },
    })

    const ratingAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.field.update({
      where: { id: fieldId },
      data: {
        ratingAvg,
        ratingCount: reviews.length,
      },
    })

    return NextResponse.json(review)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already reviewed this field' },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
