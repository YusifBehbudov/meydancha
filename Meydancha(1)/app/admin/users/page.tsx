import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import UsersTable from '@/components/admin/users-table'
import { AdminLogoutButton } from '@/components/admin-logout-button'

export default async function AdminUsersPage() {
  await requireRole('ADMIN')

  const session = await requireRole('ADMIN')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      approved: true,
      idVerificationPhoto: true,
      idVerificationStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </a>
          <div className="flex gap-4">
            <a href="/admin/approvals">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Approvals</button>
            </a>
            <a href="/admin/complaints">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Complaints</button>
            </a>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Users</h1>
        <UsersTable users={users} currentAdminId={session.id} />
      </div>
    </div>
  )
}


