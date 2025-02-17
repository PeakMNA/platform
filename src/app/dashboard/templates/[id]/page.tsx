import { Suspense } from 'react'
import { TemplateDetails } from '@/components/templates/template-details'

export default async function TemplateDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading template details...</div>}>
      <TemplateDetails templateId={params.id} />
    </Suspense>
  )
} 