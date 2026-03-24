import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Zap, Target, Film, Flame } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface MobileLifeDashboardProps {
    userStats: {
        level: number;
        xp: number;
        nextLevelXp: number;
        streak: number;
        completedDreams: number;
        activeDreams: number;
    }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MobileLifeDashboard({ userStats }: MobileLifeDashboardProps) {
    const xpPercentage = (userStats.xp / userStats.nextLevelXp) * 100;

    return (
        <View style={styles.container}>
            {/* Level & XP Card */}
            <View style={styles.levelCard}>
                <View style={styles.levelHeader}>
                    <View>
                        <Text style={styles.levelLabel}>DIRECTOR_LEVEL</Text>
                        <View style={styles.levelRow}>
                            <Text style={styles.levelValue}>{userStats.level}</Text>
                            <Text style={styles.levelTitle}>Master of Epochs</Text>
                        </View>
                    </View>
                    <Zap size={24} color="#C9A227" style={styles.zapIcon} />
                </View>

                <View style={styles.xpSection}>
                    <View style={styles.xpInfo}>
                        <Text style={styles.xpLabel}>경험치 (XP)</Text>
                        <Text style={styles.xpValue}>{userStats.xp} / {userStats.nextLevelXp} XP</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${xpPercentage}%` }]} />
                    </View>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon={<Flame color="#C9A227" size={18} />}
                    label="STREAK"
                    value={`${userStats.streak}일`}
                />
                <StatCard
                    icon={<Target color="#C9A227" size={18} />}
                    label="COMPLETED"
                    value={userStats.completedDreams}
                />
                <StatCard
                    icon={<Film color="#C9A227" size={18} />}
                    label="ACTIVE"
                    value={userStats.activeDreams}
                />
                <StatCard
                    icon={<Zap color="#C9A227" size={18} />}
                    label="TOTAL XP"
                    value={userStats.xp}
                />
            </View>
        </View>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statTop}>
                {icon}
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        gap: 20,
    },
    levelCard: {
        padding: 24,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.2)',
        backgroundColor: '#141210',
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    levelLabel: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 3,
        marginBottom: 8,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
    },
    levelValue: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 48,
        lineHeight: 56,
    },
    levelTitle: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    zapIcon: {
        opacity: 0.2,
    },
    xpSection: {
        gap: 8,
    },
    xpInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    xpLabel: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: 1,
    },
    xpValue: {
        color: '#F7F2E9',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#C9A227',
        borderRadius: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2, // 2 columns with gaps
        backgroundColor: '#141210',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.05)',
        minHeight: 100,
        justifyContent: 'center',
    },
    statTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statLabel: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 8,
        letterSpacing: 1,
    },
    statValue: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
