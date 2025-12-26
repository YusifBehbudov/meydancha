import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import FieldForm from '@/components/owner/field-form'

export default async function EditFieldPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireRole('OWNER')

  const field = await prisma.field.findUnique({
    where: { id },
  })

  if (!field) {
    notFound()
  }

  if (field.ownerId !== session.id && session.role !== 'ADMIN') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            MEYDANCHA
          </a>
          <div className="flex gap-4">
            <a href="/owner/fields">
              <button className="px-4 py-2 text-gray-700 hover:text-gray-900">Back to Fields</button>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Field</h1>
        <FieldForm fieldId={id} initialData={field} />
      </div>
    </div>
  )
}

