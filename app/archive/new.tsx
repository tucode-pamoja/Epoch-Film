import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { X, Check, Film, Target, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function NewBucketScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('ALL');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['TRAVEL', 'GROWTH', 'CAREER', 'LOVE', 'HEALTH', 'CULTURE', 'FOOD', 'OTHER'];

    const handleCreate = async () => {
        if (!title) {
            Alert.alert('알림', '시나리오 제목을 입력해 주세요.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const { data, error } = await supabase
                .from('buckets')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    category: category === 'ALL' ? 'OTHER' : category,
                    status: 'ACTIVE',
                    is_public: true,
                })
                .select()
                .single();

            if (error) throw error;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace(`/archive/${data.id}`);
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '시나리오 생성 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ 
                presentation: 'modal',
                headerShown: true,
                title: 'NEW SCENARIO',
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#C9A227',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <X color="#C9A227" size={24} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={handleCreate} disabled={loading}>
                        {loading ? <ActivityIndicator color="#C9A227" /> : <Check color="#C9A227" size={24} />}
                    </TouchableOpacity>
                )
            }} />

            <View style={styles.filmHeader}>
                <Film color="#C9A227" size={32} />
                <Text style={styles.headerTitle}>DIRECTOR'S SLATE</Text>
                <Text style={styles.headerSub}>당신의 새로운 인생 시나리오를 작성하세요.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>SCENE TITLE</Text>
                    <TextInput
                        style={styles.mainInput}
                        placeholder="이 장면의 제목은 무엇인가요?"
                        placeholderTextColor="#5C5552"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PRODUCTION CATEGORY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {categories.map(cat => (
                            <TouchableOpacity 
                                key={cat}
                                onPress={() => {
                                    setCategory(cat);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.categoryChipActive
                                ]}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    category === cat && styles.categoryTextActive
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>DIRECTOR'S NOTE</Text>
                    <TextInput
                        style={styles.areaInput}
                        placeholder="장면에 대한 상세한 설명을 적어주세요..."
                        placeholderTextColor="#5C5552"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.createButton, loading && styles.disabledButton]} 
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.createButtonText}>영화 제작 시작 (START PRODUCTION)</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    filmHeader: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
        backgroundColor: '#141210',
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(201, 162, 39, 0.1)',
    },
    headerTitle: {
        color: '#C9A227',
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        letterSpacing: 6,
    },
    headerSub: {
        color: '#5C5552',
        fontFamily: 'Pretendard',
        fontSize: 11,
        textAlign: 'center',
    },
    form: {
        gap: 32,
    },
    inputGroup: {
        gap: 12,
    },
    label: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 9,
        letterSpacing: 2,
    },
    mainInput: {
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201, 162, 39, 0.4)',
        paddingVertical: 12,
        color: '#F7F2E9',
        fontFamily: 'Gowun Batang',
        fontSize: 24,
    },
    categoryScroll: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(201, 162, 39, 0.2)',
        borderColor: '#C9A227',
    },
    categoryText: {
        color: '#5C5552',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 1,
    },
    categoryTextActive: {
        color: '#C9A227',
        fontWeight: 'bold',
    },
    areaInput: {
        backgroundColor: '#141210',
        borderRadius: 8,
        padding: 16,
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 14,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    createButton: {
        backgroundColor: '#C9A227',
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#C9A227',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    disabledButton: {
        opacity: 0.5,
    },
    createButtonText: {
        color: '#000',
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
