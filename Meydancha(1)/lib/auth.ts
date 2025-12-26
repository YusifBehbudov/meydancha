import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(
  email: string, 
  password: string, 
  name: string,
  phoneNumber: string,
  role: string = 'PLAYER',
  idVerificationPhoto?: string
) {
  const hashedPassword = await hashPassword(password)
  // OWNER role requires admin approval, others are auto-approved
  const approved = role !== 'OWNER'
  // OWNER role requires ID verification, starts as PENDING
  const idVerificationStatus = role === 'OWNER' ? 'PENDING' : 'APPROVED'
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      role,
      approved,
      idVerificationPhoto: role === 'OWNER' ? idVerificationPhoto : null,
      idVerificationStatus,
    },
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  // Check if OWNER is approved
  if (user.role === 'OWNER' && !user.approved) {
    throw new Error('Your account is pending approval. Please wait for admin approval.')
  }

  // Check if OWNER's ID is verified
  if (user.role === 'OWNER' && user.idVerificationStatus !== 'APPROVED') {
    if (user.idVerificationStatus === 'PENDING') {
      throw new Error('Your ID verification is pending. Please wait for admin to verify your ID photo.')
    }
    if (user.idVerificationStatus === 'REJECTED') {
      throw new Error('Your ID verification was rejected. Please contact support.')
    }
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

