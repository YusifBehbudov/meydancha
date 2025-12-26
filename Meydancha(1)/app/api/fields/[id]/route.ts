import { NextRequest, NextResponse } from 'next/server'
import { requireRole, requireAuth } from '@/lib/session'
import { fieldSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require OWNER role
    const session = await requireRole('OWNER')
    
    const { id } = await params
    
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
    
    // Validate input
    const validatedData = fieldSchema.parse(body)

    // Handle workingHours: convert empty string to null
    const workingHours = validatedData.workingHours && validatedData.workingHours.trim() !== '' 
      ? validatedData.workingHours 
      : null

    // Handle media: convert empty string to null
    const media = validatedData.media && validatedData.media.trim() !== '' 
      ? validatedData.media 
      : null

    // Check if field exists and belongs to the owner
    const existingField = await prisma.field.findUnique({
      where: { id },
    })

    if (!existingField) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    // Check if the field belongs to the current user (or user is ADMIN)
    if (existingField.ownerId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own fields' },
        { status: 403 }
      )
    }

    // Update the field
    const field = await prisma.field.update({
      where: { id },
      data: {
        name: validatedData.name,
        sportType: validatedData.sportType,
        city: validatedData.city,
        address: validatedData.address,
        pricePerHour: validatedData.pricePerHour,
        workingHours: workingHours,
        media: media,
      },
    })

    return NextResponse.json({
      success: true,
      field: {
        id: field.id,
        name: field.name,
        sportType: field.sportType,
        city: field.city,
        address: field.address,
        pricePerHour: field.pricePerHour,
      },
    })
  } catch (error: any) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners can update fields' },
        { status: 403 }
      )
    }
    console.error('Error updating field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require OWNER or ADMIN role
    const session = await requireAuth()
    if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can delete fields' },
        { status: 403 }
      )
    }
    
    const { id } = await params

    // Check if field exists and belongs to the owner
    const existingField = await prisma.field.findUnique({
      where: { id },
    })

    if (!existingField) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    // Check if the field belongs to the current user (or user is ADMIN)
    if (existingField.ownerId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own fields' },
        { status: 403 }
      )
    }

    // Delete the field
    await prisma.field.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Field deleted successfully',
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
        { error: 'Forbidden: Only owners can delete fields' },
        { status: 403 }
      )
    }
    console.error('Error deleting field:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

