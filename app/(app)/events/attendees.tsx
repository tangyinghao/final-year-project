import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AttendeesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const attendees = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    name: `Attendee ${i + 1}`,
    role: i % 2 === 0 ? 'Software Engineer' : 'Student',
    avatar: `https://i.pravatar.cc/150?u=attendee${i + 1}`
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Attendees (12)
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-2">
          {attendees.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              className="flex-row items-center px-5 py-3 border-b border-[#E5E5EA] active:bg-gray-50"
              // @ts-ignore
              onPress={() => router.push(`/profile/view/${user.id}`)}
            >
              <Image source={{ uri: user.avatar }} className="w-12 h-12 rounded-full bg-gray-200" />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-[16px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{user.name}</Text>
                <Text className="text-[13px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{user.role}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
