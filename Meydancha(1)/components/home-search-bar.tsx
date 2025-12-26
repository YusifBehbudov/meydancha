'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function HomeSearchBar() {
  const router = useRouter()
  const [sportType, setSportType] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (sportType) params.set('sportType', sportType)
    if (city) params.set('city', city)
    if (date) params.set('date', date)
    router.push(`/fields?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
      <select
        value={sportType}
        onChange={(e) => setSportType(e.target.value)}
        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Select Sport</option>
        <option value="football">Football</option>
        <option value="basketball">Basketball</option>
        <option value="padel">Padel</option>
        <option value="tennis">Tennis</option>
      </select>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Select Location</option>
        <option value="Baku">Baku</option>
        <option value="Ganja">Ganja</option>
        <option value="Sumgait">Sumgait</option>
        <option value="Mingachevir">Mingachevir</option>
        <option value="Lankaran">Lankaran</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button onClick={handleSearch} className="w-full md:w-auto">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  )
}


