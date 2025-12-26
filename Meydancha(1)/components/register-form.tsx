'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { register as registerAction } from '@/app/actions/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required').regex(/^\+?[1-9]\d{1,14}$|^\d{10,15}$/, 'Invalid phone number format'),
  role: z.enum(['PLAYER', 'OWNER']).default('PLAYER'),
  idVerificationPhoto: z.string().optional(),
}).refine((data) => {
  if (data.role === 'OWNER') {
    return !!data.idVerificationPhoto && data.idVerificationPhoto.trim() !== ''
  }
  return true
}, {
  message: 'ID verification photo is required for owner registration',
  path: ['idVerificationPhoto'],
})

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [idPhoto, setIdPhoto] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PLAYER' as const,
      idVerificationPhoto: '',
    },
  })

  const selectedRole = watch('role') || 'PLAYER'

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please upload an image file',
          variant: 'destructive',
        })
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setIdPhoto(base64String)
        // Set the form value for validation
        setValue('idVerificationPhoto', base64String, { shouldValidate: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true)
    try {
      // Validate ID photo for OWNER
      if (selectedRole === 'OWNER' && !idPhoto) {
        toast({
          title: 'Error',
          description: 'Please upload a photo of yourself holding your ID card',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Ensure role is set and include photo
      const formData = {
        ...data,
        role: data.role || 'PLAYER',
        idVerificationPhoto: selectedRole === 'OWNER' ? (idPhoto || data.idVerificationPhoto) : undefined,
      }
      
      const result = await registerAction(formData)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: result.message || 'Account created successfully',
        })
        router.push('/login')
      }
    } catch (error) {
      console.error('Registration form error:', error)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-destructive' : ''}
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="role">I want to register as</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => {
            setValue('role', value as 'PLAYER' | 'OWNER', { shouldValidate: true })
          }}
        >
          <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PLAYER">Player</SelectItem>
            <SelectItem value="OWNER">Field Owner</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
        )}
        {selectedRole === 'OWNER' && (
          <>
            <p className="text-xs text-muted-foreground mt-1">
              Owner accounts require admin approval and ID verification before you can add fields.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="idPhoto">ID Verification Photo *</Label>
              <p className="text-xs text-muted-foreground">
                Please upload a clear photo of yourself holding your ID card next to your face
              </p>
              <Input
                id="idPhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required={selectedRole === 'OWNER'}
              />
              {idPhoto && (
                <div className="mt-2">
                  <img 
                    src={idPhoto} 
                    alt="ID Verification" 
                    className="max-w-xs max-h-48 rounded border"
                  />
                </div>
              )}
              {errors.idVerificationPhoto && (
                <p className="text-sm text-destructive mt-1">
                  {errors.idVerificationPhoto.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign up'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}


