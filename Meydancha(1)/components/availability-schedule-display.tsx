'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function AvailabilityScheduleDisplay({ schedule }: { schedule?: string | null }) {
  if (!schedule) {
    return null
  }

  let parsedSchedule: Record<string, { open: string; close: string; enabled: boolean }> = {}
  try {
    parsedSchedule = JSON.parse(schedule)
  } catch {
    return null
  }

  const enabledDays = Object.entries(parsedSchedule).filter(([_, data]) => data?.enabled)

  if (enabledDays.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {DAYS.map((day, index) => {
            const dayKey = day.toLowerCase()
            const dayData = parsedSchedule[dayKey]
            if (!dayData?.enabled) return null

            return (
              <div key={day} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-medium">{day}</span>
                <span className="text-muted-foreground">
                  {dayData.open} - {dayData.close}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


