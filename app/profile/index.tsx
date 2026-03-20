import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Telescope, Film, Users, Award, Ticket, LogOut } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/mobile';
import { Profile, UserStats, Bucket } from '@/types';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [userBuckets, setUserBuckets] = useState<Bucket[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
        fetchUserBuckets();
    }, []);

    async function fetchProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData) {
            setProfile(profileData);
            setStats({
                level: profileData.level || 1,
                xp: profileData.xp || 0,
                nextLevelXp: 1000,
                streak: 5,
                completedDreams: 12,
                activeDreams: 3,
                followerCount: 0,
                followingCount: 0
            });
        }
    }

    async function fetchUserBuckets() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('buckets')
            .select('*')
            .eq('user_id', user.id)
            .limit(3);
        
        if (data) setUserBuckets(data as Bucket[]);
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ 
                title: 'DIRECTOR PROFILE', 
                headerShown: true,
                headerRight: () => (
                    <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 16 }}>
                        <LogOut color="#C9A227" size={20} />
                    </TouchableOpacity>
                )
            }} />

            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {profile?.profile_image_url ? (
                        <Image source={{ uri: profile.profile_image_url }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Users color="#C9A227" size={40} />
                        </View>
                    )}
                    <View style={styles.badge}>
                        <Award color="#000" size={12} />
                    </View>
                </View>
                <Text style={styles.nickname}>{profile?.nickname || 'Anonymous Director'}</Text>
                <Text style={styles.introduction}>{profile?.introduction || '인생이라는 영화의 감독.'}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>LEVEL</Text>
                    <Text style={styles.statsValue}>{stats?.level}</Text>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>XP</Text>
                    <Text style={styles.statsValue}>{stats?.xp}</Text>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>DREAMS</Text>
                    <Text style={styles.statsValue}>{stats?.completedDreams}</Text>
                </View>
                <View style={[styles.statsCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Text style={styles.statsLabel}>TICKETS</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ticket size={14} color="#C9A227" />
                        <Text style={[styles.statsValue, { marginLeft: 4 }]}>{profile?.daily_tickets || 0}</Text>
                    </View>
                </View>
            </View>

            {/* Filmography Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Film color="#C9A227" size={18} />
                    <Text style={styles.sectionTitle}>FILMOGRAPHY</Text>
                </View>
                {userBuckets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Telescope color="#C9A22733" size={48} />
                        <Text style={styles.emptyText}>아직 개봉된 필름이 없습니다.</Text>
                    </View>
                ) : (
                    userBuckets.map(bucket => (
                        <TouchableOpacity 
                            key={bucket.id} 
                            style={styles.filmItem}
                            onPress={() => router.push(`/archive/${bucket.id}`)}
                        >
                            <Text style={styles.filmTitle}>{bucket.title}</Text>
                            <Text style={styles.filmMeta}>{bucket.category} • {bucket.status}</Text>
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
        backgroundColor: '#000000', // True Black for OLED
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#C9A227',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#141210',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C9A22733',
    },
    badge: {
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
    nickname: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    introduction: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '80%',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 40,
    },
    statsCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#141210',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#C9A2271A',
    },
    statsLabel: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 4,
    },
    statsValue: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#C9A22733',
        paddingBottom: 10,
    },
    sectionTitle: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        letterSpacing: 4,
    },
    emptyState: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#141210',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#C9A22733',
    },
    emptyText: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 12,
        marginTop: 16,
    },
    filmItem: {
        backgroundColor: '#141210',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A2271A',
        marginBottom: 12,
    },
    filmTitle: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 16,
        marginBottom: 4,
    },
    filmMeta: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    }
});

