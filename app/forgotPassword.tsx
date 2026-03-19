import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center -ml-2">
          <Ionicons name="arrow-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8 pt-8"
      >
        <Text className="text-[32px] font-bold text-[#1B1C62] mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Reset Password
        </Text>
        <Text className="text-[16px] text-[#8E8E93] mb-10 leading-6" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
          Enter your registered NTU email address to receive a password reset link.
        </Text>

        {/* Email Input */}
        <View className="flex-row items-center border-b border-[#E5E5EA] pb-3 mb-10">
          <Ionicons name="mail-outline" size={22} color="#8E8E93" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 text-[16px] text-black ml-3"
            style={{ fontFamily: 'PlusJakartaSans-Regular' }}
            placeholder="NTU Email Address"
            placeholderTextColor="#8E8E93"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          className="w-full h-14 rounded-full items-center justify-center"
          style={{ 
            backgroundColor: email.trim() ? '#1B1C62' : '#E5E5EA',
            shadowColor: email.trim() ? '#1e3a8a' : 'transparent', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.2, 
            shadowRadius: 6, 
            elevation: email.trim() ? 4 : 0 
          }}
          disabled={!email.trim()}
          onPress={() => {
            // Placeholder: Firebase trigger would happen here.
            alert("Reset link sent!");
            router.back();
          }}
        >
          <Text className={`text-[16px] font-bold ${email.trim() ? 'text-white' : 'text-[#8E8E93]'}`} style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Send Reset Link
          </Text>
        </TouchableOpacity>


      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
