import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Telescope, TrendingUp, Sparkles, Star } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/mobile';
import { Bucket } from '@/types';
import { clsx } from 'clsx';

export default function ExploreScreen() {
    const [trendingBuckets, setTrendingBuckets] = useState<Bucket[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTrending();
    }, []);

    async function fetchTrending() {
        const { data, error } = await supabase
            .from('buckets')
            .select(`
                *,
                users!user_id(nickname, profile_image_url)
            `)
            .eq('is_public', true)
            .order('tickets', { ascending: false })
            .limit(10);

        if (data) setTrendingBuckets(data);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'EXPLORE', headerShown: true }} />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#C9A22766" size={18} />
                    <TextInput
                        placeholder="영화 같은 꿈을 검색하세요"
                        placeholderTextColor="#5C5552"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Sparkles color="#C9A227" size={18} />
                        <Text style={styles.sectionTitle}>GENRES</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {['TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'HEALTH', 'CULTURE', 'FOOD'].map(cat => (
                            <TouchableOpacity key={cat} style={styles.genreCard}>
                                <Text style={styles.genreText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Trending Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TrendingUp color="#C9A227" size={18} />
                        <Text style={styles.sectionTitle}>TRENDING NOW</Text>
                    </View>

                    {trendingBuckets.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Telescope color="#C9A22733" size={48} />
                            <Text style={styles.emptyText}>트렌딩 필름을 찾는 중입니다...</Text>
                        </View>
                    ) : (
                        trendingBuckets.map((bucket) => (
                            <TouchableOpacity key={bucket.id} style={styles.bucketCard}>
                                <View style={styles.bucketInfo}>
                                    <Text style={styles.bucketTitle}>{bucket.title}</Text>
                                    <View style={styles.directorInfo}>
                                        <Text style={styles.directorName}>by {bucket.users?.nickname}</Text>
                                        <View style={styles.ticketInfo}>
                                            <Star size={12} color="#C9A227" fill="#C9A227" />
                                            <Text style={styles.ticketCount}>{bucket.tickets}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    searchContainer: {
        padding: 20,
        backgroundColor: '#0A0908',
        borderBottomWidth: 1,
        borderBottomColor: '#C9A2271A',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141210',
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 44,
        borderWidth: 1,
        borderColor: '#C9A22733',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        letterSpacing: 4,
    },
    genreCard: {
        backgroundColor: '#141210',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C9A22733',
        marginRight: 10,
    },
    genreText: {
        color: '#E8D5A3',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    bucketCard: {
        backgroundColor: '#141210',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#C9A2271A',
    },
    bucketInfo: {
        padding: 16,
    },
    bucketTitle: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 18,
        marginBottom: 8,
    },
    directorInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    directorName: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 12,
    },
    ticketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ticketCount: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
    },
    emptyState: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#141210',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C9A22733',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 12,
        marginTop: 12,
    }
});
