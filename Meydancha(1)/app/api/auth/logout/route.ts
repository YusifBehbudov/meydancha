import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    
    // Return redirect response to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    // Even if there's an error, try to delete the cookie and redirect
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('userId')
    return response
  }
}
