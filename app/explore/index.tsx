import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ViewToken, ActivityIndicator, TextInput, RefreshControl, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, X, Sparkles, User, RefreshCw, Telescope } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/mobile';
import { Bucket } from '@/types';
import MobileSceneCard from '../../src/components/buckets/MobileSceneCard';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import * as Haptics from 'expo-haptics';
import { issueTicketService, remakeBucketService, followDirectorService, unfollowDirectorService, checkFollowingStatus } from '../../src/services/SocialService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'HEALTH', 'WEALTH', 'CREATIVE'];

export default function ExploreScreen() {
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
    const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    const router = useRouter();
    const insets = useSafeAreaInsets();
    usePerformanceMonitor();

    useEffect(() => {
        getCurrentUser();
        fetchBuckets();
    }, []);

    async function getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        return user;
    }

    async function fetchBuckets(isRefreshing = false) {
        try {
            if (isRefreshing) setRefreshing(true);
            else setLoading(true);

            let query = supabase
                .from('buckets')
                .select('*, users!user_id(nickname, profile_image_url)')
                .eq('is_public', true)
                .order('tickets', { ascending: false })
                .limit(30);

            if (searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }
            if (selectedCategory !== 'ALL') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            setBuckets(data || []);

            // Fetch liked status and following status if logged in
            if (data && data.length > 0) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Likes
                    const { data: likes } = await supabase
                        .from('bucket_tickets')
                        .select('bucket_id')
                        .eq('user_id', user.id)
                        .in('bucket_id', data.map(b => b.id));
                    
                    const lMap: Record<string, boolean> = {};
                    likes?.forEach(l => lMap[l.bucket_id] = true);
                    setLikedMap(lMap);

                    // Following
                    const uniqueDirectorIds = [...new Set(data.map(b => b.user_id))].filter(Boolean) as string[];
                    const fMap: Record<string, boolean> = {};
                    for (const dId of uniqueDirectorIds) {
                        fMap[dId] = await checkFollowingStatus(supabase, user.id, dId);
                    }
                    setFollowingMap(fMap);
                }
            }

        } catch (error) {
            console.error('Error fetching explore buckets:', error);
        } finally {
            setLoading(false);
            setRefreshing(true); // Wait, should be false
            setRefreshing(false);
        }
    }

    const handleSearch = () => {
        fetchBuckets();
    };

    const handleTicketPress = async (bucket: Bucket) => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            if (likedMap[bucket.id]) return; // Already liked

            await issueTicketService(supabase, bucket.id, currentUser.id);
            setLikedMap(prev => ({ ...prev, [bucket.id]: true }));
            
            // Optimistic update for UI
            setBuckets(prev => prev.map(b => 
                b.id === bucket.id ? { ...b, tickets: (b.tickets || 0) + 1 } : b
            ));
        } catch (error) {
            console.error('Ticket error:', error);
        }
    };

    const handleFollowPress = async (directorId: string) => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            const isFollowing = followingMap[directorId];
            if (isFollowing) {
                await unfollowDirectorService(supabase, currentUser.id, directorId);
                setFollowingMap(prev => ({ ...prev, [directorId]: false }));
            } else {
                await followDirectorService(supabase, currentUser.id, directorId);
                setFollowingMap(prev => ({ ...prev, [directorId]: true }));
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const [viewableItems, setViewableItems] = useState<string[]>([]);
    const onViewableItemsChanged = useRef(({ viewableItems: vItems }: any) => {
        setViewableItems(vItems.map((item: any) => item.key));
    }).current;

    const renderItem = useCallback(({ item }: { item: Bucket }) => (
        <MobileSceneCard 
            bucket={item}
            isFocused={viewableItems.includes(item.id)}
            onPress={() => router.push(`/explore/${item.id}`)}
            onTicketPress={() => handleTicketPress(item)}
            onFollowPress={currentUser?.id !== item.user_id ? () => handleFollowPress(item.user_id) : undefined}
            onRemakePress={currentUser?.id !== item.user_id ? async () => {
                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                Alert.alert(
                    "REMAKE SCENE",
                    `이 장면을 당신의 아카이브로 가져오시겠습니까?`,
                    [
                        { text: "취소", style: "cancel" },
                        { text: "가져오기", onPress: async () => {
                            try {
                                await remakeBucketService(supabase, item.id, currentUser.id);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                router.push('/archive');
                            } catch (error) {
                                console.error('Remake error:', error);
                            }
                        }}
                    ]
                );
            } : undefined}
            onDirectorPress={() => router.push(`/director/${item.user_id}`)}
            isLiked={likedMap[item.id]}
            isFollowing={followingMap[item.user_id]}
        />
    ), [viewableItems, likedMap, followingMap, currentUser]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Overlaid Header */}
            <View style={[styles.overlayHeader, { paddingTop: insets.top + 10 }]}>
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.5)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />
                
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search color="#C9A227" size={18} />
                    <TextInput 
                        placeholder="영화 같은 이야기를 발견하세요"
                        placeholderTextColor="rgba(201, 162, 39, 0.4)"
                        style={styles.searchInput}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchTerm ? (
                        <TouchableOpacity onPress={() => { setSearchTerm(''); fetchBuckets(); }}>
                            <X color="#C9A22766" size={18} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Categories */}
                <FlatList 
                    horizontal
                    data={categories}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedCategory(item);
                                fetchBuckets();
                            }}
                            style={[styles.categoryBtn, selectedCategory === item && styles.categoryBtnActive]}
                        >
                            <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#C9A227" size="large" />
                    <Text style={styles.loadingText}>PRODUCING DISCOVERY...</Text>
                </View>
            ) : buckets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Telescope color="#C9A22733" size={64} />
                    <Text style={styles.emptyTitle}>NO SCREENINGS FOUND</Text>
                    <Text style={styles.emptySubtitle}>다른 검색어나 장르를 선택해 보세요.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBuckets()}>
                        <RefreshCw size={16} color="#000" />
                        <Text style={styles.retryBtnText}>RETRY</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList 
                    data={buckets}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    initialNumToRender={2}
                    windowSize={5}
                    onRefresh={() => fetchBuckets(true)}
                    refreshing={refreshing}
                    snapToAlignment="start"
                    snapToInterval={SCREEN_HEIGHT}
                    decelerationRate="fast"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlayHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 18, 16, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.2)',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 14,
        marginLeft: 10,
    },
    categoryList: {
        paddingRight: 20,
        gap: 8,
    },
    categoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(201, 162, 39, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.1)',
    },
    categoryBtnActive: {
        backgroundColor: 'rgba(201, 162, 39, 0.2)',
        borderColor: '#C9A227',
    },
    categoryText: {
        color: 'rgba(201, 162, 39, 0.6)',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    categoryTextActive: {
        color: '#C9A227',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        marginTop: 20,
        letterSpacing: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 18,
        marginTop: 24,
        letterSpacing: 4,
    },
    emptySubtitle: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        marginTop: 12,
        textAlign: 'center',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A227',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 32,
        gap: 8,
    },
    retryBtnText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontWeight: 'bold',
    },
});
