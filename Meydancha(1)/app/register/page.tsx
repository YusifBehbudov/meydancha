'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    name: string
    email: string
    password: string
    role?: string
    idVerificationPhoto?: string
  }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PLAYER',
      idVerificationPhoto: '',
    },
  })

  const selectedRole = watch('role') || 'PLAYER'
  const [idPhoto, setIdPhoto] = useState<string>('')

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

  const onSubmit = async (data: { email: string; password: string; name: string; role?: string; idVerificationPhoto?: string }) => {
    setIsLoading(true)
    try {
      // Validate ID photo for OWNER before submission
      if (selectedRole === 'OWNER' && !idPhoto && !data.idVerificationPhoto) {
        toast({
          title: 'Error',
          description: 'Please upload a photo of yourself holding your ID card',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Prepare form data with photo
      const formData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        role: data.role || 'PLAYER',
        idVerificationPhoto: selectedRole === 'OWNER' ? (idPhoto || data.idVerificationPhoto || '') : undefined,
      }

      console.log('Submitting registration:', { ...formData, idVerificationPhoto: formData.idVerificationPhoto ? 'present' : 'missing' })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      toast({
        title: 'Success',
        description: result.message || 'Account created successfully',
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
            MEYDANCHA
          </Link>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('Form validation errors:', errors)
            if (errors.idVerificationPhoto) {
              toast({
                title: 'Validation Error',
                description: errors.idVerificationPhoto.message || 'ID verification photo is required',
                variant: 'destructive',
              })
            }
          })} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+994501234567 or 0501234567"
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your phone number (e.g., +994501234567 or 0501234567)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I want to register as</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  setValue('role', value, { shouldValidate: true })
                  // Clear photo when switching away from OWNER
                  if (value !== 'OWNER') {
                    setIdPhoto('')
                    setValue('idVerificationPhoto', '', { shouldValidate: false })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAYER">Player</SelectItem>
                  <SelectItem value="OWNER">Field Owner</SelectItem>
                </SelectContent>
              </Select>
              {selectedRole === 'OWNER' && (
                <>
                  <p className="text-xs text-muted-foreground mt-1">
                    Owner accounts require admin approval and ID verification before you can login and add fields.
                  </p>
                  <div className="space-y-2 mt-4">
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
            
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


