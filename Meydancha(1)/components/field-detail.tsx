'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Heart, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react'
import { formatCurrency, calculateTotalPrice, getHourSlots, isTimeSlotAvailable, filterPastTimeSlots, isBookingTimeInPast } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Field } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReviewForm } from '@/components/review-form'

interface FieldDetailProps {
  field: Field & {
    owner: {
      name: string
    }
    reviews: Array<{
      id: string
      rating: number
      comment: string | null
      createdAt: Date
      user: {
        name: string
      }
    }>
  }
  bookings: Array<{
    date: Date
    startTime: string
    endTime: string
  }>
  session: {
    id: string
    email: string
    name: string
    role: string
  } | null
  userReview?: {
    rating: number
    comment: string | null
  } | null
  canReview?: boolean
}

export default function FieldDetail({ field, bookings, session, userReview, canReview }: FieldDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('20:00')
  const [isBooking, setIsBooking] = useState(false)

  const hourSlots = getHourSlots()
  const selectedDateObj = new Date(selectedDate)
  selectedDateObj.setHours(0, 0, 0, 0)

  const dateBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    bookingDate.setHours(0, 0, 0, 0)
    return bookingDate.getTime() === selectedDateObj.getTime()
  })

  // Filter out booked slots
  const bookedSlots = hourSlots.filter(slot => 
    isTimeSlotAvailable(slot, selectedDateObj, dateBookings)
  )
  
  // Filter out past time slots for today
  const availableSlots = filterPastTimeSlots(bookedSlots, selectedDateObj)

  const totalPrice = calculateTotalPrice(field.pricePerHour, startTime, endTime)

  const handleBooking = async () => {
    if (!session) {
      toast({
        title: 'Login Required',
        description: 'Please login to book a field',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    // Only PLAYER role can book fields
    if (session.role !== 'PLAYER') {
      toast({
        title: 'Not Allowed',
        description: session.role === 'OWNER' 
          ? 'Owners cannot book fields. Please use the owner dashboard to manage your fields.'
          : 'Admins cannot book fields.',
        variant: 'destructive',
      })
      return
    }

    // Check if booking time is in the past (client-side validation)
    if (isBookingTimeInPast(selectedDateObj, startTime)) {
      toast({
        title: 'Error',
        description: 'Cannot book a time slot in the past. Please select a future date and time.',
        variant: 'destructive',
      })
      return
    }

    setIsBooking(true)
    try {
      // Convert date string to ISO string for API
      const dateForAPI = new Date(selectedDate).toISOString()
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fieldId: field.id,
          date: dateForAPI,
          startTime,
          endTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Booking failed')
      }

      toast({
        title: 'Success',
        description: 'Field booked successfully!',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Booking failed',
        variant: 'destructive',
      })
    } finally {
      setIsBooking(false)
    }
  }

  const sportIcons: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    padel: '🎾',
    tennis: '🎾',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </Link>
          <div className="flex gap-4">
            {session ? (
              <>
                <Link href="/me/bookings">
                  <Button variant="ghost">My Bookings</Button>
                </Link>
                <form action="/api/auth/logout" method="post">
                  <Button variant="ghost" type="submit">Logout</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Field Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{field.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {field.ratingAvg.toFixed(1)} ({field.ratingCount})
                  </span>
                </div>
                <button className="text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span className="text-2xl">{sportIcons[field.sportType]}</span>
                <span className="capitalize">{field.sportType}</span>
                <span>-</span>
                <MapPin className="h-4 w-4" />
                <span>{field.city}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(field.pricePerHour)} / hr
              </div>
            </div>
          </div>
        </div>

        {/* Field Media Gallery */}
        {(() => {
          let media: Array<{ type: 'image' | 'video'; data: string }> = []
          try {
            if ((field as any).media) {
              media = JSON.parse((field as any).media)
            }
          } catch (e) {
            console.error('Error parsing media:', e)
          }

          if (media.length === 0) {
            return <div className="w-full h-96 bg-green-200 rounded-lg mb-8"></div>
          }

          return (
            <div className="mb-8">
              {media.length === 1 ? (
                // Single media - full width
                <div className="w-full rounded-lg overflow-hidden">
                  {media[0].type === 'image' ? (
                    <img
                      src={media[0].data}
                      alt={field.name}
                      className="w-full h-96 object-cover"
                    />
                  ) : (
                    <video
                      src={media[0].data}
                      className="w-full h-96 object-cover"
                      controls
                    />
                  )}
                </div>
              ) : (
                // Multiple media - grid with first item larger
                <div className="grid grid-cols-2 gap-2">
                  <div className="row-span-2">
                    {media[0].type === 'image' ? (
                      <img
                        src={media[0].data}
                        alt={field.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={media[0].data}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                    )}
                  </div>
                  {media.slice(1, 5).map((item, index) => (
                    <div key={index} className="h-48">
                      {item.type === 'image' ? (
                        <img
                          src={item.data}
                          alt={`${field.name} ${index + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={item.data}
                          className="w-full h-full object-cover rounded-lg"
                          controls
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Availability Section - Show for all roles */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="date" className="mb-2 block">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={session?.role !== 'PLAYER'}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {hourSlots.slice(8, 22).map((slot) => {
                    const isAvailable = isTimeSlotAvailable(slot, selectedDateObj, dateBookings)
                    const isSelected = slot >= startTime && slot < endTime
                    const canInteract = session?.role === 'PLAYER'
                    
                    return (
                      <Button
                        key={slot}
                        variant={isSelected ? 'default' : isAvailable ? 'outline' : 'secondary'}
                        size="sm"
                        disabled={!isAvailable || !canInteract}
                        onClick={() => {
                          if (!canInteract) return
                          if (isSelected) {
                            setStartTime(slot)
                            if (parseInt(slot.split(':')[0]) >= parseInt(endTime.split(':')[0])) {
                              const nextHour = (parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0') + ':00'
                              setEndTime(nextHour)
                            }
                          } else {
                            setStartTime(slot)
                            const nextHour = (parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0') + ':00'
                            setEndTime(nextHour)
                          }
                        }}
                      >
                        {slot}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
                {session && session.role !== 'PLAYER' && (
                  <p className="text-xs text-gray-500 mt-2">
                    {session.role === 'OWNER' 
                      ? 'View-only mode. Use owner dashboard to manage bookings.'
                      : 'View-only mode. Admins cannot make bookings.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews</CardTitle>
                  {canReview && session?.role === 'PLAYER' && (
                    <ReviewForm
                      fieldId={field.id}
                      fieldName={field.name}
                      existingReview={userReview}
                      onSuccess={() => router.refresh()}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {field.reviews.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-gray-500">No reviews yet.</p>
                    {canReview && session?.role === 'PLAYER' && !userReview && (
                      <p className="text-sm text-muted-foreground">
                        Be the first to review this field!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {field.reviews.map((review) => (
                      <div key={review.id} className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.user.name}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar - Only show for PLAYER role */}
          {session?.role === 'PLAYER' && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Select Date
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="from-time" className="mb-2 block">From</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="to-time" className="mb-2 block">To</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots
                          .filter(slot => parseInt(slot.split(':')[0]) > parseInt(startTime.split(':')[0]))
                          .map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                    
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleBooking}
                      disabled={isBooking || !session}
                    >
                      {isBooking ? 'Booking...' : 'Book Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Info message for OWNER and ADMIN */}
          {session && session.role !== 'PLAYER' && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Field Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {session.role === 'OWNER' ? (
                    <p className="text-sm text-gray-600">
                      This is your field. Use the owner dashboard to manage bookings and settings.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Admins can view field details but cannot make bookings.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

