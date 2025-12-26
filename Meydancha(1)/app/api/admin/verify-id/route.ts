import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role
    await requireRole('ADMIN')
    
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
    
    const { userId, status } = body

    if (typeof userId !== 'string' || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'userId (string) and status (APPROVED or REJECTED) are required' },
        { status: 400 }
      )
    }

    // Update user ID verification status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { idVerificationStatus: status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        idVerificationStatus: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `ID verification ${status.toLowerCase()}`,
      user,
    })
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can verify IDs' },
        { status: 403 }
      )
    }
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    console.error('Error verifying ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

