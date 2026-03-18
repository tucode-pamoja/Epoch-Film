import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Film, Image as ImageIcon, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase/mobile';
import { CinematicSlate } from '@/components/ui/CinematicSlate';
import { extractCinematicMetadata, generateAutoNarration } from '@/utils/exif-mobile';

export default function AddMemoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSlate, setShowSlate] = useState(false);

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            exif: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setImage(asset);

            const metadata = await extractCinematicMetadata(asset);
            const narration = generateAutoNarration(metadata);
            setCaption(prev => prev ? `${prev}\n\n${narration}` : narration);
        }
    }

    async function takePhoto() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            exif: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setImage(asset);

            const metadata = await extractCinematicMetadata(asset);
            const narration = generateAutoNarration(metadata);
            setCaption(prev => prev ? `${prev}\n\n${narration}` : narration);
        }
    }

    async function handleSubmit() {
        if (!caption.trim()) {
            Alert.alert('알림', '추억의 한 문장을 입력해 주세요.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Unauthorized');

            // Note: Image upload logic would go here in a full implementation
            // For now, we just insert the record
            const { error } = await supabase
                .from('memories')
                .insert({
                    bucket_id: id,
                    user_id: user.id,
                    caption: caption,
                    media_type: 'IMAGE',
                    media_url: image?.uri || null,
                    captured_at: new Date().toISOString(),
                });

            if (error) throw error;
            setShowSlate(true);

        } catch (error: any) {
            Alert.alert('오류', error.message);
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'NEW SCENE',
                headerShown: true,
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#C9A227',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <X color="#C9A227" size={24} />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputSection}>
                    <Text style={styles.label}>SCREENPLAY (CAPTION)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="이 순간을 영화의 대사나 지명처럼 기록해 보세요..."
                        placeholderTextColor="#5C5552"
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                    />
                </View>

                <View style={styles.mediaSection}>
                    <Text style={styles.label}>PRODUCTION DESIGN (MEDIA)</Text>
                    {image ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
                                <X color="#FFF" size={16} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadOptions}>
                            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                                <ImageIcon color="#C9A22766" size={24} />
                                <Text style={styles.uploadText}>GALLERY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadBox} onPress={takePhoto}>
                                <Camera color="#C9A22766" size={24} />
                                <Text style={styles.uploadText}>CAMERA</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Film color="#000" size={20} />
                                <Text style={styles.submitButtonText}>필름 기록하기</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CinematicSlate
                visible={showSlate}
                title="RECORDED"
                onComplete={() => {
                    setShowSlate(false);
                    router.back();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        padding: 24,
    },
    inputSection: {
        marginBottom: 32,
    },
    mediaSection: {
        marginBottom: 32,
    },
    label: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 12,
    },
    textInput: {
        color: '#F7F2E9',
        fontFamily: 'Pretendard',
        fontSize: 18,
        lineHeight: 28,
        minHeight: 120,
        textAlignVertical: 'top',
        backgroundColor: '#141210',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#C9A2271A',
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadBox: {
        flex: 1,
        height: 100,
        backgroundColor: '#141210',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C9A22733',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        color: '#C9A22766',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        letterSpacing: 2,
    },
    previewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 20,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C9A227',
        height: 56,
        borderRadius: 28,
        gap: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#000',
        fontFamily: 'Pretendard',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
