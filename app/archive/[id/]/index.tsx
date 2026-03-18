import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Camera, Plus, Star, MapPin, Calendar, Clock } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/mobile';
import { Bucket, Memory } from '@/types';
import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';

export default function BucketDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [bucket, setBucket] = useState<Bucket | null>(null);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);

    const realtimeTickets = useRealtimeTickets(id as string, bucket?.tickets || 0);

    useEffect(() => {
        if (id) {
            fetchBucketDetails();
            fetchMemories();
        }
    }, [id]);

    async function fetchBucketDetails() {
        const { data, error } = await supabase
            .from('buckets')
            .select('*')
            .eq('id', id)
            .single();

        if (data) setBucket(data);
    }

    async function fetchMemories() {
        const { data, error } = await supabase
            .from('memories')
            .select('*')
            .eq('bucket_id', id)
            .order('captured_at', { ascending: false });

        if (data) setMemories(data);
        setLoading(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#C9A227" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: bucket?.title || 'SCENE',
                headerShown: true,
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#C9A227'
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Bucket Info */}
                <View style={styles.heroSection}>
                    {bucket?.thumbnail_url && (
                        <Image source={{ uri: bucket.thumbnail_url }} style={styles.heroImage} />
                    )}
                    <View style={styles.heroOverlay}>
                        <Text style={styles.category}>{bucket?.category}</Text>
                        <Text style={styles.title}>{bucket?.title}</Text>
                        <View style={styles.ticketRow}>
                            <Star size={16} color="#C9A227" fill="#C9A227" />
                            <Text style={styles.ticketCount}>{realtimeTickets}</Text>
                        </View>
                    </View>
                </View>

                {/* Memories Timeline */}
                <View style={styles.timelineSection}>
                    <View style={styles.sectionHeader}>
                        <Camera color="#C9A227" size={20} />
                        <Text style={styles.sectionTitle}>MEMORIES</Text>
                    </View>

                    {memories.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>아카이브된 추억이 없습니다.</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => router.push(`/archive/${id}/add`)}
                            >
                                <Plus color="#000" size={20} />
                                <Text style={styles.addButtonText}>첫 기록 남기기</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        memories.map((memory) => (
                            <View key={memory.id} style={styles.memoryCard}>
                                {memory.media_url && (
                                    <Image source={{ uri: memory.media_url }} style={styles.memoryImage} />
                                )}
                                <View style={styles.memoryInfo}>
                                    <Text style={styles.memoryCaption}>{memory.caption}</Text>
                                    <View style={styles.memoryMeta}>
                                        <View style={styles.metaItem}>
                                            <Calendar size={10} color="#5C5552" />
                                            <Text style={styles.metaText}>
                                                {new Date(memory.captured_at || memory.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {memory.location_lat && (
                                            <View style={styles.metaItem}>
                                                <MapPin size={10} color="#5C5552" />
                                                <Text style={styles.metaText}>LOCATION</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push(`/archive/${id}/add`)}
            >
                <Plus color="#000" size={30} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    content: {
        paddingBottom: 100,
    },
    heroSection: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    category: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
        letterSpacing: 4,
        marginBottom: 8,
    },
    title: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ticketCount: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 16,
    },
    timelineSection: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#C9A22733',
        paddingBottom: 12,
    },
    sectionTitle: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        letterSpacing: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: '#141210',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#C9A22733',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 14,
        marginBottom: 24,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A227',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    addButtonText: {
        color: '#000',
        fontFamily: 'Pretendard',
        fontSize: 14,
        fontWeight: 'bold',
    },
    memoryCard: {
        backgroundColor: '#141210',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#C9A2271A',
    },
    memoryImage: {
        width: '100%',
        height: 200,
    },
    memoryInfo: {
        padding: 16,
    },
    memoryCaption: {
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    memoryMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#C9A227',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
