import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ComplaintsList from '@/components/admin/complaints-list'
import { AdminLogoutButton } from '@/components/admin-logout-button'

export default async function AdminComplaintsPage() {
  await requireRole('ADMIN')

  const complaints = await prisma.complaint.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
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
            <a href="/admin/users">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Users</button>
            </a>
            <a href="/admin/approvals">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Approvals</button>
            </a>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Complaints</h1>
        <ComplaintsList complaints={complaints} />
      </div>
    </div>
  )
}


