import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { MotiView, AnimatePresence } from 'moti';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);
    const [fontsLoaded] = useFonts({
        'Gowun Batang': require('@expo-google-fonts/gowun-batang/400Regular/GowunBatang_400Regular.ttf'),
        'JetBrains Mono': require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
        'Pretendard': require('pretendard/dist/public/static/alternative/Pretendard-Regular.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            // Simulate theater lights dimming before showing the app
            setTimeout(() => {
                setIsReady(true);
                SplashScreen.hideAsync();
            }, 2500);
        }
    }, [fontsLoaded]);

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data.table === 'bucket_casts' && data.recordId) {
                router.push(`/archive/${data.recordId}`);
            }
        });

        return () => subscription.remove();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <StatusBar style="light" />

                <AnimatePresence>
                    {!isReady && (
                        <MotiView
                            key="splash"
                            from={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1500, type: 'timing' }}
                            style={[StyleSheet.absoluteFill, { backgroundColor: '#000', zIndex: 1000, justifyContent: 'center', alignItems: 'center' }]}
                        >
                            <MotiView
                                from={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1000, type: 'timing' }}
                                style={{ alignItems: 'center' }}
                            >
                                <Text style={{ color: '#C9A227', fontFamily: 'Gowun Batang', fontSize: 32, letterSpacing: 8 }}>EPOCH FILM</Text>
                                <Text style={{ color: '#C9A22733', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: 4, marginTop: 16 }}>THEATER OPENING...</Text>
                            </MotiView>
                        </MotiView>
                    )}
                </AnimatePresence>

                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#141210',
                        },
                        headerTintColor: '#C9A227',
                        headerTitleStyle: {
                            fontFamily: 'Gowun Batang',
                        },
                        contentStyle: {
                            backgroundColor: '#000000',
                        },
                    }}
                >
                    <Stack.Screen name="archive/index" options={{ title: 'ARCHIVE', headerShown: false }} />
                    <Stack.Screen name="archive/[id]/index" options={{ title: 'SCENE', headerShown: true }} />
                    <Stack.Screen name="archive/[id]/add" options={{ title: 'NEW', presentation: 'modal' }} />
                    <Stack.Screen name="profile/index" options={{ title: 'DIRECTOR', headerShown: false }} />
                    <Stack.Screen name="explore/index" options={{ title: 'EXPLORE', headerShown: false }} />
                </Stack>
                <MobileBottomNav />
            </View>
        </QueryClientProvider>
    );
}
