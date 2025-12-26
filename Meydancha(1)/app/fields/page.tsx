import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import FieldsList from '@/components/fields-list'
import FieldsFilters from '@/components/fields-filters'
import { FieldsHeader } from '@/components/fields-header'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Force dynamic rendering to ensure searchParams updates trigger re-renders
export const dynamic = 'force-dynamic'

interface SearchParams {
  sportType?: string
  city?: string
  date?: string
  time?: string
  sortBy?: string
  tapAndPlay?: string
}

export default async function FieldsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams
}) {
  // Check user session and role
  let session = null
  try {
    session = await getSession()
  } catch (error) {
    // Session not available, continue
  }

  // OWNER should only see their own fields - redirect to owner fields page
  if (session?.role === 'OWNER') {
    redirect('/owner/fields')
  }

  // Handle searchParams as Promise (Next.js 15) or object (Next.js 14)
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  
  const sportType = params.sportType
  const city = params.city
  const date = params.date
  const time = params.time
  const sortBy = params.sortBy || 'price-low'
  const tapAndPlay = params.tapAndPlay === 'true'

  // Build where clause
  // PLAYER and ADMIN can see all fields, but only PLAYER can book
  const where: any = {}
  if (sportType && sportType.trim()) {
    where.sportType = sportType.trim()
  }
  if (city && city.trim()) {
    where.city = city.trim()
  }

  // Get fields (all fields for PLAYER and ADMIN)
  let fields = await prisma.field.findMany({
    where,
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  })

  // Filter by date/time availability if provided
  if (date || time || tapAndPlay) {
    const targetDate = date ? new Date(date) : new Date()
    const targetDateStart = new Date(targetDate)
    targetDateStart.setHours(0, 0, 0, 0)
    const targetDateEnd = new Date(targetDate)
    targetDateEnd.setHours(23, 59, 59, 999)
    const targetTime = time || (tapAndPlay ? new Date().toTimeString().slice(0, 5) : null)
    
    if (targetTime || tapAndPlay) {
      const bookings = await prisma.booking.findMany({
        where: {
          date: {
            gte: targetDateStart,
            lte: targetDateEnd,
          },
          status: 'CONFIRMED',
        },
        select: {
          fieldId: true,
          startTime: true,
          endTime: true,
        },
      })

      // Filter fields that are available
      fields = fields.filter(field => {
        const fieldBookings = bookings.filter(b => b.fieldId === field.id)
        
        if (tapAndPlay) {
          // Check if available now or in next 2 hours
          const now = new Date()
          const currentHour = now.getHours()
          const next2Hours = Array.from({ length: 3 }, (_, i) => {
            const hour = currentHour + i
            return hour < 24 ? hour : hour - 24
          })
          
          return next2Hours.some(hour => {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`
            return !fieldBookings.some(booking => {
              const start = parseInt(booking.startTime.split(':')[0])
              const end = parseInt(booking.endTime.split(':')[0])
              const slotHour = parseInt(timeSlot.split(':')[0])
              return slotHour >= start && slotHour < end
            })
          })
        }
        
        if (targetTime) {
          const slotHour = parseInt(targetTime.split(':')[0])
          return !fieldBookings.some(booking => {
            const start = parseInt(booking.startTime.split(':')[0])
            const end = parseInt(booking.endTime.split(':')[0])
            return slotHour >= start && slotHour < end
          })
        }
        
        return true
      })
    }
  }

  // Sort fields
  if (sortBy === 'price-low') {
    fields.sort((a, b) => a.pricePerHour - b.pricePerHour)
  } else if (sortBy === 'price-high') {
    fields.sort((a, b) => b.pricePerHour - a.pricePerHour)
  } else if (sortBy === 'rating') {
    fields.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0))
  } else {
    // Default: price low to high
    fields.sort((a, b) => a.pricePerHour - b.pricePerHour)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </a>
          <div className="flex gap-4">
            <Suspense fallback={<div>Loading...</div>}>
              <FieldsHeader />
            </Suspense>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Field Listings</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div>Loading filters...</div>}>
              <FieldsFilters
                initialSportType={sportType}
                initialCity={city}
                initialDate={date}
                initialTime={time}
                tapAndPlay={tapAndPlay}
              />
            </Suspense>
          </aside>

          {/* Fields List */}
          <main className="flex-1">
            <Suspense fallback={<div>Loading fields...</div>}>
              <FieldsList fields={fields} sortBy={sortBy} session={session} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

