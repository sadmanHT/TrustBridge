import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })

  if (existingUser) {
    console.log('✅ Test user already exists, skipping creation')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('Passw0rd!', 12)

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: Role.USER,
    }
  })

  console.log('✅ Test user created:')
  console.log('   Email: test@example.com')
  console.log('   Password: Passw0rd!')
  console.log('   Role: USER')
  console.log('   ID:', testUser.id)

  // Optionally create an admin user
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN }
  })

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('Admin123!', 12)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: Role.ADMIN,
      }
    })

    console.log('✅ Admin user created:')
    console.log('   Email: admin@example.com')
    console.log('   Password: Admin123!')
    console.log('   Role: ADMIN')
    console.log('   ID:', adminUser.id)
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })