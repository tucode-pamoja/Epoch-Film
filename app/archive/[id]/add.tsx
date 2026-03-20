import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase/mobile';
import { Camera, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddMemoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!caption || !image) {
            Alert.alert('알림', '이미지와 캡션을 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            // 1. Upload Image (Simplified for demo, usually needs bucket upload logic)
            // For now we'll just use the local URI or assume it's uploaded
            const filename = `${user.id}/${Date.now()}.jpg`;
            
            // Note: In real app, we need to upload to Supabase Storage here.
            // For now, let's just save the record to DB.
            
            const { error } = await supabase
                .from('memories')
                .insert({
                    bucket_id: id,
                    user_id: user.id,
                    caption,
                    media_url: image, // In production, this would be the storage public URL
                });

            if (error) throw error;

            Alert.alert('성공', '새 기록이 저장되었습니다.', [
                { text: '확인', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '저장 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ 
                presentation: 'modal',
                headerShown: true,
                title: 'NEW MOMENT',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <X color="#C9A227" size={24} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#C9A227" /> : <Check color="#C9A227" size={24} />}
                    </TouchableOpacity>
                )
            }} />

            <View style={styles.form}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Camera color="#C9A227" size={48} />
                            <Text style={styles.placeholderText}>장면 추가 (SELECT IMAGE)</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CAPTION</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이 장면을 한 줄로 기록해 주세요..."
                        placeholderTextColor="#5C5552"
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveButtonText}>필름에 기록하기 (SAVE TO FILM)</Text>
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
        padding: 20,
    },
    form: {
        gap: 24,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#141210',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A22733',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 4,
    },
    input: {
        backgroundColor: '#141210',
        borderRadius: 4,
        padding: 16,
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#C9A227',
        height: 54,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontFamily: 'JetBrains Mono',
        letterSpacing: 1,
    }
});
