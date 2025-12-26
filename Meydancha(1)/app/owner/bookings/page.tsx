import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import OwnerBookingsList from '@/components/owner/bookings-list'

export default async function OwnerBookingsPage() {
  const session = await requireRole('OWNER')

  const fields = await prisma.field.findMany({
    where: {
      ownerId: session.id,
    },
    select: {
      id: true,
    },
  })

  const fieldIds = fields.map(f => f.id)

  const bookings = await prisma.booking.findMany({
    where: {
      fieldId: {
        in: fieldIds,
      },
    },
    include: {
      field: {
        select: {
          id: true,
          name: true,
          sportType: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
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
            <a href="/owner/fields">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">My Fields</button>
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
        <h1 className="text-3xl font-bold mb-8">Bookings</h1>
        <OwnerBookingsList bookings={bookings} />
      </div>
    </div>
  )
}


