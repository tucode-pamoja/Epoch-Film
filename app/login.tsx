import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase/mobile';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

export default function LoginScreen() {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'LOGIN') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    Alert.alert('인증 실패', '잘못된 로그인 정보입니다.');
                    console.error(error);
                } else {
                    router.replace('/archive');
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    Alert.alert('가입 실패', error.message);
                } else {
                    Alert.alert('가입 완료', '이메일 확인 후 로그인해 주세요.');
                    setMode('LOGIN');
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '처리에 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                {/* Cinema Ticket Header */}
                <MotiView 
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={styles.header}
                >
                    <Text style={styles.subtitle}>접근 제한 구역 (ACCESS FORBIDDEN)</Text>
                    <Text style={styles.title}>The Archive</Text>
                    <Text style={styles.caption}>기록을 열람하기 위해 본인 인증이 필요합니다.</Text>
                </MotiView>

                {/* Form Section */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>사용자 식별 (EMAIL)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@domain.com"
                            placeholderTextColor="#555"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>액세스 키 (PASSWORD)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#555"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {mode === 'LOGIN' ? '인증하기 (Authenticate)' : '감독 등록 (Register)'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.footer} 
                    onPress={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                >
                    <Text style={styles.footerText}>
                        {mode === 'LOGIN' 
                            ? '계정이 없으신가요? (CREATE ACCOUNT)' 
                            : '이미 계정이 있으신가요? (GO TO LOGIN)'}
                    </Text>
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    inner: {
        flex: 1,
        padding: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
    },
    subtitle: {
        color: '#C9A22766',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
        letterSpacing: 4,
        marginBottom: 12,
    },
    title: {
        color: '#C9A227',
        fontSize: 48,
        fontFamily: 'Gowun Batang',
        letterSpacing: 2,
        marginBottom: 16,
    },
    caption: {
        color: '#A0A0A0',
        fontSize: 11,
        textAlign: 'center',
        fontFamily: 'Pretendard',
        letterSpacing: 1,
        lineHeight: 18,
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        gap: 10,
    },
    label: {
        color: '#A0A0A0',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
        letterSpacing: 2,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#141210',
        borderWidth: 1,
        borderColor: '#C9A22722',
        borderRadius: 4,
        height: 54,
        paddingHorizontal: 16,
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Pretendard',
    },
    button: {
        backgroundColor: '#C9A227',
        height: 54,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Pretendard',
        letterSpacing: 1,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: '#555',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
        letterSpacing: 2,
    },
});
