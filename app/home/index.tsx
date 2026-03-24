import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { Profile, Quest, UserStats, Bucket } from '@/types';
import { MobileLifeDashboard } from '@/components/dashboard/MobileLifeDashboard';
import { MobileQuestList } from '@/components/dashboard/MobileQuestList';
import { MobileActionSlate } from '@/components/layout/MobileActionSlate';
import { Bell, Sparkles, Plus, Film } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { claimQuestReward } from '@/services/quest-service';

export default function HomeScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [myBuckets, setMyBuckets] = useState<Bucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isActionSlateOpen, setIsActionSlateOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile/Stats
            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setStats({
                    level: profileData.level || 1,
                    xp: profileData.xp || 0,
                    nextLevelXp: (profileData.level || 1) * 1000,
                    streak: 5,
                    completedDreams: 12, // Mock for now, should count achieved buckets
                    activeDreams: 3,     // Mock for now
                    followerCount: 0,
                    followingCount: 0
                });
            }

            // Fetch My Buckets (Recent)
            const { data: bucketData } = await supabase
                .from('buckets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);
            
            setMyBuckets(bucketData || []);

            // Mock Quests for now...
            setQuests([
                {
                    id: '1',
                    type: 'DAILY',
                    title: 'The Director\'s Eye',
                    title_ko: '감독의 시선',
                    description: '오늘의 장면 기록하기',
                    xp_reward: 100,
                    progress: 0,
                    requirement_count: 1,
                    is_completed: false
                },
                {
                    id: '2',
                    type: 'WEEKLY',
                    title: 'Cinema Enthusiast',
                    title_ko: '시네마 매니아',
                    description: '다른 감독의 장면 5개 감상하고 티켓 발행하기',
                    xp_reward: 500,
                    progress: 3,
                    requirement_count: 5,
                    is_completed: false
                }
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleClaimReward = async (questId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const result = await claimQuestReward(supabase, questId, user.id);
            if (result.success) {
                // Update local state for immediate feedback
                setStats(prev => prev ? { ...prev, level: result.newLevel, xp: result.newXp } : null);
                setQuests(prev => prev.map(q => q.id === questId ? { ...q, is_claimed: true } : q));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Reward claim error:', error);
            Alert.alert('오류', '보상 처리 중 문제가 발생했습니다.');
        }
    };

    const handleNewScene = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsActionSlateOpen(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#C9A227" size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            {/* Premium Custom Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>WELCOME BACK,</Text>
                    <Text style={styles.nameText}>{profile?.nickname || 'DIRECTOR'}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.bellButton}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                    <Bell color="#F7F2E9" size={24} />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C9A227" />
                }
            >
                {/* Dashboard Stats */}
                {stats && <MobileLifeDashboard userStats={stats} />}

                {/* My Recent Scenes Carousel */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MY PRODUCTIONS (RECENT)</Text>
                        <TouchableOpacity onPress={() => router.push('/archive')}>
                            <Text style={styles.viewAll}>VIEW ALL</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.carouselContent}
                    >
                        {myBuckets.map(bucket => (
                            <TouchableOpacity 
                                key={bucket.id} 
                                style={styles.bucketCard}
                                onPress={() => router.push(`/archive/${bucket.id}`)}
                            >
                                {bucket.thumbnail_url ? (
                                    <View style={styles.bucketImageContainer}>
                                        <Image source={{ uri: bucket.thumbnail_url }} style={styles.bucketImage} />
                                    </View>
                                ) : (
                                    <View style={[styles.bucketImageContainer, styles.placeholderBg]}>
                                        <Film color="rgba(201, 162, 39, 0.2)" size={40} />
                                    </View>
                                )}
                                <View style={styles.bucketInfo}>
                                    <Text style={styles.bucketTitle} numberOfLines={1}>{bucket.title}</Text>
                                    <Text style={styles.bucketCategory}>{bucket.category}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* AI Recommendation Highlight */}
                <TouchableOpacity 
                    style={styles.aiCard}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert('AI PRODUCTION', '이 시나리오대로 영화를 제작해볼까요?', [
                            { text: '나중에', style: 'cancel' },
                            { text: '좋아요!', onPress: () => router.push('/archive/new') }
                        ]);
                    }}
                >
                    <LinearGradient
                        colors={['rgba(78, 205, 196, 0.2)', 'rgba(78, 205, 196, 0.05)']}
                        style={styles.aiGradient}
                    />
                    <View style={styles.aiInfo}>
                        <Sparkles color="#4ECDC4" size={24} />
                        <View>
                            <Text style={styles.aiTitle}>AI SCENE PRODUCTION</Text>
                            <Text style={styles.aiDesc}>당신의 다음 에포크를 위한 새로운 시나리오가 제안되었습니다.</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Quests Section */}
                <MobileQuestList quests={quests} onClaim={handleClaimReward} />
            </ScrollView>

            {/* Floating Action Button for Adding New Scene */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={handleNewScene}
            >
                <Plus color="#000" size={32} />
            </TouchableOpacity>

            <MobileActionSlate 
                isOpen={isActionSlateOpen} 
                onComplete={() => {
                    setIsActionSlateOpen(false);
                    router.push('/archive/new');
                }} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    welcomeText: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    nameText: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bellButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C9A227',
        borderWidth: 2,
        borderColor: '#000',
    },
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    sectionTitle: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    viewAll: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: 1,
    },
    carouselContent: {
        paddingHorizontal: 24,
        gap: 16,
    },
    bucketCard: {
        width: 160,
        backgroundColor: '#141210',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    bucketImageContainer: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#000',
    },
    bucketImage: {
        width: '100%',
        height: '100%',
    },
    placeholderBg: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bucketInfo: {
        padding: 12,
        gap: 2,
    },
    bucketTitle: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 14,
    },
    bucketCategory: {
        color: 'rgba(201, 162, 39, 0.6)',
        fontFamily: 'JetBrains Mono',
        fontSize: 8,
        letterSpacing: 1,
    },
    scrollContent: {
        paddingBottom: 120, // Space for BottomNav
        gap: 32,
    },
    aiCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(78, 205, 196, 0.2)',
    },
    aiGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    aiInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    aiTitle: {
        color: '#4ECDC4',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 4,
    },
    aiDesc: {
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 11,
        lineHeight: 16,
        maxWidth: '90%',
    },
    fab: {
        position: 'absolute',
        bottom: 110, // Above bottom nav
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#C9A227',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C9A227',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    }
});
