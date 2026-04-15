import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/authContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Reset Password', 'Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@e\.ntu\.edu\.sg$/i.test(trimmedEmail)) {
      Alert.alert('Reset Password', 'Please use a valid NTU email address (e.g. username@e.ntu.edu.sg).');
      return;
    }

    setLoading(true);
    const result = await resetPassword(trimmedEmail);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Reset Password Failed', result.error ?? 'Unable to send reset email right now.');
      return;
    }

    Alert.alert(
      'Reset Email Sent',
      `If an account exists for ${trimmedEmail}, Firebase has sent a password reset email.`,
      [{ text: 'Back to Login', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScreenHeader title="" leftIconName="arrow-back" onLeftPress={() => router.back()} className="px-0" />

      <View className="mt-6 flex-1">
        <Text className="mb-3 text-[32px] font-bold text-ntu-primary" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Forgot Password?
        </Text>
        <Text className="mb-10 text-[16px] leading-6 text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          Enter your NTU email address and we&apos;ll help you reset your password.
        </Text>

        <View className="mb-10 flex-row items-center border-b border-border-default pb-3">
          <Ionicons name="mail-outline" size={22} color={Theme.colors.icon.muted} style={{ marginRight: 12 }} />
          <TextField
            placeholder="username@e.ntu.edu.sg"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            containerClassName="flex-1"
            inputContainerClassName="border-0 px-0"
            hideShadow
          />
        </View>

        <PrimaryButton
          label="Send Reset Link"
          onPress={handleResetPassword}
          disabled={!email.trim()}
          loading={loading}
        />

        <TouchableOpacity className="mt-6 items-center" onPress={() => router.back()}>
          <Text className="text-[15px] text-text-muted" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            Back to login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
