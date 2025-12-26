'use client'

import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Complaint } from '@prisma/client'

interface ComplaintsListProps {
  complaints: Array<Complaint & {
    user: {
      name: string
      email: string
    }
  }>
}

export default function ComplaintsList({ complaints }: ComplaintsListProps) {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No complaints.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <Card key={complaint.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{complaint.title}</h3>
                <p className="text-sm text-gray-600">
                  By: {complaint.user.name} ({complaint.user.email})
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(complaint.createdAt), 'PPP')}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  complaint.status === 'RESOLVED'
                    ? 'bg-green-100 text-green-800'
                    : complaint.status === 'DISMISSED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <p className="text-gray-700">{complaint.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


