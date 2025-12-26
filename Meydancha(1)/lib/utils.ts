import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount} AZN`
}

export function formatPrice(amount: number): string {
  return formatCurrency(amount)
}

export function formatTime(time: string): string {
  return time
}

export function getHourSlots(): string[] {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

export function calculateTotalPrice(pricePerHour: number, startTime: string, endTime: string): number {
  const start = parseInt(startTime.split(':')[0])
  const end = parseInt(endTime.split(':')[0])
  const hours = end - start
  return pricePerHour * hours
}

export function isTimeSlotAvailable(
  slot: string,
  date: Date,
  existingBookings: Array<{ startTime: string; endTime: string }>
): boolean {
  const slotHour = parseInt(slot.split(':')[0])
  
  return !existingBookings.some(booking => {
    const bookingStart = parseInt(booking.startTime.split(':')[0])
    const bookingEnd = parseInt(booking.endTime.split(':')[0])
    return slotHour >= bookingStart && slotHour < bookingEnd
  })
}

export function isTimeInNext2Hours(time: string): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const slotHour = parseInt(time.split(':')[0])
  const diff = slotHour - currentHour
  return diff >= 0 && diff <= 2
}

export function getAvailableTimeSlots(
  bookings: Array<{ startTime: string; endTime: string }>,
  date: Date
): string[] {
  const allSlots = getHourSlots()
  return allSlots.filter(slot => isTimeSlotAvailable(slot, date, bookings))
}

/**
 * Get current date and time in Baku timezone (UTC+4)
 */
export function getCurrentTimeInBaku(): Date {
  const now = new Date()
  // Baku is UTC+4
  const bakuOffset = 4 * 60 // 4 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const bakuTime = new Date(utc + (bakuOffset * 60000))
  return bakuTime
}

/**
 * Check if a booking date and time is in the past (Baku timezone)
 */
export function isBookingTimeInPast(date: Date, startTime: string): boolean {
  const bakuNow = getCurrentTimeInBaku()
  const bookingDate = new Date(date)
  
  // Normalize dates to start of day for comparison
  const today = new Date(bakuNow)
  today.setHours(0, 0, 0, 0)
  bookingDate.setHours(0, 0, 0, 0)
  
  // If booking is for a past date, it's invalid
  if (bookingDate < today) {
    return true
  }
  
  // If booking is for today, check if the time has passed
  if (bookingDate.getTime() === today.getTime()) {
    const [hours, minutes] = startTime.split(':').map(Number)
    const bookingDateTime = new Date(bakuNow)
    bookingDateTime.setHours(hours, minutes, 0, 0)
    
    return bookingDateTime <= bakuNow
  }
  
  // Future dates are valid
  return false
}

/**
 * Filter time slots to only include future times for today's date
 */
export function filterPastTimeSlots(slots: string[], date: Date): string[] {
  const bakuNow = getCurrentTimeInBaku()
  const bookingDate = new Date(date)
  
  // Normalize dates to start of day
  const today = new Date(bakuNow)
  today.setHours(0, 0, 0, 0)
  bookingDate.setHours(0, 0, 0, 0)
  
  // If it's not today, return all slots
  if (bookingDate.getTime() !== today.getTime()) {
    return slots
  }
  
  // For today, filter out past time slots
  const currentHour = bakuNow.getHours()
  const currentMinute = bakuNow.getMinutes()
  
  return slots.filter(slot => {
    const [hours, minutes] = slot.split(':').map(Number)
    
    // If the slot hour is in the future, it's valid
    if (hours > currentHour) {
      return true
    }
    
    // If it's the same hour, check minutes
    if (hours === currentHour && minutes > currentMinute) {
      return true
    }
    
    // Past time slots are invalid
    return false
  })
}

/**
 * Check if a booking can be cancelled (must be at least 4 hours before booking time)
 * Returns true if cancellation is allowed, false otherwise
 */
export function canCancelBooking(date: Date, startTime: string): boolean {
  const bakuNow = getCurrentTimeInBaku()
  const bookingDate = new Date(date)
  
  // Parse booking start time
  const [hours, minutes] = startTime.split(':').map(Number)
  const bookingDateTime = new Date(bookingDate)
  bookingDateTime.setHours(hours, minutes, 0, 0)
  
  // Calculate time difference in milliseconds
  const timeDifference = bookingDateTime.getTime() - bakuNow.getTime()
  
  // Convert to hours (4 hours = 4 * 60 * 60 * 1000 milliseconds)
  const hoursUntilBooking = timeDifference / (1000 * 60 * 60)
  
  // Can cancel if booking is at least 4 hours away
  return hoursUntilBooking >= 4
}

/**
 * Get day name from date (monday, tuesday, etc.)
 */
function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()]
}

/**
 * Check if a booking time is within field's working hours
 */
export function isWithinWorkingHours(
  date: Date,
  startTime: string,
  endTime: string,
  workingHours: string | null | undefined
): boolean {
  // If no working hours set, allow all times (backward compatibility)
  if (!workingHours) {
    return true
  }

  try {
    const schedule = JSON.parse(workingHours)
    const dayName = getDayName(date)
    const daySchedule = schedule[dayName]

    // If day is not enabled in schedule, booking is not allowed
    if (!daySchedule || !daySchedule.enabled) {
      return false
    }

    const openTime = daySchedule.open || '00:00'
    const closeTime = daySchedule.close || '23:59'

    // Check if booking start time is within working hours
    // Booking must start at or after open time
    if (startTime < openTime) {
      return false
    }

    // Booking end time must be at or before close time
    if (endTime > closeTime) {
      return false
    }

    return true
  } catch (error) {
    // Invalid JSON, allow booking (backward compatibility)
    console.error('Error parsing working hours:', error)
    return true
  }
}


