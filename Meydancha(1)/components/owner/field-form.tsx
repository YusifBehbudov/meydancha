'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fieldSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { AvailabilityScheduleInput } from '@/components/availability-schedule-input'
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react'

export default function FieldForm({ fieldId, initialData }: { fieldId?: string; initialData?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: initialData || {
      name: '',
      sportType: 'football',
      city: '',
      address: '',
      pricePerHour: 0,
      workingHours: '',
      media: '',
    },
  })

  const sportType = watch('sportType')
  const workingHours = watch('workingHours')
  const [mediaFiles, setMediaFiles] = useState<Array<{ type: 'image' | 'video'; data: string; file: File | null }>>(() => {
    // Initialize from existing media if editing
    if (initialData?.media) {
      try {
        const parsed = JSON.parse(initialData.media)
        return Array.isArray(parsed) ? parsed.map((item: any) => ({
          type: item.type || 'image',
          data: item.data || '',
          file: null,
        })) : []
      } catch {
        return []
      }
    }
    return []
  })

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Validate file type
      if (type === 'image' && !file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please upload an image file',
          variant: 'destructive',
        })
        return
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        toast({
          title: 'Error',
          description: 'Please upload a video file',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: 'Error',
          description: `${type === 'image' ? 'Image' : 'Video'} size must be less than ${type === 'image' ? '10MB' : '50MB'}`,
          variant: 'destructive',
        })
        return
      }

      // Compress image before converting to base64
      if (type === 'image') {
        const reader = new FileReader()
        reader.onloadend = () => {
          const img = new Image()
          img.onload = () => {
            // Create canvas to compress image
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 1920
            const MAX_HEIGHT = 1080
            let width = img.width
            let height = img.height

            // Calculate new dimensions
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
              }
            }

            canvas.width = width
            canvas.height = height

            // Draw and compress
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height)
              // Convert to base64 with compression (0.8 quality)
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
              setMediaFiles((prev) => [...prev, { type, data: compressedBase64, file }])
            } else {
              // Fallback if canvas not available
              const base64String = reader.result as string
              setMediaFiles((prev) => [...prev, { type, data: base64String, file }])
            }
          }
          img.onerror = () => {
            // Fallback to original base64 if image load fails
            const base64String = reader.result as string
            setMediaFiles((prev) => [...prev, { type, data: base64String, file }])
          }
          img.src = reader.result as string
        }
        reader.readAsDataURL(file)
      } else {
        // For videos, convert directly to base64 (no compression)
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setMediaFiles((prev) => [...prev, { type, data: base64String, file }])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset input
    e.target.value = ''
  }

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Update form value when mediaFiles changes
  useEffect(() => {
    const mediaData = mediaFiles.map(({ type, data }) => ({ type, data }))
    setValue('media', JSON.stringify(mediaData), { shouldValidate: false })
  }, [mediaFiles, setValue])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const url = fieldId ? `/api/fields/${fieldId}` : '/api/fields'
      const method = fieldId ? 'PUT' : 'POST'

      // Log data size for debugging
      const dataSize = JSON.stringify(data).length
      console.log('Submitting field data, size:', (dataSize / 1024 / 1024).toFixed(2), 'MB')

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      })

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(text || 'Invalid response from server')
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save field')
      }

      toast({
        title: 'Success',
        description: fieldId ? 'Field updated successfully' : 'Field created successfully',
      })

      router.push('/owner/fields')
      router.refresh()
    } catch (error) {
      console.error('Error saving field:', error)
      let errorMessage = 'Failed to save field'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The media files might be too large. Please try reducing the number or size of images/videos.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again. If the problem persists, try reducing the number or size of media files.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Field Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sportType">Sport Type</Label>
            <Select
              value={sportType}
              onValueChange={(value) => setValue('sportType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="padel">Padel</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
              </SelectContent>
            </Select>
            {errors.sportType && (
              <p className="text-sm text-destructive">{errors.sportType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerHour">Price Per Hour (AZN)</Label>
            <Input
              id="pricePerHour"
              type="number"
              step="0.01"
              {...register('pricePerHour', { valueAsNumber: true })}
            />
            {errors.pricePerHour && (
              <p className="text-sm text-destructive">{errors.pricePerHour.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Working Hours</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Select the days and times when this field is available for booking
            </p>
            <AvailabilityScheduleInput
              value={workingHours}
              onChange={(value) => setValue('workingHours', value, { shouldValidate: true })}
            />
            {errors.workingHours && (
              <p className="text-sm text-destructive">{errors.workingHours.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photos & Videos</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload photos and videos of your field to showcase it to potential customers
            </p>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Add Photos</p>
                    <p className="text-xs text-gray-500">Max 10MB per image</p>
                  </div>
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, 'image')}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Add Videos</p>
                    <p className="text-xs text-gray-500">Max 50MB per video</p>
                  </div>
                </Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, 'video')}
                  className="hidden"
                />
              </div>
            </div>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative group">
                    {media.type === 'image' ? (
                      <img
                        src={media.data}
                        alt={`Field ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <video
                        src={media.data}
                        className="w-full h-32 object-cover rounded-lg border"
                        controls={false}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {media.type === 'image' ? 'Photo' : 'Video'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.media && (
              <p className="text-sm text-destructive">{errors.media.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : fieldId ? 'Update Field' : 'Create Field'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


