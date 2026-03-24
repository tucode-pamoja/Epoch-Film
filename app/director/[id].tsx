import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { Profile, Bucket, Memory } from '@/types';
import { User, Film, Award, ChevronLeft, Grid, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { followDirectorService, unfollowDirectorService, checkFollowingStatus } from '@/services/SocialService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = SCREEN_WIDTH / 3;

export default function DirectorProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchDirectorData();
    }, [id]);

    const fetchDirectorData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // 1. Fetch User (Member)
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            
            if (profileError) throw profileError;
            setProfile(userData);

            // 2. Fetch Public Memories (Grid)
            const { data: memoryData } = await supabase
                .from('memories')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false });
            
            setMemories(memoryData || []);

            // 3. Fetch Public Buckets
            const { data: bucketData } = await supabase
                .from('buckets')
                .select('*')
                .eq('user_id', id)
                .eq('is_public', true)
                .order('created_at', { ascending: false });
            
            setBuckets(bucketData || []);

            // 4. Check Following Status
            if (user) {
                const following = await checkFollowingStatus(supabase, user.id, id as string);
                setIsFollowing(following);
            }

        } catch (error) {
            console.error('Error fetching director data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isFollowing) {
                await unfollowDirectorService(supabase, currentUser.id, id as string);
                setIsFollowing(false);
            } else {
                await followDirectorService(supabase, currentUser.id, id as string);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#C9A227" size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Stack.Screen options={{
                headerShown: true,
                headerTransparent: true,
                title: '',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft color="#F7F2E9" size={28} />
                    </TouchableOpacity>
                )
            }} />

            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.profileRow}>
                    <View style={styles.avatarContainer}>
                        {profile?.profile_image_url ? (
                            <Image source={{ uri: profile.profile_image_url }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <User size={40} color="#C9A227" />
                            </View>
                        )}
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{profile?.level || 1}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{memories.length}</Text>
                            <Text style={styles.statLabel}>SCENES</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{buckets.length}</Text>
                            <Text style={styles.statLabel}>FILMS</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.nickname}>{profile?.nickname || 'Unknown Director'}</Text>
                    <Text style={styles.bio}>{profile?.introduction || '인생이라는 영화를 제작 중인 감독입니다.'}</Text>
                </View>

                {currentUser?.id !== id && (
                    <TouchableOpacity 
                        style={[styles.followBtn, isFollowing && styles.followingBtn]}
                        onPress={handleFollow}
                    >
                        <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                            {isFollowing ? 'FOLLOWING' : 'FOLLOW DIRECTOR'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Instagram Style Grid */}
            <View style={styles.tabs}>
                <View style={[styles.tab, styles.activeTab]}>
                    <Grid color="#C9A227" size={20} />
                </View>
                <View style={styles.tab}>
                    <Globe color="#5C5552" size={20} />
                </View>
            </View>

            <View style={styles.grid}>
                {memories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Film color="rgba(201, 162, 39, 0.1)" size={64} />
                        <Text style={styles.emptyText}>아직 기록된 장면이 없습니다.</Text>
                    </View>
                ) : (
                    memories.map((memory) => (
                        <TouchableOpacity 
                            key={memory.id} 
                            style={styles.gridItem}
                            onPress={() => router.push(`/archive/${memory.bucket_id}`)}
                        >
                            {memory.media_url ? (
                                <Image source={{ uri: memory.media_url }} style={styles.gridImage} />
                            ) : (
                                <View style={styles.placeholderBg}>
                                    <Film color="#C9A22733" size={24} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingBottom: 60,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginTop: 40,
    },
    header: {
        paddingTop: 120,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#C9A227',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#141210',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.2)',
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#C9A227',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    levelText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: '#F7F2E9',
        fontFamily: 'JetBrains Mono',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 8,
        letterSpacing: 2,
        marginTop: 4,
    },
    infoSection: {
        marginBottom: 20,
    },
    nickname: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bio: {
        color: '#F7F2E9CC',
        fontFamily: 'Pretendard',
        fontSize: 13,
        lineHeight: 18,
    },
    followBtn: {
        backgroundColor: '#C9A227',
        height: 36,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#C9A227',
    },
    followBtnText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        fontWeight: 'bold',
    },
    followingBtnText: {
        color: '#C9A227',
    },
    tabs: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        marginTop: 10,
    },
    tab: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderTopWidth: 2,
        borderTopColor: '#C9A227',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH,
        padding: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    placeholderBg: {
        flex: 1,
        backgroundColor: '#141210',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        width: SCREEN_WIDTH,
        paddingVertical: 100,
        alignItems: 'center',
        opacity: 0.3,
    },
    emptyText: {
        color: '#C9A227',
        fontFamily: 'Pretendard',
        marginTop: 20,
    }
});
