import { Link, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import NTULogo from '../assets/images/NTULogo.svg'
import { useAuth } from '@/context/authContext'

export default function signUp() {
  const router = useRouter();
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
    // TODO: Re-enable NTU email validation before production
    // Validate NTU email domain
    // const emailLower = email.trim().toLowerCase();
    // if (!emailLower.endsWith('@e.ntu.edu.sg') && !emailLower.endsWith('@ntu.edu.sg')) {
    //   Alert.alert('Sign Up', 'Please use your NTU email address (@e.ntu.edu.sg or @ntu.edu.sg).');
    //   return;
    // }
    if (!graduationYear.trim()) {
      Alert.alert('Sign Up', 'Please enter your graduation year.');
      return;
    }

    setLoading(true);
    const gradYear = graduationYear ? parseInt(graduationYear) : undefined;
    const result = await register(email.trim(), password, displayName.trim(), role, gradYear);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign Up Failed', result.error);
    }
    // on success, onAuthStateChanged will set isAuthenticated → _layout redirects
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{paddingHorizontal: wp(6)}} className="flex-1 items-center justify-start pt-16">
            <View style={{width: '100%', maxWidth: 420}} className="gap-4">
              <View className="items-center">
                <NTULogo width={wp(60)} height={hp(14)} />
              </View>

              <View className="gap-5">
                <View className="gap-4">
                  {/* Display Name */}
                  <View className="gap-1">
                    <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                      Full Name
                    </Text>
                    <View
                      style={{ height: hp(6), shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: {width: 0, height: 3}, shadowRadius: 6, elevation: 2 }}
                      className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                    >
                      <TextInput
                        style={{fontSize: hp(2)}}
                        className="flex-1 text-neutral-900"
                        placeholder="Jane Doe"
                        placeholderTextColor="#94a3b8"
                        value={displayName}
                        onChangeText={setDisplayName}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View className="gap-1">
                    <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                      NTU Email Address
                    </Text>
                    <View
                      style={{ height: hp(6), shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: {width: 0, height: 3}, shadowRadius: 6, elevation: 2 }}
                      className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                    >
                      <TextInput
                        style={{fontSize: hp(2)}}
                        className="flex-1 text-neutral-900"
                        placeholder="username@e.ntu.edu.sg"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View className="gap-1">
                    <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                      Password
                    </Text>
                    <View
                      style={{ height: hp(6), shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: {width: 0, height: 3}, shadowRadius: 6, elevation: 2 }}
                      className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                    >
                      <TextInput
                        style={{fontSize: hp(2)}}
                        className="flex-1 text-neutral-900"
                        placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                    </View>
                  </View>

                  {/* Role Selector */}
                  <View className="gap-1">
                    <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                      I am a...
                    </Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setRole('student')}
                        className={`flex-1 py-3 items-center rounded-xl border ${role === 'student' ? 'bg-[#121C5D] border-[#121C5D]' : 'bg-white border-neutral-300'}`}
                      >
                        <Text style={{fontSize: hp(1.9)}} className={`font-semibold ${role === 'student' ? 'text-white' : 'text-neutral-700'}`}>
                          Student
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setRole('alumni')}
                        className={`flex-1 py-3 items-center rounded-xl border ${role === 'alumni' ? 'bg-[#121C5D] border-[#121C5D]' : 'bg-white border-neutral-300'}`}
                      >
                        <Text style={{fontSize: hp(1.9)}} className={`font-semibold ${role === 'alumni' ? 'text-white' : 'text-neutral-700'}`}>
                          Alumni
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Graduation Year */}
                  <View className="gap-1">
                    <Text style={{fontSize: hp(2)}} className="text-neutral-700">
                      {role === 'alumni' ? 'Graduation Year' : 'Expected Graduation Year'}
                    </Text>
                    <View
                      style={{ height: hp(6), shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: {width: 0, height: 3}, shadowRadius: 6, elevation: 2 }}
                      className="flex-row items-center rounded-xl bg-white px-4 border border-neutral-300"
                    >
                      <TextInput
                        style={{fontSize: hp(2)}}
                        className="flex-1 text-neutral-900"
                        placeholder="e.g. 2026"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        value={graduationYear}
                        onChangeText={setGraduationYear}
                      />
                    </View>
                  </View>
                </View>

                <Pressable
                  style={{height: hp(6)}}
                  className="h-12 items-center justify-center rounded-xl bg-[#121C5D]"
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{fontSize: hp(2.1)}} className="text-white font-semibold">
                      Sign Up
                    </Text>
                  )}
                </Pressable>

                <View className="items-center gap-3 pb-8">
                  <View className="flex-row items-center gap-1">
                    <Text style={{fontSize: hp(1.6)}} className="text-neutral-600">
                      Already have an account?
                    </Text>
                    <Link href="/logIn" asChild>
                      <Pressable hitSlop={8}>
                        <Text style={{fontSize: hp(1.6)}} className="text-[#121C5D] font-semibold">
                          Log In
                        </Text>
                      </Pressable>
                    </Link>
                  </View>

                  <Link href="/forgotPassword" asChild>
                    <Pressable hitSlop={8}>
                      <Text style={{fontSize: hp(1.6)}} className="text-[#121C5D] font-semibold">
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
