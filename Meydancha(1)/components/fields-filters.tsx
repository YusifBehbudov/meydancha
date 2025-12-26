'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Clock } from 'lucide-react'

interface FieldsFiltersProps {
  initialSportType?: string
  initialCity?: string
  initialDate?: string
  initialTime?: string
  tapAndPlay?: boolean
}

export default function FieldsFilters({
  initialSportType,
  initialCity,
  initialDate,
  initialTime,
  tapAndPlay,
}: FieldsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sportType, setSportType] = useState<string | undefined>(initialSportType)
  const [city, setCity] = useState(initialCity || '')
  const [date, setDate] = useState(initialDate || '')
  const [time, setTime] = useState(initialTime || '')
  
  // Sync state with URL params when they change externally (e.g., from browser back button)
  // Only sync on mount and when searchParams change, not when local state changes
  useEffect(() => {
    const urlSportType = searchParams.get('sportType') || undefined
    const urlCity = searchParams.get('city') || ''
    const urlDate = searchParams.get('date') || ''
    const urlTime = searchParams.get('time') || ''
    
    // Update state only if URL params differ from current state
    // This handles browser back/forward navigation
    setSportType(urlSportType)
    setCity(urlCity)
    setDate(urlDate)
    setTime(urlTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const updateFilters = () => {
    const params = new URLSearchParams()
    if (sportType) {
      params.set('sportType', sportType)
    } else {
      params.delete('sportType')
    }
    if (city) {
      params.set('city', city)
    } else {
      params.delete('city')
    }
    if (date) {
      params.set('date', date)
    } else {
      params.delete('date')
    }
    if (time) {
      params.set('time', time)
    } else {
      params.delete('time')
    }
    if (tapAndPlay) {
      params.set('tapAndPlay', 'true')
    } else {
      params.delete('tapAndPlay')
    }
    // Preserve sortBy if it exists
    const currentSortBy = searchParams.get('sortBy')
    if (currentSortBy) {
      params.set('sortBy', currentSortBy)
    }
    // Build the new URL
    const queryString = params.toString()
    const newUrl = `/fields${queryString ? `?${queryString}` : ''}`
    
    // Force a full page reload to ensure server component re-renders with new searchParams
    // This is more reliable than router.push() + router.refresh() for server components
    window.location.href = newUrl
  }

  const handleSportChange = (sport: string, checked: boolean) => {
    // If checkbox is checked, set this sport as selected
    // If unchecked and this is the currently selected sport, clear selection
    if (checked) {
      setSportType(sport)
    } else if (sportType === sport) {
      setSportType(undefined)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sport Filter */}
      <div>
        <h3 className="font-semibold mb-3">Sport</h3>
        <div className="space-y-2">
          {(['football', 'basketball', 'padel', 'tennis'] as const).map((sport) => (
            <div key={sport} className="flex items-center space-x-2">
              <Checkbox
                id={sport}
                checked={sportType === sport}
                onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
              />
              <Label
                htmlFor={sport}
                className="text-sm font-normal cursor-pointer capitalize"
                onClick={() => handleSportChange(sport, sportType !== sport)}
              >
                {sport}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </h3>
        <Select 
          value={city || undefined} 
          onValueChange={(value) => {
            // If "all" is selected, clear the city filter
            if (value === 'all') {
              setCity('')
            } else {
              setCity(value)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="Baku">Baku</SelectItem>
            <SelectItem value="Ganja">Ganja</SelectItem>
            <SelectItem value="Sumgait">Sumgait</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date & Time Filter */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date & Time
        </h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="date" className="text-sm">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="time" className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )
}


