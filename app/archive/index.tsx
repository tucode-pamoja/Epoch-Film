import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { MobileCinematicTimeline } from '@/components/buckets/MobileCinematicTimeline';
import { supabase } from '@/utils/supabase/mobile';
import { Stack } from 'expo-router';

export default function ArchiveScreen() {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBuckets();
    }, []);

    async function fetchBuckets() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('buckets')
                .select(`
                    *,
                    users!user_id(nickname, profile_image_url)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setBuckets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0908' }}>
            <Stack.Screen options={{ title: 'ARCHIVE', headerShown: true }} />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#C9A227" />
                </View>
            ) : (
                <MobileCinematicTimeline buckets={buckets} />
            )}
        </View>
    );
}
