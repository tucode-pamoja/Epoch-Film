import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Share } from 'react-native';
import { MotiView } from 'moti';
import { Ticket, Share2, User, Copy, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bucket } from '@/types';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MobileSceneCardProps {
    bucket: Bucket;
    isFocused: boolean;
    onPress?: () => void;
    onTicketPress?: () => void;
    onFollowPress?: () => void;
    onRemakePress?: () => void;
    onDirectorPress?: () => void;
    isFollowing?: boolean;
    isLiked?: boolean;
}

export default function MobileSceneCard({
    bucket,
    isFocused,
    onPress,
    onTicketPress,
    onFollowPress,
    onRemakePress,
    onDirectorPress,
    isFollowing,
    isLiked
}: MobileSceneCardProps) {
    const insets = useSafeAreaInsets();
    
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this scene: ${bucket.title}\nhttps://epoch.film/archive/${bucket.id}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {/* 1. Background Image Layer */}
            <View style={styles.imageContainer}>
                {bucket.thumbnail_url ? (
                    <Image 
                        source={{ uri: bucket.thumbnail_url }} 
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.avatarPlaceholderLarge}>
                         <Ticket size={120} color="rgba(201, 162, 39, 0.03)" style={{ transform: [{ rotate: '-15deg' }] }} />
                    </View>
                )}
                {/* Cinematic Overlays */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* 2. Content Layer */}
            <View style={[styles.content, { paddingTop: insets.top + 160, paddingBottom: 110 }]}>
                {/* 2.1 Header: Director Info */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.directorInfo} 
                        activeOpacity={0.7}
                        onPress={onDirectorPress}
                    >
                        <View style={styles.avatarBorder}>
                            {bucket.users?.profile_image_url ? (
                                <Image source={{ uri: bucket.users.profile_image_url }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <User size={12} color="#C9A22766" />
                                </View>
                            )}
                        </View>
                        <View style={styles.directorText}>
                            <Text style={styles.nickname}>{bucket.users?.nickname || 'Unknown Director'}</Text>
                            <Text style={styles.category}>{bucket.category || 'CINEMA'}</Text>
                        </View>
                    </TouchableOpacity>

                    {onFollowPress && (
                        <TouchableOpacity 
                            style={[styles.followButton, isFollowing && styles.followButtonActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onFollowPress();
                            }}
                        >
                            <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
                                {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 2.2 Center: Title & Description */}
                <TouchableOpacity style={styles.centerSection} onPress={onPress} activeOpacity={0.9}>
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: isFocused ? 1 : 0.4, translateY: isFocused ? 0 : 20 }}
                        transition={{ duration: 1000, type: 'timing' }}
                        style={{ alignItems: 'center' }}
                    >
                        <Text style={styles.title}>{bucket.title}</Text>
                        {bucket.description && (
                            <Text style={styles.description} numberOfLines={3}>
                                "{bucket.description}"
                            </Text>
                        )}
                    </MotiView>
                </TouchableOpacity>

                {/* 2.3 Footer: Stats & Actions */}
                <View style={styles.footer}>
                    <View style={styles.statsGroup}>
                        <TouchableOpacity 
                            style={styles.statItem}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                onTicketPress?.();
                            }}
                        >
                            <Ticket 
                                size={22} 
                                color={isLiked ? '#C9A227' : 'rgba(247, 242, 233, 0.7)'} 
                                fill={isLiked ? '#C9A227' : 'transparent'}
                            />
                            <Text style={[styles.statValue, isLiked && { color: '#C9A227' }]}>
                                {bucket.tickets || 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statItem} onPress={onRemakePress}>
                            <Copy size={20} color="rgba(247, 242, 233, 0.7)" />
                            <Text style={styles.statValue}>{bucket.remake_count || 0}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionGroup}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Share2 size={20} color="#F7F2E9CC" />
                        </TouchableOpacity>
                        
                        {onRemakePress && (
                            <TouchableOpacity 
                                style={styles.remakeMainButton}
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    onRemakePress?.();
                                }}
                            >
                                <Plus size={20} color="#000" strokeWidth={3} />
                                <Text style={styles.remakeButtonText}>REMAKE</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#000',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    avatarPlaceholderLarge: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#141210',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    directorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarBorder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.3)',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#141210',
        alignItems: 'center',
        justifyContent: 'center',
    },
    directorText: {
        gap: 2,
    },
    nickname: {
        color: '#F7F2E9',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
        letterSpacing: 1,
    },
    category: {
        color: 'rgba(201, 162, 39, 0.6)',
        fontFamily: 'JetBrains Mono',
        fontSize: 8,
        letterSpacing: 2,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#C9A227',
    },
    followButtonActive: {
        backgroundColor: '#C9A227',
    },
    followText: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    followTextActive: {
        color: '#000',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 34,
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
    },
    description: {
        color: 'rgba(201, 162, 39, 0.85)',
        fontFamily: 'Pretendard',
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 26,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    statsGroup: {
        gap: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statValue: {
        color: 'rgba(247, 242, 233, 0.8)',
        fontFamily: 'JetBrains Mono',
        fontSize: 15,
        fontWeight: 'bold',
    },
    actionGroup: {
        alignItems: 'flex-end',
        gap: 20,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    remakeMainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#C9A227',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: '#C9A227',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    remakeButtonText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
