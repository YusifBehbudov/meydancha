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
    
    const { userId, approved } = body

    if (typeof userId !== 'string' || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'userId (string) and approved (boolean) are required' },
        { status: 400 }
      )
    }

    // Check if user exists and get current status
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        idVerificationStatus: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For OWNER role, require ID verification before approval
    if (existingUser.role === 'OWNER' && approved && existingUser.idVerificationStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot approve owner account. ID verification must be approved first.' },
        { status: 400 }
      )
    }

    // Update user approval status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { approved },
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
      message: approved ? 'User approved successfully' : 'User approval revoked',
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
        { error: 'Forbidden: Only admins can approve users' },
        { status: 403 }
      )
    }
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

