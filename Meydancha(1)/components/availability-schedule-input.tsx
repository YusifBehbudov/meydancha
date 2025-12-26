'use client'

import { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function AvailabilityScheduleInput({
  value,
  onChange,
}: {
  value?: string
  onChange: (value: string) => void
}) {
  const [schedule, setSchedule] = useState<Record<string, { open: string; close: string; enabled: boolean }>>(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        // Ensure all days have the structure
        const fullSchedule: Record<string, { open: string; close: string; enabled: boolean }> = {}
        DAYS.forEach((day) => {
          const dayKey = day.toLowerCase()
          if (parsed[dayKey]) {
            fullSchedule[dayKey] = {
              open: parsed[dayKey].open || '08:00',
              close: parsed[dayKey].close || '22:00',
              enabled: parsed[dayKey].enabled ?? true,
            }
          } else {
            fullSchedule[dayKey] = {
              open: '08:00',
              close: '22:00',
              enabled: false,
            }
          }
        })
        return fullSchedule
      } catch {
        return {}
      }
    }
    // Initialize with all days disabled
    const initial: Record<string, { open: string; close: string; enabled: boolean }> = {}
    DAYS.forEach((day) => {
      initial[day.toLowerCase()] = {
        open: '08:00',
        close: '22:00',
        enabled: false,
      }
    })
    return initial
  })

  const onChangeRef = useRef(onChange)
  const prevScheduleRef = useRef<string>('')
  const isInitialMount = useRef(true)
  
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Sync state when value prop changes (for editing)
  useEffect(() => {
    if (value && value !== prevScheduleRef.current) {
      try {
        const parsed = JSON.parse(value)
        const fullSchedule: Record<string, { open: string; close: string; enabled: boolean }> = {}
        DAYS.forEach((day) => {
          const dayKey = day.toLowerCase()
          if (parsed[dayKey]) {
            fullSchedule[dayKey] = {
              open: parsed[dayKey].open || '08:00',
              close: parsed[dayKey].close || '22:00',
              enabled: parsed[dayKey].enabled ?? true,
            }
          } else {
            fullSchedule[dayKey] = {
              open: '08:00',
              close: '22:00',
              enabled: false,
            }
          }
        })
        setSchedule(fullSchedule)
        prevScheduleRef.current = value
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [value])

  useEffect(() => {
    // Skip the first render to avoid infinite loop
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const enabledSchedule = Object.fromEntries(
      Object.entries(schedule).filter(([_, data]) => data?.enabled)
    )
    const json = JSON.stringify(enabledSchedule)
    
    // Only call onChange if the schedule actually changed
    if (json !== prevScheduleRef.current) {
      prevScheduleRef.current = json
      onChangeRef.current(json)
    }
  }, [schedule])

  const updateDay = (day: string, field: 'open' | 'close' | 'enabled', val: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val,
        enabled: field === 'enabled' ? val as boolean : (prev[day]?.enabled ?? true),
      },
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Availability Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-4">
            <div className="w-24">
              <Checkbox
                id={`${day}-enabled`}
                checked={schedule[day]?.enabled ?? false}
                onCheckedChange={(checked) => updateDay(day, 'enabled', checked as boolean)}
              />
              <Label htmlFor={`${day}-enabled`} className="ml-2 capitalize">
                {day}
              </Label>
            </div>
            {schedule[day]?.enabled && (
              <>
                <div className="flex-1">
                  <Label htmlFor={`${day}-open`} className="text-xs text-muted-foreground">
                    Open
                  </Label>
                  <Input
                    id={`${day}-open`}
                    type="time"
                    value={schedule[day]?.open || '08:00'}
                    onChange={(e) => updateDay(day, 'open', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`${day}-close`} className="text-xs text-muted-foreground">
                    Close
                  </Label>
                  <Input
                    id={`${day}-close`}
                    type="time"
                    value={schedule[day]?.close || '22:00'}
                    onChange={(e) => updateDay(day, 'close', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

