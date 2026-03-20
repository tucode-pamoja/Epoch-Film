import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { Star } from 'lucide-react-native';
import { Bucket } from '@/types';
import * as Haptics from 'expo-haptics';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MobileCinematicTimelineProps {
    buckets: Bucket[];
    onBucketPress?: (id: string) => void;
}

type ViewMode = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';

export function MobileCinematicTimeline({ buckets, onBucketPress }: MobileCinematicTimelineProps) {
    const { tier } = usePerformanceMonitor();
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('DAY');
    const [activeId, setActiveId] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);
    const lastTriggeredIndex = useRef<number>(-1);
    const hasInitialized = useRef(false);
    const insets = useSafeAreaInsets();

    const categories = ['ALL', 'TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'HEALTH', 'CULTURE', 'FOOD', 'OTHER'];

    const baseFilteredBuckets = useMemo(() => {
        return buckets
            .filter(b => selectedCategory === 'ALL' || b.category === selectedCategory)
            .sort((a, b) =>
                new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
            );
    }, [buckets, selectedCategory]);

    const timelineData = useMemo(() => {
        if (viewMode === 'YEAR') {
            const years: Record<number, Bucket[]> = {};
            baseFilteredBuckets.forEach(b => {
                const year = new Date(b.updated_at || b.created_at).getFullYear();
                if (!years[year]) years[year] = [];
                years[year].push(b);
            });
            return Object.entries(years).map(([year, items]) => ({
                id: year,
                label: year,
                items,
                bucket: items[0],
                date: new Date(parseInt(year), 0, 1)
            }));
        }

        if (viewMode === 'MONTH') {
            const months: Record<string, Bucket[]> = {};
            baseFilteredBuckets.forEach(b => {
                const d = new Date(b.updated_at || b.created_at);
                const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                if (!months[key]) months[key] = [];
                months[key].push(b);
            });
            return Object.entries(months).map(([key, items]) => ({
                id: key,
                label: key.replace('-', '.'),
                items,
                bucket: items[0],
                date: items[0] ? new Date(items[0].updated_at || items[0].created_at) : new Date()
            }));
        }

        return baseFilteredBuckets.map(b => ({
            id: b.id,
            label: `${new Date(b.updated_at || b.created_at).getFullYear()}.${new Date(b.updated_at || b.created_at).getMonth() + 1}`,
            items: [b],
            bucket: b,
            date: new Date(b.updated_at || b.created_at)
        }));
    }, [baseFilteredBuckets, viewMode]);

    useEffect(() => {
        if (timelineData.length > 0 && !hasInitialized.current) {
            setActiveId(timelineData[0].id);
            hasInitialized.current = true;
        }
    }, [timelineData]);

    const handleScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const itemWidth = 240;
        const index = Math.round(x / itemWidth);

        const activeNode = timelineData[index];

        if (index !== lastTriggeredIndex.current) {
            Haptics.selectionAsync();
            lastTriggeredIndex.current = index;
        }

        if (activeNode && activeNode.id !== activeId) {
            setActiveId(activeNode.id);
        }
    };

    if (buckets.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Star color="#C9A22733" size={32} />
                </View>
                <Text style={styles.emptySceneText}>SCENE 1: THE BEGINNING</Text>
                <Text style={styles.emptyTitleText}>모든 훌륭한 영화는 빈 시나리오에서 시작됩니다.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HUD Controls */}
            <View style={[styles.hudContainer, { paddingTop: insets.top + 60 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedCategory(cat);
                                scrollRef.current?.scrollTo({ x: 0, animated: true });
                            }}
                            style={[
                                styles.categoryButton,
                                selectedCategory === cat ? styles.categoryButtonActive : styles.categoryButtonInactive
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat ? styles.categoryTextActive : styles.categoryTextInactive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>

            {/* Timeline Scroll */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SCREEN_WIDTH / 2 - 120 }}
                style={styles.timelineScroll}
                snapToInterval={240}
                snapToAlignment="start" // Start of the interval (which is centered because of padding)
                decelerationRate="fast"
            >
                {timelineData.map((node, index) => {
                    const isActive = activeId === node.id;
                    return (
                        <View key={node.id} style={styles.nodeContainer}>
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (isActive && node.bucket?.id && onBucketPress) {
                                        onBucketPress(node.bucket.id);
                                    } else {
                                        // If not active, clicking jumps to it
                                        setActiveId(node.id);
                                        scrollRef.current?.scrollTo({ x: index * 240, animated: true });
                                    }
                                }}
                            >
                                <MotiView
                                    from={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: isActive ? 1 : 0.4,
                                        scale: isActive ? 1 : 0.9,
                                    }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    style={styles.nodeContent}
                                >
                                    <Text style={[styles.nodeLabel, isActive && styles.nodeLabelActive]}>
                                        {node.label}
                                    </Text>

                                    <View style={[styles.nodeDot, isActive ? styles.nodeDotActive : styles.nodeDotInactive]} />

                                    {isActive && (
                                        <MotiView
                                            from={{ opacity: 0, translateY: 20 }}
                                            animate={{ opacity: 1, translateY: 0 }}
                                            style={styles.activeDetails}
                                        >
                                            {node.bucket?.thumbnail_url && tier !== 'LOW' && (
                                                <Image
                                                    source={{ uri: node.bucket.thumbnail_url }}
                                                    style={styles.nodeImage}
                                                />
                                            )}
                                            <Text style={styles.nodeTitle}>{node.bucket?.title}</Text>
                                            <Text style={styles.nodeCategory}>{node.bucket?.category}</Text>
                                        </MotiView>
                                    )}
                                </MotiView>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#000',
    },
    emptyIcon: {
        width: 80,
        height: 112,
        backgroundColor: '#141210',
        borderColor: 'rgba(201, 162, 39, 0.3)',
        borderWidth: 1,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#C9A227',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    emptySceneText: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 4,
        marginBottom: 8,
    },
    emptyTitleText: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
    },
    hudContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        zIndex: 30,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    categoryButtonActive: {
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        borderColor: 'rgba(78, 205, 196, 0.3)',
    },
    categoryButtonInactive: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    categoryText: {
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
    },
    categoryTextActive: {
        color: '#4ECDC4',
    },
    categoryTextInactive: {
        color: 'rgba(173, 166, 158, 0.4)',
    },
    timelineScroll: {
        flex: 1,
    },
    nodeContainer: {
        width: 240,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nodeContent: {
        alignItems: 'center',
    },
    nodeLabel: {
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 8,
        color: 'rgba(173, 166, 158, 0.4)',
    },
    nodeLabelActive: {
        color: '#4ECDC4',
    },
    nodeDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        marginBottom: 16,
    },
    nodeDotActive: {
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
    },
    nodeDotInactive: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#000',
    },
    activeDetails: {
        alignItems: 'center',
        width: 192,
    },
    nodeImage: {
        width: 128,
        height: 176,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 16,
    },
    nodeTitle: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 18,
        textAlign: 'center',
    },
    nodeCategory: {
        color: 'rgba(78, 205, 196, 0.6)',
        fontFamily: 'JetBrains Mono',
        fontSize: 8,
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
