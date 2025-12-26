import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getAvailableTimeSlots, isTimeSlotAvailable } from '@/lib/utils'

async function getAvailableSlots(fieldId: string, date?: string) {
  if (!date) {
    return []
  }

  const bookingDate = new Date(date)
  const bookings = await prisma.booking.findMany({
    where: {
      fieldId,
      date: bookingDate,
      status: 'CONFIRMED',
    },
  })

  const slots = getAvailableTimeSlots()
  return slots.filter((slot) => {
    return isTimeSlotAvailable(slot, bookingDate, fieldId, bookings)
  }).slice(0, 3) // Show first 3 available slots
}

export async function FieldCard({ field, date }: { field: any; date?: string }) {
  const availableSlots = date ? await getAvailableSlots(field.id, date) : []

  // Get first image from media if available
  let imageSrc = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400"
  try {
    if (field.media) {
      const media = JSON.parse(field.media)
      const firstImage = Array.isArray(media) ? media.find((item: any) => item.type === 'image') : null
      if (firstImage) {
        imageSrc = firstImage.data
      }
    }
  } catch (e) {
    // Use default image if parsing fails
  }

  return (
    <Link href={`/fields/${field.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
              {imageSrc.startsWith('data:') ? (
                <img
                  src={imageSrc}
                  alt={field.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt={field.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{field.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(field.ratingAvg)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {field.ratingAvg.toFixed(1)} ({field.ratingCount})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {field.size && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Size: {field.size}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(field.pricePerHour)}
                  </p>
                  {availableSlots.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {availableSlots.map((slot) => (
                        <span
                          key={slot}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs h-8"
                        >
                          {slot} / hr
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

