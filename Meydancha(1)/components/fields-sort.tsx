'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FieldsSort({ initialSort }: { initialSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('sortBy', value)
    } else {
      params.delete('sortBy')
    }
    // Force a full page reload to ensure server component re-renders with new sortBy
    window.location.href = `/fields?${params.toString()}`
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={initialSort || 'rating'} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-low">Price Low to High</SelectItem>
          <SelectItem value="price-high">Price High to Low</SelectItem>
          <SelectItem value="rating">Rating High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


