import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import * as Haptics from 'expo-haptics';

interface MobileActionSlateProps {
    isOpen: boolean;
    onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MobileActionSlate({ isOpen, onComplete }: MobileActionSlateProps) {
    const [isClapped, setIsClapped] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClapped(false);
            
            // Strike moment - Extremely fast for snap feel
            const CLAP_TIME = 200; 
            const EXIT_TIME = 700; 

            const clapTimer = setTimeout(() => {
                setIsClapped(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, CLAP_TIME);

            const completeTimer = setTimeout(() => {
                onComplete();
            }, EXIT_TIME);

            return () => {
                clearTimeout(clapTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles.overlay}
                >
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'timing', duration: 250 }}
                        style={styles.slateContainer}
                    >
                        {/* Upper Part */}
                        <MotiView
                            animate={{ 
                                rotateX: isClapped ? '0deg' : '-45deg',
                                translateY: isClapped ? 0 : -10 
                            }}
                            transition={{ type: 'timing', duration: 150 }}
                            style={styles.upperPart}
                        >
                            <View style={styles.stripeContainer}>
                                {[...Array(6)].map((_, i) => (
                                    <View key={i} style={styles.stripe} />
                                ))}
                            </View>
                        </MotiView>

                        {/* Lower Part */}
                        <View style={styles.lowerPart}>
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.label}>PROD.</Text>
                                    <Text style={styles.value}>EPOCH FILM</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>SCENE</Text>
                                    <Text style={[styles.value, { color: '#C9A227' }]}>NEW ACTION</Text>
                                </View>
                            </View>

                            <View style={styles.center}>
                                <Text style={styles.actionLabel}>ACTION</Text>
                                <Text style={styles.actionText}>READY TO SHOOT</Text>
                            </View>

                            <View style={styles.footer}>
                                <View>
                                    <Text style={styles.label}>DATE</Text>
                                    <Text style={styles.smallValue}>{new Date().toISOString().split('T')[0]}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>DIRECTOR</Text>
                                    <Text style={[styles.smallValue, { color: '#C9A227' }]}>YOU</Text>
                                </View>
                            </View>
                        </View>
                    </MotiView>
                </MotiView>
            )}
        </AnimatePresence>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slateContainer: {
        width: SCREEN_WIDTH * 0.85,
        alignItems: 'center',
    },
    upperPart: {
        width: '100%',
        height: 60,
        backgroundColor: '#1A1A1A',
        borderBottomWidth: 4,
        borderBottomColor: '#000',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        overflow: 'hidden',
        transformOrigin: 'bottom',
    },
    stripeContainer: {
        flexDirection: 'row',
        gap: 20,
        transform: [{ skewX: '30deg' }, { translateX: -20 }],
    },
    stripe: {
        width: 40,
        height: 60,
        backgroundColor: '#FFF',
        opacity: 0.8,
    },
    lowerPart: {
        width: '100%',
        height: 180,
        backgroundColor: '#1A1A1A',
        borderTopWidth: 2,
        borderTopColor: '#000',
        padding: 20,
        justifyContent: 'space-between',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 8,
    },
    label: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'JetBrains Mono',
        fontSize: 7,
        letterSpacing: 2,
    },
    value: {
        color: '#FFF',
        fontFamily: 'Gowun Batang',
        fontSize: 12,
        letterSpacing: 2,
    },
    center: {
        alignItems: 'center',
        gap: 4,
    },
    actionLabel: {
        color: 'rgba(201, 162, 39, 0.4)',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: 4,
        textDecorationLine: 'underline',
    },
    actionText: {
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 20,
        letterSpacing: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 8,
    },
    smallValue: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
    }
});
