import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required').regex(/^\+?[1-9]\d{1,14}$|^\d{10,15}$/, 'Invalid phone number format'),
  role: z.enum(['PLAYER', 'OWNER']).optional(),
  idVerificationPhoto: z.string().optional(), // Base64 encoded image for OWNER
}).refine((data) => {
  // If role is OWNER, idVerificationPhoto is required
  if (data.role === 'OWNER') {
    return !!data.idVerificationPhoto && data.idVerificationPhoto.trim() !== ''
  }
  return true
}, {
  message: 'ID verification photo is required for owner registration',
  path: ['idVerificationPhoto'],
})

export const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sportType: z.enum(['football', 'basketball', 'padel', 'tennis']),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  pricePerHour: z.number().positive('Price must be positive'),
  workingHours: z.string().optional(), // JSON string with weekly schedule
  media: z.string().optional(), // JSON string: [{"type": "image"|"video", "data": "base64..."}, ...]
})

export const bookingSchema = z.object({
  fieldId: z.string().min(1, 'Field is required'),
  date: z.union([
    z.date(),
    z.string().transform((str) => {
      const date = new Date(str)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }
      return date
    }),
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (must be HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (must be HH:mm)'),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const complaintSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
})


