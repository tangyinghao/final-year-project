import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import NTULogo from '../assets/images/NTULogo.svg'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/authContext'

export default function LogIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login', 'Please enter email and password.');
      return;
    }
    if (!/^[^\s@]+@e\.ntu\.edu\.sg$/i.test(email.trim())) {
      Alert.alert('Login', 'Please use a valid NTU email address (e.g. username@e.ntu.edu.sg).');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={{ paddingHorizontal: wp(6) }} className="flex-1 items-center justify-start pt-24">
              <View style={{ width: '100%', maxWidth: 420 }} className="gap-6">
                <View className="items-center">
                  <NTULogo width={wp(70)} height={140} />
                </View>

                <View className="gap-4">
                  <TextField
                    label="Email Address"
                    placeholder="username@e.ntu.edu.sg"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TextField
                    label="Password"
                    placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <PrimaryButton label="Log In" onPress={handleLogin} loading={loading} />

                <View className="items-center gap-3 pb-8">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[14px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      Don&apos;t have an account?
                    </Text>
                    <Link href="/signUp" asChild>
                      <Pressable hitSlop={8}>
                        <Text className="text-[14px] font-semibold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>
                          Sign Up
                        </Text>
                      </Pressable>
                    </Link>
                  </View>

                  <Link href="/forgotPassword" asChild>
                    <Pressable hitSlop={8}>
                      <Text className="text-[14px] font-semibold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
