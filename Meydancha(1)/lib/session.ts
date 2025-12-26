import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) return null
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })
  
  return user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: 'ADMIN' | 'OWNER' | 'PLAYER') {
  const session = await requireAuth()
  if (session.role !== role && session.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}


