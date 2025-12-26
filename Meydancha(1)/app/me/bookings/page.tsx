import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import BookingsList from '@/components/bookings-list'

export default async function MyBookingsPage() {
  const session = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.id,
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

  // Get user's reviews for the fields in bookings
  const fieldIds = bookings.map(b => b.field.id)
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.id,
      fieldId: {
        in: fieldIds,
      },
    },
    select: {
      fieldId: true,
      rating: true,
      comment: true,
    },
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </a>
          <div className="flex gap-4">
            <a href="/fields">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Browse Fields</button>
            </a>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <BookingsList bookings={bookings} reviews={reviews} />
      </div>
    </div>
  )
}


