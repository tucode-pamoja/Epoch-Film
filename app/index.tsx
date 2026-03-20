import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#C9A227" size="large" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/login" />;
    }

    return <Redirect href="/archive" />;
}
