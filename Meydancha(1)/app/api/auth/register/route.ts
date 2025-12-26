import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }
    
    const validatedData = registerSchema.parse(body)

    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phoneNumber,
      validatedData.role || 'PLAYER',
      validatedData.idVerificationPhoto
    )

    // Don't set cookie if OWNER is not approved
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved,
      },
      message: user.role === 'OWNER' && !user.approved 
        ? 'Account created successfully. Your account is pending admin approval. You will be able to login once approved.'
        : 'Account created successfully',
    })

    // Only set cookie if user is approved (or not an OWNER)
    if (user.approved || user.role !== 'OWNER') {
      response.cookies.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

