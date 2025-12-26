'use server'

import { createUser, authenticateUser } from '@/lib/auth'
import { registerSchema, loginSchema } from '@/lib/validations'
import { cookies } from 'next/headers'

export async function register(data: {
  name: string
  email: string
  password: string
  phoneNumber: string
  role?: 'PLAYER' | 'OWNER'
  idVerificationPhoto?: string
}) {
  try {
    const validatedData = registerSchema.parse(data)

    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phoneNumber,
      validatedData.role || 'PLAYER',
      validatedData.idVerificationPhoto
    )

    // Don't set cookie if OWNER is not approved
    if (user.role === 'OWNER' && !user.approved) {
      return {
        success: true,
        message: 'Account created successfully. Your account is pending admin approval. You will be able to login once approved.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          approved: user.approved,
        },
      }
    }

    // Set cookie only if user is approved (or not an OWNER)
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved,
      },
    }
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return {
        error: 'Email already exists',
      }
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        error: 'Invalid input data',
      }
    }
    return {
      error: error?.message || 'Failed to create account',
    }
  }
}

export async function login(data: {
  email: string
  password: string
}) {
  try {
    const validatedData = loginSchema.parse(data)

    let user
    try {
      user = await authenticateUser(validatedData.email, validatedData.password)
    } catch (error: any) {
      // Handle approval error
      if (error instanceof Error && error.message.includes('pending approval')) {
        return {
          error: error.message,
        }
      }
      throw error
    }

    if (!user) {
      return {
        error: 'Invalid email or password',
      }
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }
  } catch (error: any) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        error: 'Invalid input data',
      }
    }
    return {
      error: error?.message || 'Failed to login',
    }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  return { success: true }
}

