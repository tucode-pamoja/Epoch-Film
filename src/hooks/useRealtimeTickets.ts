import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/mobile';

export function useRealtimeTickets(bucketId: string, initialTickets: number) {
    const [tickets, setTickets] = useState(initialTickets);

    useEffect(() => {
        if (!bucketId) return;

        // Subscribe to changes in the 'buckets' table for this specific ID
        const channel = supabase
            .channel(`bucket-tickets-${bucketId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'buckets',
                    filter: `id=eq.${bucketId}`,
                },
                (payload) => {
                    if (payload.new && payload.new.tickets !== undefined) {
                        setTickets(payload.new.tickets);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bucketId]);

    return tickets;
}
