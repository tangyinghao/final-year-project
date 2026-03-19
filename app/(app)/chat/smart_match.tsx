import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const MATCHES = [
  {
    id: 1,
    name: 'Dr. Michael Tan',
    role: 'Software Eng @ Meta',
    type: 'Alumni 🎓',
    matchScore: '94%',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    reasons: ['Both from SCSE', 'Both into AI', 'Both play Badminton'],
  },
  {
    id: 2,
    name: 'Sarah Lim',
    role: 'CS Year 3 student',
    type: 'Student 📚',
    matchScore: '88%',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    reasons: ['Taking CZ3006 now', 'Both free on Wed', 'Both from NBS'],
  },
];

export default function SmartMatchResultsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Smart Match
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header Area */}
        <View className="items-center justify-center pt-8 pb-4">
          <View className="w-16 h-16 bg-[#EBF4FE] rounded-full items-center justify-center mb-3">
            <Ionicons name="sparkles" size={32} color="#1B1C62" />
          </View>
          <Text className="text-[20px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            We found 2 great matches for you!
          </Text>
        </View>

        {/* Match Cards */}
        <View className="px-5 pt-2">
          {MATCHES.map((match) => (
            <View key={match.id} className="bg-white border border-[#E5E5EA] rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-[#F2F2F7] px-3 py-1 rounded-full">
                  <Text className="text-[12px] text-[#4A4A4A] font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{match.type}</Text>
                </View>
                <View className="bg-[#EBF4FE] px-3 py-1 rounded-full border border-[#D0E6FC]">
                  <Text className="text-[12px] text-[#1B1C62] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{match.matchScore} Match</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <Image source={{ uri: match.avatar }} className="w-14 h-14 rounded-full bg-gray-200" />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>{match.name}</Text>
                  <Text className="text-[14px] text-[#8E8E93] mt-0.5" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{match.role}</Text>
                </View>
              </View>

              <Text className="text-[13px] text-[#8E8E93] uppercase mb-2 font-medium" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Why you matched:</Text>
              
              <View className="flex-row flex-wrap gap-2 mb-4">
                {match.reasons.map((reason, i) => (
                  <View key={i} className="bg-[#F8F9FA] px-3 py-1.5 rounded-full border border-[#E8ECEF] flex-row items-center">
                    <Ionicons name="sparkles-outline" size={12} color="#1B1C62" />
                    <Text className="text-[13px] text-[#4A4A4A] ml-1" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>{reason}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity 
                  className="flex-1 bg-[#1B1C62] py-3 rounded-xl items-center justify-center"
                  onPress={() => router.push(`/chat/${match.id}?name=${encodeURIComponent(match.name)}` as any)}
                >
                  <Text className="text-white font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Say Hi</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 border border-[#1B1C62] py-3 rounded-xl items-center justify-center"
                  onPress={() => router.push(`/profile/view/${match.id}` as any)}
                >
                  <Text className="text-[#1B1C62] font-bold text-[15px]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          className="items-center py-4 mb-4"
          onPress={() => Alert.alert('Refreshing...', 'Searching for new connections.')}
        >
          <Text className="text-[15px] font-bold text-[#1B1C62]" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Refresh Matches</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
