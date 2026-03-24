import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, Circle, Star, Award, Clapperboard } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Quest } from '@/types';
import * as Haptics from 'expo-haptics';

interface MobileQuestListProps {
    quests: Quest[];
    onClaim?: (questId: string) => void;
}

export function MobileQuestList({ quests, onClaim }: MobileQuestListProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Award color="#C9A227" size={16} />
                <Text style={styles.headerTitle}>수행 중인 미션 (ACTIVE_QUESTS)</Text>
                <View style={styles.divider} />
            </View>

            <View style={styles.grid}>
                {quests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} onClaim={onClaim} />
                ))}
            </View>

            {quests.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Clapperboard color="#5C5552" size={32} />
                    <Text style={styles.emptyLabel}>MISSION STANDBY</Text>
                    <Text style={styles.emptySubLabel}>새로운 미션이 곧 추가될 예정입니다.</Text>
                </View>
            )}
        </View>
    );
}

function QuestCard({ quest, onClaim }: { quest: Quest; onClaim?: (questId: string) => void }) {
    const [isClaiming, setIsClaiming] = useState(false);
    const percentage = (quest.progress / quest.requirement_count) * 100;

    const handleClaim = async () => {
        if (isClaiming) return;
        setIsClaiming(true);
        try {
            if (onClaim) {
                await onClaim(quest.id);
            }
        } catch (error) {
            console.error('Failed to claim reward:', error);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: quest.is_claimed ? 0.4 : 1, scale: 1 }}
            style={styles.questCard}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                    <View style={styles.iconContainer}>
                        {quest.is_completed ? (
                            <CheckCircle2 color="#4ECDC4" size={20} />
                        ) : (
                            <Circle color="#5C5552" size={20} />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.questTitle}>{quest.title_ko || quest.title}</Text>
                        <Text style={styles.questDesc}>{quest.description}</Text>
                    </View>
                </View>
                
                <View style={styles.rewardInfo}>
                    <View style={styles.xpRow}>
                        <Star color="#C9A227" size={10} fill="#C9A227" />
                        <Text style={styles.xpText}>+{quest.xp_reward} XP</Text>
                    </View>
                    <Text style={styles.progressText}>{quest.progress} / {quest.requirement_count}</Text>
                </View>
            </View>

            {quest.is_completed && !quest.is_claimed ? (
                <TouchableOpacity 
                    onPress={handleClaim}
                    disabled={isClaiming}
                    style={styles.claimButton}
                >
                    {isClaiming ? (
                        <ActivityIndicator color="#000" size="small" />
                    ) : (
                        <Text style={styles.claimButtonText}>보상 받기 (CLAIM_REWARD)</Text>
                    )}
                </TouchableOpacity>
            ) : (
                !quest.is_completed && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressBg}>
                            <MotiView 
                                from={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ type: 'timing', duration: 800 }}
                                style={styles.progressFill}
                            />
                        </View>
                    </View>
                )
            )}
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    headerTitle: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    grid: {
        gap: 16,
    },
    questCard: {
        backgroundColor: '#141210',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardInfo: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    iconContainer: {
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
        gap: 2,
    },
    questTitle: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 18,
    },
    questDesc: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 11,
        lineHeight: 16,
    },
    rewardInfo: {
        alignItems: 'flex-end',
        gap: 4,
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    xpText: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
    },
    progressText: {
        color: 'rgba(173, 166, 158, 0.4)',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
    },
    claimButton: {
        backgroundColor: '#C9A227',
        borderRadius: 8,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    claimButtonText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    progressSection: {
        marginTop: 16,
    },
    progressBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#C9A227',
        borderRadius: 2,
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: 0.5,
    },
    emptyLabel: {
        color: '#F7F2E9',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 4,
    },
    emptySubLabel: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 10,
    }
});
