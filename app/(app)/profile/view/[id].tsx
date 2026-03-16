import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function UserProfileViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handleReportIssue = () => {
    router.push(`/profile/report/${id}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white z-10 border-b border-[#E5E5EA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1B1C62" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-black" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          Profile
        </Text>
        <TouchableOpacity onPress={handleReportIssue} className="w-10 items-end justify-center">
            <Ionicons name="alert-circle-outline" size={24} color="#D71440" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mentor Info Header */}
        <View className="items-center pt-8 pb-6 px-4 bg-[#F6F6F6] border-b border-[#E5E5EA]">
          <Image
            source={{ uri: `https://i.pravatar.cc/300?u=${id}` }}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-sm"
          />
          <Text className="text-[24px] font-bold text-black mb-1" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Alumni User</Text>
          <Text className="text-[16px] text-[#666666] mb-3 text-center" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>Senior Software Engineer at ABC</Text>
          
          <View className="flex-row bg-[#EBF4FE] px-3 py-1.5 rounded-full items-center">
            <Ionicons name="school" size={16} color="#1B1C62" />
            <Text className="text-[#1B1C62] text-[13px] font-bold ml-1.5" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>SCSE Class of 2018</Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="px-5 pt-6 pb-20">
          <Text className="text-[18px] font-bold text-black mb-3" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>About</Text>
          <Text className="text-[15px] text-[#666666] leading-6 mb-8" style={{ fontFamily: 'PlusJakartaSans-Regular' }}>
            I am passionate about helping students navigate their early careers in tech, specifically in algorithmic programming. Let's connect!
          </Text>

          <Text className="text-[18px] font-bold text-black mb-4" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Interests</Text>
          <View className="flex-row flex-wrap mb-8">
            {['React Native', 'Data Structures', 'UI/UX'].map(tag => (
              <View key={tag} className="bg-[#F6F6F6] border border-[#E5E5EA] px-4 py-2 rounded-full mr-3 mb-3">
                <Text className="text-[14px] text-[#333333]" style={{ fontFamily: 'PlusJakartaSans-Medium' }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="px-5 py-4 bg-white border-t border-[#E5E5EA]">
        <TouchableOpacity className="w-full bg-[#1B1C62] py-4 rounded-xl items-center justify-center">
          <Text className="text-white text-[16px] font-bold" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>Send a Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
