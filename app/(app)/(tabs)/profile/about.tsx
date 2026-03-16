import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          About MSCircle
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Logo and Version */}
        <View className="items-center justify-center pt-8 pb-6 border-b border-[#E5E5EA]">
          <View className="w-24 h-24 rounded-3xl bg-[#1B1C62] items-center justify-center shadow-sm shadow-blue-900/20 mb-4">
            <Ionicons name="planet" size={48} color="white" />
          </View>
          <Text className="text-[22px] font-bold text-[#1B1C62] mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>MSCircle</Text>
          <Text className="text-[14px] text-[#8E8E93]" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Version 1.0.0 (Build 42)</Text>
        </View>

        {/* Links Area */}
        <View className="pt-2">
          <TouchableOpacity className="flex-row items-center justify-between px-5 py-4 border-b border-[#E5E5EA] active:bg-gray-50">
            <Text className="text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between px-5 py-4 border-b border-[#E5E5EA] active:bg-gray-50">
            <Text className="text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-5 py-4 border-b border-[#E5E5EA] active:bg-gray-50">
            <Text className="text-[16px] text-black" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Open Source Libraries</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View className="px-5 pt-8 pb-10 items-center">
          <Text className="text-[14px] text-[#8E8E93] text-center leading-5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            Built for NTU EEE MSc Students and Alumni.{'\n'}Designed to foster connections and empower careers.
          </Text>
          <Text className="text-[13px] text-[#C7C7CC] mt-6" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>
            © 2026 Nanyang Technological University.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
