'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createField, updateField } from '@/app/actions/field'
import { Textarea } from '@/components/ui/textarea'
import { AvailabilityScheduleInput } from '@/components/availability-schedule-input'

const fieldSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sportType: z.enum(['football', 'basketball', 'padel', 'tennis']),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  size: z.string().optional(),
  pricePerHour: z.number().min(1, 'Price must be greater than 0'),
  features: z.string().optional(),
  availabilitySchedule: z.string().optional(),
})

export function FieldForm({ field }: { field?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field ? {
      name: field.name,
      sportType: field.sportType,
      city: field.city,
      address: field.address,
      size: field.size || '',
      pricePerHour: field.pricePerHour,
      features: field.features || '',
      availabilitySchedule: field.availabilitySchedule || '',
    } : undefined,
  })

  const sportType = watch('sportType')

  const onSubmit = async (data: z.infer<typeof fieldSchema>) => {
    setIsLoading(true)
    try {
      console.log('Submitting field data:', data)
      const result = field
        ? await updateField(field.id, data)
        : await createField(data)

      console.log('Field creation result:', result)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: field ? 'Field updated successfully' : 'Field created successfully',
        })
        router.push('/owner/fields')
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="name">Field Name</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sportType">Sport Type *</Label>
        <Select
          value={sportType || ''}
          onValueChange={(value) => {
            setValue('sportType', value as any, { shouldValidate: true })
          }}
        >
          <SelectTrigger className={errors.sportType ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select sport type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
            <SelectItem value="padel">Padel</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
          </SelectContent>
        </Select>
        {errors.sportType && (
          <p className="text-sm text-destructive mt-1">{errors.sportType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          {...register('city')}
          className={errors.city ? 'border-destructive' : ''}
        />
        {errors.city && (
          <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...register('address')}
          className={errors.address ? 'border-destructive' : ''}
        />
        {errors.address && (
          <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="size">Size</Label>
        <Input
          id="size"
          {...register('size')}
          placeholder="e.g., 5v5, 7v7, 11v11 for football or Full court, Half court for basketball"
          className={errors.size ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Specify the field size (e.g., "5v5", "7v7", "11v11" for football, "Full court" for basketball)
        </p>
        {errors.size && (
          <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="pricePerHour">Price per Hour (AZN)</Label>
        <Input
          id="pricePerHour"
          type="number"
          step="0.01"
          {...register('pricePerHour', { valueAsNumber: true })}
          className={errors.pricePerHour ? 'border-destructive' : ''}
        />
        {errors.pricePerHour && (
          <p className="text-sm text-destructive mt-1">{errors.pricePerHour.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="features">Features</Label>
        <Textarea
          id="features"
          {...register('features')}
          placeholder="Enter features separated by commas (e.g., Lighting, Parking, Locker room, Refreshments)"
          rows={3}
          className={errors.features ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground mt-1">
          List all features and amenities (separate with commas)
        </p>
        {errors.features && (
          <p className="text-sm text-destructive mt-1">{errors.features.message}</p>
        )}
      </div>

      <div>
        <Label>Availability Schedule</Label>
        <AvailabilityScheduleInput
          value={watch('availabilitySchedule')}
          onChange={(value) => {
            setValue('availabilitySchedule', value, { shouldDirty: true })
          }}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Select the days and hours when your field is available for booking
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (field ? 'Updating...' : 'Creating...') : (field ? 'Update Field' : 'Create Field')}
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
  )
}

