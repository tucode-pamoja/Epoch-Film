'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export function useInfiniteScroll(
    fetchFn: (page: number) => Promise<any[]>,
    options = { pageSize: 12 }
) {
    const [items, setItems] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return
        setLoading(true)
        try {
            const newItems = await fetchFn(page)
            if (newItems.length > 0) {
                setItems(prev => [...prev, ...newItems])
                setPage(prev => prev + 1)
            }
            setHasMore(newItems.length === options.pageSize)
        } catch (err) {
            console.error('Failed to load more items:', err)
            setHasMore(false)
        } finally {
            setLoading(false)
        }
    }, [page, loading, hasMore, fetchFn, options.pageSize])

    useEffect(() => {
        if (loading) return

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        observerRef.current = observer

        return () => observer.disconnect()
    }, [loadMore, hasMore, loading])

    return { items, setItems, loading, hasMore, loadMoreRef, setPage, setHasMore }
}
