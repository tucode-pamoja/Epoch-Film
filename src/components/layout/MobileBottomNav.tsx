import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Film, Telescope, User } from 'lucide-react-native';
import { MotiView } from 'moti';

export function MobileBottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { label: 'ARCHIVE', href: '/archive', icon: Film, id: 'archive' },
        { label: 'EXPLORE', href: '/explore', icon: Telescope, id: 'explore' },
        { label: 'DIRECTOR', href: '/profile', icon: User, id: 'profile' },
    ];

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <View style={styles.outerContainer}>
            <View style={styles.navContainer}>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navItem}
                            onPress={() => router.replace(item.href as any)}
                        >
                            {/* Active Background Highlight */}
                            {active && (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    style={styles.activeBackground}
                                />
                            )}

                            <View style={styles.iconContainer}>
                                <item.icon
                                    size={active ? 20 : 18}
                                    strokeWidth={active ? 2 : 1.5}
                                    color={active ? '#C9A227' : 'rgba(255, 255, 255, 0.4)'}
                                    style={active && styles.activeIconDropShadow}
                                />
                                <Text style={[
                                    styles.label,
                                    active ? styles.activeLabel : styles.inactiveLabel
                                ]}>
                                    {item.label}
                                </Text>
                            </View>

                            {/* Active Bottom Dot */}
                            {active && (
                                <MotiView
                                    from={{ opacity: 0, translateY: 10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    style={styles.activeDot}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 30, // Safely above bottom edge
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    navContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(5, 5, 5, 0.85)',
        borderRadius: 30,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    navItem: {
        position: 'relative',
        width: 80,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBackground: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        right: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconContainer: {
        alignItems: 'center',
        zIndex: 10,
    },
    activeIconDropShadow: {
        shadowColor: '#C9A227',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    label: {
        fontFamily: 'JetBrains Mono',
        fontSize: 7,
        letterSpacing: 2,
        marginTop: 4,
    },
    activeLabel: {
        color: 'rgba(201, 162, 39, 0.9)', // gold-film
    },
    inactiveLabel: {
        color: 'rgba(255, 255, 255, 0.0)', // hidden when inactive to match web
    },
    activeDot: {
        position: 'absolute',
        bottom: -4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C9A227',
        shadowColor: '#C9A227',
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
    }
});
