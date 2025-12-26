import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/session'
import { fieldSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'

// Route config for handling large payloads
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require OWNER role
    const session = await requireRole('OWNER')
    
    let body
    try {
      body = await request.json()
      
      // Log request size for debugging
      const bodyString = JSON.stringify(body)
      const sizeInMB = (bodyString.length / 1024 / 1024).toFixed(2)
      console.log('Request body size:', sizeInMB, 'MB')
      
      if (bodyString.length > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json(
          { error: 'Request body too large. Please reduce the number or size of media files.' },
          { status: 413 }
        )
      }
    } catch (jsonError: any) {
      console.error('JSON parse error:', jsonError)
      
      // Check if it's a body size error
      if (jsonError?.message?.includes('body') || jsonError?.message?.includes('too large')) {
        return NextResponse.json(
          { error: 'Request body too large. Please reduce the number or size of media files.' },
          { status: 413 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: jsonError instanceof Error ? jsonError.message : 'Unknown error' },
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

    // Create the field
    const field = await prisma.field.create({
      data: {
        name: validatedData.name,
        sportType: validatedData.sportType,
        city: validatedData.city,
        address: validatedData.address,
        pricePerHour: validatedData.pricePerHour,
        workingHours: workingHours,
        media: media,
        ownerId: session.id,
        ratingAvg: 0,
        ratingCount: 0,
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
        { error: 'Forbidden: Only owners can create fields' },
        { status: 403 }
      )
    }
    // Check if it's a Prisma error (database schema issue)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Field with this name already exists' },
        { status: 400 }
      )
    }
    if (error?.code === 'P2012' || error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Database schema error. Please run: npx prisma migrate dev', details: error.message },
        { status: 500 }
      )
    }
    console.error('Error creating field:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

