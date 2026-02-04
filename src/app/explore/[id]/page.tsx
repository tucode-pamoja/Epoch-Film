import { redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ExploreDetailPageRedirect({ params }: PageProps) {
    const { id } = await params
    // Unified detail view is now at /archive/[id]
    redirect(`/archive/${id}`)
}
