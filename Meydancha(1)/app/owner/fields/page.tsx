import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FieldsTable from '@/components/owner/fields-table'

export default async function OwnerFieldsPage() {
  const session = await requireRole('OWNER')

  const fields = await prisma.field.findMany({
    where: {
      ownerId: session.id,
    },
    include: {
      _count: {
        select: {
          bookings: true,
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
          <Link href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </Link>
          <div className="flex gap-4">
            <Link href="/owner/bookings">
              <Button variant="ghost">Bookings</Button>
            </Link>
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" type="submit">Logout</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Fields</h1>
          <Link href="/owner/fields/new">
            <Button>Add New Field</Button>
          </Link>
        </div>
        <FieldsTable fields={fields} />
      </div>
    </div>
  )
}


