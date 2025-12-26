import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import FieldDetail from '@/components/field-detail'
import { getSession } from '@/lib/session'

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const field = await prisma.field.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!field) {
    notFound()
  }

  let session = null
  try {
    session = await getSession()
  } catch (error) {
    // Session not available, continue with null
    session = null
  }

  // OWNER can only view their own fields - redirect others to owner fields page
  if (session?.role === 'OWNER' && field.ownerId !== session.id) {
    redirect('/owner/fields')
  }

  // Get bookings for today and next 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const bookings = await prisma.booking.findMany({
    where: {
      fieldId: id,
      date: {
        gte: today,
        lte: nextWeek,
      },
      status: 'CONFIRMED',
    },
    select: {
      date: true,
      startTime: true,
      endTime: true,
    },
  })

  // Get user's existing review for this field (if logged in)
  let userReview = null
  if (session?.role === 'PLAYER') {
    userReview = await prisma.review.findUnique({
      where: {
        fieldId_userId: {
          fieldId: id,
          userId: session.id,
        },
      },
      select: {
        rating: true,
        comment: true,
      },
    })
  }

  // Check if user has a past confirmed booking (can review)
  let canReview = false
  if (session?.role === 'PLAYER') {
    const now = new Date()
    const pastBooking = await prisma.booking.findFirst({
      where: {
        fieldId: id,
        userId: session.id,
        status: 'CONFIRMED',
      },
    })
    
    if (pastBooking) {
      const bookingDateTime = new Date(pastBooking.date)
      const [hours, minutes] = pastBooking.startTime.split(':').map(Number)
      bookingDateTime.setHours(hours, minutes, 0, 0)
      canReview = bookingDateTime < now
    }
  }

  return (
    <FieldDetail
      field={field}
      bookings={bookings}
      session={session}
      userReview={userReview}
      canReview={canReview}
    />
  )
}

