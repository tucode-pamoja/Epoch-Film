import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { MobileCinematicTimeline } from '@/components/buckets/MobileCinematicTimeline';
import { supabase } from '@/utils/supabase/mobile';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function ArchiveScreen() {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Stack.Screen options={{ 
                title: 'ARCHIVE', 
                headerShown: true,
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
                headerTintColor: '#C9A227',
                headerTitleStyle: { fontFamily: 'JetBrains Mono', fontSize: 13 },
                headerBackground: () => (
                    <LinearGradient colors={['rgba(0,0,0,0.9)', 'transparent']} style={StyleSheet.absoluteFill} />
                )
            }} />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#C9A227" />
                </View>
            ) : (
                <MobileCinematicTimeline 
                    buckets={buckets} 
                    onBucketPress={(id) => router.push(`/archive/${id}`)}
                />
            )}

        </View>
    );
}
