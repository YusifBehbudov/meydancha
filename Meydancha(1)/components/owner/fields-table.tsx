'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Star } from 'lucide-react'
import { Field } from '@prisma/client'

interface FieldsTableProps {
  fields: Array<Field & {
    _count: {
      bookings: number
    }
  }>
}

export default function FieldsTable({ fields }: FieldsTableProps) {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        You don't have any fields yet. Create your first field!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <Card key={field.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold">{field.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                    {field.sportType}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {field.ratingAvg.toFixed(1)} ({field.ratingCount})
                    </span>
                  </div>
                  <span>{field.city}</span>
                  <span>{field._count.bookings} bookings</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(field.pricePerHour)} / hr
                  </div>
                </div>
                <Link href={`/owner/fields/${field.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

