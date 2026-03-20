import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Share, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { Bucket, Memory } from '@/types';
import { Camera, ArrowLeft, Star, Clock, Ticket, Share2, Copy, Plus, User as UserIcon } from 'lucide-react-native';
import { MotiView } from 'moti';
import { issueTicketService, remakeBucketService, checkFollowingStatus, followDirectorService, unfollowDirectorService } from '@/services/SocialService';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BucketDetailScreen() {
    const { id } = useLocalSearchParams();
    const [bucket, setBucket] = useState<Bucket | null>(null);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (id) fetchBucketDetails();
    }, [id]);

    async function fetchBucketDetails() {
        try {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setCurrentUserId(authUser?.id || null);

            const { data: bucketData } = await supabase
                .from('buckets')
                .select('*, users!user_id(nickname, profile_image_url)')
                .eq('id', id)
                .single();

            if (bucketData) {
                setBucket(bucketData);
                if (authUser && bucketData.user_id) {
                    const following = await checkFollowingStatus(supabase, authUser.id, bucketData.user_id);
                    setIsFollowing(following);
                }
                if (authUser) {
                   const { data: liked } = await supabase
                    .from('bucket_tickets')
                    .select('id')
                    .eq('bucket_id', id)
                    .eq('user_id', authUser.id)
                    .maybeSingle();
                   setIsLiked(!!liked);
                }
                const { data: memoryData } = await supabase
                    .from('memories')
                    .select('*')
                    .eq('bucket_id', id)
                    .order('created_at', { ascending: true });
                if (memoryData) setMemories(memoryData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleTicket = async () => {
        if (!currentUserId || !bucket) return;
        try {
            if (isLiked) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await issueTicketService(supabase, bucket.id, currentUserId);
            setIsLiked(true);
            setBucket({ ...bucket, tickets: (bucket.tickets || 0) + 1 });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemake = async () => {
        if (!currentUserId || !bucket) return;
        Alert.alert(
            "REMAKE SCENE",
            `이 장면을 당신의 아카이브로 가져오시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                { text: "가져오기", onPress: async () => {
                    try {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await remakeBucketService(supabase, bucket.id, currentUserId);
                        router.push('/archive');
                    } catch (error) {
                        console.error(error);
                    }
                }}
            ]
        );
    };

    const handleFollow = async () => {
        if (!currentUserId || !bucket?.user_id) return;
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isFollowing) {
                await unfollowDirectorService(supabase, currentUserId, bucket.user_id);
                setIsFollowing(false);
            } else {
                await followDirectorService(supabase, currentUserId, bucket.user_id);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleShare = async () => {
        if (!bucket) return;
        try {
            await Share.share({ message: `Check out this scene: ${bucket.title}\nhttps://epoch.film/archive/${bucket.id}` });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color="#C9A227" size="large" />
        </View>
    );

    if (!bucket) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>영화를 찾을 수 없습니다.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>돌아가기</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ 
                title: 'SCENE DETAILS', 
                headerShown: true,
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
                headerTintColor: '#F7F2E9',
                headerTitleStyle: { fontFamily: 'JetBrains Mono', fontSize: 13 },
                headerBackground: () => (
                    <LinearGradient colors={['rgba(0,0,0,0.9)', 'transparent']} style={StyleSheet.absoluteFill} />
                ),
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerIconWrapper}>
                        <ArrowLeft color="#F7F2E9" size={24} style={{ transform: [{ translateY: -2 }] }} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={handleShare} style={styles.headerIconWrapper}>
                        <Share2 color="#F7F2E9" size={22} style={{ transform: [{ translateY: -2 }] }} />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 180 + insets.bottom }}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    {bucket.thumbnail_url ? (
                        <Image source={{ uri: bucket.thumbnail_url }} style={styles.poster} />
                    ) : (
                        <View style={styles.posterPlaceholder}><Star color="#C9A22722" size={80} /></View>
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)', '#000']} style={styles.heroVignette} />
                    
                    <View style={styles.directorCard}>
                        <View style={styles.directorInfo}>
                            <View style={styles.avatarGlow}>
                                {bucket.users?.profile_image_url ? (
                                    <Image source={{ uri: bucket.users.profile_image_url }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}><UserIcon size={12} color="#C9A22766" style={{ transform: [{ translateY: -1 }] }} /></View>
                                )}
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={styles.directorName}>{bucket.users?.nickname || 'Unknown'}</Text>
                                <Text style={styles.directorRole}>DIRECTOR</Text>
                            </View>
                        </View>
                        {bucket.user_id !== currentUserId && (
                            <TouchableOpacity 
                                style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                                onPress={handleFollow}
                            >
                                <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                                    {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.mainContent}>
                    <View style={styles.tagRow}>
                        <Text style={styles.categoryTag}>{bucket.category || 'CINEMA'}</Text>
                        <View style={styles.tagDot} />
                        <Text style={styles.statusTag}>{bucket.status || 'ACTIVE'}</Text>
                    </View>

                    <Text style={styles.titleText}>{bucket.title}</Text>
                    {bucket.description && <Text style={styles.descriptionText}>"{bucket.description}"</Text>}

                    <View style={styles.statsPanel}>
                        <TouchableOpacity style={styles.statBox} onPress={handleTicket}>
                            <View style={styles.statIconCentered}>
                                <Ticket size={24} color={isLiked ? '#C9A227' : '#5C5552'} fill={isLiked ? '#C9A227' : 'transparent'} style={{ transform: [{ translateY: -2 }] }} />
                            </View>
                            <Text style={[styles.statNum, isLiked && { color: '#C9A227' }]}>{bucket.tickets || 0}</Text>
                            <Text style={styles.statTag}>ISSUED TICKETS</Text>
                        </TouchableOpacity>
                        <View style={styles.statLine} />
                        <View style={styles.statBox}>
                            <View style={styles.statIconCentered}>
                                <Copy size={20} color="#5C5552" style={{ transform: [{ translateY: -2 }] }} />
                            </View>
                            <Text style={styles.statNum}>{bucket.remake_count || 0}</Text>
                            <Text style={styles.statTag}>SCENE REMAKES</Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        {bucket.user_id !== currentUserId && (
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleRemake}>
                                <View style={styles.btnIconCentered}>
                                    <Plus color="#000" size={20} strokeWidth={3} style={{ transform: [{ translateY: -1 }] }} />
                                </View>
                                <Text style={styles.primaryBtnText}>REMAKE THIS SCENE</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.secondaryBtn, bucket.user_id === currentUserId && { backgroundColor: '#C9A227' }]} 
                            onPress={() => router.push(`/archive/${id}/add`)}
                        >
                            <View style={styles.btnIconCentered}>
                                <Camera color={bucket.user_id === currentUserId ? "#000" : "#C9A227"} size={20} style={{ transform: [{ translateY: -1 }] }} />
                            </View>
                            <Text style={[styles.secondaryBtnText, bucket.user_id === currentUserId && { color: '#000', fontWeight: '900' }]}>ADD MOMENT</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineHeader}>
                        <View style={styles.timelineBar} />
                        <Text style={styles.timelineTitle}>PRODUCTION LOGS</Text>
                    </View>
                    {memories.length === 0 ? (
                        <View style={styles.emptyTimeline}><Text style={styles.emptyLogsText}>아직 기록이 없습니다.</Text></View>
                    ) : (
                        memories.map((memory, i) => (
                            <View key={memory.id} style={styles.timelineItem}>
                                <View style={styles.timelineDot} />
                                <View style={styles.logCard}>
                                    <Text style={styles.logDate}>{new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                    {memory.media_url && <Image source={{ uri: memory.media_url }} style={styles.logImage} />}
                                    <Text style={styles.logCaption}>{memory.caption}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorText: { color: '#C9A227', fontFamily: 'Gowun Batang' },
    backButton: { marginTop: 20 },
    backButtonText: { color: '#C9A227', fontFamily: 'JetBrains Mono' },
    
    headerIconWrapper: { 
        width: 44, 
        height: 44, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    
    heroSection: { width: '100%', aspectRatio: 0.75, position: 'relative' },
    poster: { width: '100%', height: '100%', resizeMode: 'cover' },
    posterPlaceholder: { flex: 1, backgroundColor: '#0A0908', justifyContent: 'center', alignItems: 'center' },
    heroVignette: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
    
    directorCard: {
        position: 'absolute',
        bottom: -30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(20, 18, 16, 0.9)',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#C9A227',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    directorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarGlow: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#C9A22744', padding: 2 },
    avatar: { width: '100%', height: '100%', borderRadius: 18 },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    directorName: { color: '#F7F2E9', fontFamily: 'JetBrains Mono', fontSize: 13, letterSpacing: 1, marginBottom: 2 },
    directorRole: { color: '#C9A22788', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: 2 },
    
    followBtn: { 
        paddingHorizontal: 16, 
        height: 36, 
        borderRadius: 18, 
        borderWidth: 1, 
        borderColor: '#C9A227',
        justifyContent: 'center',
        alignItems: 'center'
    },
    followBtnActive: { backgroundColor: '#C9A227' },
    followBtnText: { color: '#C9A227', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold', transform: [{ translateY: -1 }] },
    followBtnTextActive: { color: '#000' },

    mainContent: { padding: 24, paddingTop: 60 },
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    categoryTag: { color: '#C9A227', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: 2 },
    tagDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#5C5552' },
    statusTag: { color: '#5C5552', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: 2 },
    
    titleText: { color: '#F7F2E9', fontFamily: 'Gowun Batang', fontSize: 36, lineHeight: 46, marginBottom: 16 },
    descriptionText: { color: '#888', fontFamily: 'Pretendard', fontSize: 16, lineHeight: 28, fontStyle: 'italic', marginBottom: 32 },
    
    statsPanel: { 
        flexDirection: 'row', 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 32 
    },
    statBox: { flex: 1, alignItems: 'center', gap: 6 },
    statIconCentered: { height: 32, justifyContent: 'center', alignItems: 'center' },
    statLine: { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 10 },
    statNum: { color: '#F7F2E9', fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 'bold' },
    statTag: { color: '#5C5552', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: 2, transform: [{ translateY: -1 }] },

    actionRow: { gap: 16 },
    primaryBtn: { 
        backgroundColor: '#C9A227', 
        height: 64, 
        borderRadius: 32, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 12,
        shadowColor: '#C9A227',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 }
    },
    btnIconCentered: { height: 20, justifyContent: 'center', alignItems: 'center' },
    primaryBtnText: { color: '#000', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: '900', transform: [{ translateY: -1 }] },
    secondaryBtn: { 
        height: 64, 
        borderRadius: 32, 
        borderWidth: 1, 
        borderColor: '#C9A22766', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 12 
    },
    secondaryBtnText: { color: '#C9A227', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 'bold', transform: [{ translateY: -1 }] },

    timelineContainer: { marginTop: 60, paddingHorizontal: 24 },
    timelineHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
    timelineBar: { width: 4, height: 16, backgroundColor: '#C9A227' },
    timelineTitle: { color: '#5C5552', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: 4 },
    timelineItem: { paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: '#222', paddingBottom: 40, position: 'relative' },
    timelineDot: { position: 'absolute', left: -5, top: 0, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#C9A227', shadowColor: '#C9A227', shadowOpacity: 0.8, shadowRadius: 5 },
    logCard: { backgroundColor: '#0A0908', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#111' },
    logDate: { color: '#C9A22766', fontFamily: 'JetBrains Mono', fontSize: 10, marginBottom: 12 },
    logImage: { width: '100%', aspectRatio: 1.5, borderRadius: 8, marginBottom: 16 },
    logCaption: { color: '#F7F2E9', fontFamily: 'Gowun Batang', fontSize: 16, lineHeight: 28 },
    emptyTimeline: { padding: 40, alignItems: 'center' },
    emptyLogsText: { color: '#333', fontFamily: 'Pretendard' }
});
