import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import NTULogo from '../assets/images/NTULogo.svg'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/context/authContext'

export default function SignUp() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'alumni'>('student');
  const [graduationYear, setGraduationYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      Alert.alert('Sign Up', 'Please fill in all required fields.');
      return;
    }
    if (role === 'alumni' && !graduationYear.trim()) {
      Alert.alert('Sign Up', 'Please enter your graduation year.');
      return;
    }

    setLoading(true);
    const gradYear = role === 'alumni' && graduationYear ? parseInt(graduationYear) : undefined;
    const result = await register(email.trim(), password, displayName.trim(), role, gradYear);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ paddingHorizontal: wp(6) }} className="flex-1 items-center justify-start pt-16">
              <View style={{ width: '100%', maxWidth: 420 }} className="gap-5">
                <View className="items-center">
                  <NTULogo width={wp(60)} height={110} />
                </View>

                <View className="gap-4">
                  <TextField label="Full Name" placeholder="Jane Doe" value={displayName} onChangeText={setDisplayName} />
                  <TextField
                    label="NTU Email Address"
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

                  <View className="gap-1">
                    <Text className="text-[16px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
                      I am a...
                    </Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setRole('student')}
                        className={`flex-1 items-center rounded-xl border py-3 ${role === 'student' ? 'border-ntu-primary bg-ntu-primary' : 'border-border-default bg-white'}`}>
                        <Text className={`text-[15px] font-semibold ${role === 'student' ? 'text-white' : 'text-text-secondary'}`} style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>
                          Student
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setRole('alumni')}
                        className={`flex-1 items-center rounded-xl border py-3 ${role === 'alumni' ? 'border-ntu-primary bg-ntu-primary' : 'border-border-default bg-white'}`}>
                        <Text className={`text-[15px] font-semibold ${role === 'alumni' ? 'text-white' : 'text-text-secondary'}`} style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>
                          Alumni
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {role === 'alumni' ? (
                    <TextField
                      label="Graduation Year"
                      placeholder="e.g. 2024"
                      keyboardType="number-pad"
                      value={graduationYear}
                      onChangeText={setGraduationYear}
                    />
                  ) : null}
                </View>

                <PrimaryButton label="Sign Up" onPress={handleSignUp} loading={loading} />

                <View className="items-center gap-3 pb-8">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[14px] text-text-secondary" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
                      Already have an account?
                    </Text>
                    <Link href="/logIn" asChild>
                      <Pressable hitSlop={8}>
                        <Text className="text-[14px] font-semibold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>
                          Log In
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
