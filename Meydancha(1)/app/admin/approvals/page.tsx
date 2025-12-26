import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import UsersTable from '@/components/admin/users-table'
import { AdminLogoutButton } from '@/components/admin-logout-button'
import Link from 'next/link'

export default async function AdminApprovalsPage() {
  await requireRole('ADMIN')

  // Get only OWNER users who need approval (pending ID verification or account approval)
  const users = await prisma.user.findMany({
    where: {
      role: 'OWNER',
      OR: [
        { idVerificationStatus: 'PENDING' },
        { approved: false },
      ],
    },
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
          <Link href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </Link>
          <div className="flex gap-4">
            <Link href="/admin/users">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">All Users</button>
            </Link>
            <Link href="/admin/complaints">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Complaints</button>
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Pending Approvals</h1>
        <p className="text-gray-600 mb-8">
          Review and approve owner accounts. ID verification must be approved before account approval.
        </p>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pending approvals</p>
            <p className="text-gray-400 text-sm mt-2">All owner accounts have been processed</p>
          </div>
        ) : (
          <UsersTable users={users} />
        )}
      </div>
    </div>
  )
}

