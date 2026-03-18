import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, useAnimationState } from 'moti';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface CinematicSlateProps {
    visible: boolean;
    title?: string;
    onComplete?: () => void;
}

export function CinematicSlate({ visible, title = "SCENE 1", onComplete }: CinematicSlateProps) {
    const slateAnimation = useAnimationState({
        hidden: {
            top: -height / 2,
            bottom: -height / 2,
            opacity: 0,
        },
        closing: {
            top: 0,
            bottom: 0,
            opacity: 1,
        },
        snapped: {
            scale: 1.05,
        }
    });

    useEffect(() => {
        if (visible) {
            slateAnimation.transitionTo('closing');

            // Haptic feedback at the "Snap" moment
            const snapTimer = setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                slateAnimation.transitionTo('snapped');
            }, 400);

            const completeTimer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);

            return () => {
                clearTimeout(snapTimer);
                clearTimeout(completeTimer);
            };
        } else {
            slateAnimation.transitionTo('hidden');
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {/* Top Part of Slate */}
            <MotiView
                state={slateAnimation}
                transition={{ type: 'spring', damping: 15 }}
                style={[styles.slatePart, styles.topPart]}
            >
                <View style={styles.sprocketHoles}>
                    {[1, 2, 3, 4, 5].map(i => <View key={i} style={styles.hole} />)}
                </View>
                <Text style={styles.slateText}>EP. FILM</Text>
            </MotiView>

            {/* Bottom Part of Slate */}
            <MotiView
                state={slateAnimation}
                transition={{ type: 'spring', damping: 15 }}
                style={[styles.slatePart, styles.bottomPart]}
            >
                <Text style={styles.titleText}>{title}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.smallText}>TAKE: 01</Text>
                    <Text style={styles.smallText}>ROLL: A</Text>
                </View>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slatePart: {
        width: '100%',
        height: height / 2,
        backgroundColor: '#141210',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C9A22733',
    },
    topPart: {
        borderBottomWidth: 4,
        borderBottomColor: '#C9A227',
    },
    bottomPart: {
        borderTopWidth: 4,
        borderTopColor: '#C9A227',
    },
    slateText: {
        color: '#E8D5A3',
        fontFamily: 'JetBrains Mono',
        fontSize: 32,
        letterSpacing: 8,
        fontWeight: 'bold',
    },
    titleText: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 24,
        marginTop: 20,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 20,
    },
    smallText: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
    },
    sprocketHoles: {
        position: 'absolute',
        top: 20,
        flexDirection: 'row',
        gap: 20,
    },
    hole: {
        width: 15,
        height: 10,
        backgroundColor: '#0A0908',
        borderRadius: 2,
    }
});
