'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export function useInfiniteScroll(
    fetchFn: (page: number) => Promise<any[]>,
    options = { pageSize: 12, initialItems: [] as any[] }
) {
    const [items, setItems] = useState<any[]>(options.initialItems || [])
    const [page, setPage] = useState(options.initialItems?.length ? 1 : 0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const loadingRef = useRef(false)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return

        loadingRef.current = true
        setLoading(true)

        try {
            const newItems = await fetchFn(page)
            if (newItems.length > 0) {
                setItems(prev => {
                    // Filter out items that are already in the list to prevent duplicate keys
                    const existingIds = new Set(prev.map(item => item.id))
                    const filteredNewItems = newItems.filter(item => !existingIds.has(item.id))
                    return [...prev, ...filteredNewItems]
                })
                setPage(prev => prev + 1)
            }
            setHasMore(newItems.length === options.pageSize)
        } catch (err) {
            console.error('Failed to load more items:', err)
            setHasMore(false)
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, [page, hasMore, fetchFn, options.pageSize])

    useEffect(() => {
        if (loadingRef.current) return

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        const currentLoadMoreRef = loadMoreRef.current
        if (currentLoadMoreRef) {
            observer.observe(currentLoadMoreRef)
        }

        return () => {
            if (currentLoadMoreRef) {
                observer.unobserve(currentLoadMoreRef)
            }
            observer.disconnect()
        }
    }, [loadMore, hasMore])

    return { items, setItems, loading, hasMore, loadMoreRef, setPage, setHasMore, loadingRef }
}
