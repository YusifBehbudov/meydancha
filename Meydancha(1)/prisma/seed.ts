import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@meydancha.com' },
    update: {},
    create: {
      email: 'admin@meydancha.com',
      password: adminPassword,
      name: 'Admin User',
      phoneNumber: '+994501234567',
      role: 'ADMIN',
      approved: true, // Admin is always approved
    },
  })

  // Create Owners (approved for seed data, but new registrations will be unapproved)
  const owner1Password = await bcrypt.hash('owner123', 10)
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@meydancha.com' },
    update: {},
    create: {
      email: 'owner1@meydancha.com',
      password: owner1Password,
      name: 'Field Owner 1',
      phoneNumber: '+994502345678',
      role: 'OWNER',
      approved: true, // Approved for seed data
      idVerificationStatus: 'APPROVED', // Approved for seed data
    },
  })

  const owner2Password = await bcrypt.hash('owner123', 10)
  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@meydancha.com' },
    update: {},
    create: {
      email: 'owner2@meydancha.com',
      password: owner2Password,
      name: 'Field Owner 2',
      phoneNumber: '+994503456789',
      role: 'OWNER',
      approved: true, // Approved for seed data
      idVerificationStatus: 'APPROVED', // Approved for seed data
    },
  })

  // Create Players (always approved)
  const player1Password = await bcrypt.hash('player123', 10)
  const player1 = await prisma.user.upsert({
    where: { email: 'player1@meydancha.com' },
    update: {},
    create: {
      email: 'player1@meydancha.com',
      password: player1Password,
      name: 'Player One',
      phoneNumber: '+994504567890',
      role: 'PLAYER',
      approved: true, // Players are always approved
    },
  })

  const player2Password = await bcrypt.hash('player123', 10)
  const player2 = await prisma.user.upsert({
    where: { email: 'player2@meydancha.com' },
    update: {},
    create: {
      email: 'player2@meydancha.com',
      password: player2Password,
      name: 'Player Two',
      phoneNumber: '+994505678901',
      role: 'PLAYER',
      approved: true, // Players are always approved
    },
  })

  const player3Password = await bcrypt.hash('player123', 10)
  const player3 = await prisma.user.upsert({
    where: { email: 'player3@meydancha.com' },
    update: {},
    create: {
      email: 'player3@meydancha.com',
      password: player3Password,
      name: 'Player Three',
      phoneNumber: '+994506789012',
      role: 'PLAYER',
      approved: true, // Players are always approved
    },
  })

  // Create Fields
  const fields = [
    {
      name: 'Greenfield Arena',
      sportType: 'football',
      city: 'Baku',
      address: '123 Sports Street',
      pricePerHour: 50,
      ownerId: owner1.id,
    },
    {
      name: 'City Court',
      sportType: 'basketball',
      city: 'Baku',
      address: '456 Court Avenue',
      pricePerHour: 60,
      ownerId: owner1.id,
    },
    {
      name: 'Lakeside Tennis',
      sportType: 'tennis',
      city: 'Baku',
      address: '789 Lake Road',
      pricePerHour: 45,
      ownerId: owner1.id,
    },
    {
      name: 'Chechp Bark',
      sportType: 'football',
      city: 'Baku',
      address: '321 Park Lane',
      pricePerHour: 55,
      ownerId: owner2.id,
    },
    {
      name: 'Charley St Game',
      sportType: 'basketball',
      city: 'Ganja',
      address: '654 Main Street',
      pricePerHour: 50,
      ownerId: owner2.id,
    },
    {
      name: 'Padel Pro Center',
      sportType: 'padel',
      city: 'Baku',
      address: '987 Center Boulevard',
      pricePerHour: 70,
      ownerId: owner1.id,
    },
    {
      name: 'Elite Football Field',
      sportType: 'football',
      city: 'Sumgait',
      address: '147 Elite Way',
      pricePerHour: 40,
      ownerId: owner2.id,
    },
    {
      name: 'Tennis Masters',
      sportType: 'tennis',
      city: 'Baku',
      address: '258 Masters Drive',
      pricePerHour: 65,
      ownerId: owner2.id,
    },
  ]

  const createdFields = []
  for (const fieldData of fields) {
    const field = await prisma.field.create({
      data: fieldData,
    })
    createdFields.push(field)
  }

  // Create Bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookings = [
    {
      fieldId: createdFields[0].id,
      userId: player1.id,
      date: new Date(today),
      startTime: '18:00',
      endTime: '20:00',
      totalPrice: 100,
      status: 'CONFIRMED',
    },
    {
      fieldId: createdFields[0].id,
      userId: player2.id,
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      startTime: '19:00',
      endTime: '21:00',
      totalPrice: 100,
      status: 'CONFIRMED',
    },
    {
      fieldId: createdFields[1].id,
      userId: player1.id,
      date: new Date(today),
      startTime: '17:00',
      endTime: '19:00',
      totalPrice: 120,
      status: 'CONFIRMED',
    },
  ]

  for (const bookingData of bookings) {
    await prisma.booking.create({
      data: bookingData,
    })
  }

  // Create Reviews
  const reviews = [
    {
      fieldId: createdFields[0].id,
      userId: player1.id,
      rating: 5,
      comment: 'Great field, well maintained!',
    },
    {
      fieldId: createdFields[0].id,
      userId: player2.id,
      rating: 4,
      comment: 'Good quality, would book again.',
    },
    {
      fieldId: createdFields[1].id,
      userId: player1.id,
      rating: 5,
      comment: 'Excellent facilities!',
    },
  ]

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData,
    })
  }

  // Update field ratings
  for (const field of createdFields) {
    const fieldReviews = await prisma.review.findMany({
      where: { fieldId: field.id },
      select: { rating: true },
    })

    if (fieldReviews.length > 0) {
      const ratingAvg = fieldReviews.reduce((sum, r) => sum + r.rating, 0) / fieldReviews.length
      await prisma.field.update({
        where: { id: field.id },
        data: {
          ratingAvg,
          ratingCount: fieldReviews.length,
        },
      })
    }
  }

  console.log('Seeding completed!')
  console.log('\nTest Credentials:')
  console.log('Admin: admin@meydancha.com / admin123')
  console.log('Owner: owner1@meydancha.com / owner123')
  console.log('Player: player1@meydancha.com / player123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

