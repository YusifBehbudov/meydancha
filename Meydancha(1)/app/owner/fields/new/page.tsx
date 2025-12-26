import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/session'
import FieldForm from '@/components/owner/field-form'

export default async function NewFieldPage() {
  await requireRole('OWNER')

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
        <h1 className="text-3xl font-bold mb-8">Add New Field</h1>
        <FieldForm />
      </div>
    </div>
  )
}


